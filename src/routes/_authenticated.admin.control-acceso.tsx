import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fingerprint, KeyRound, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/control-acceso")({ component: ControlAcceso });

type Resultado = { tipo: "ok" | "denied" | "expired" | "pin_ok" | "pin_fail"; nombre?: string; mensaje: string } | null;

function ControlAcceso() {
  const [dispositivoId, setDispositivoId] = useState<string>("");
  const [dispositivos, setDispositivos] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");
  const [dni, setDni] = useState("");
  const [result, setResult] = useState<Resultado>(null);

  useEffect(() => {
    supabase.from("dispositivos").select("*").then(({ data }) => {
      setDispositivos(data ?? []);
      if (data?.[0]) setDispositivoId(data[0].id);
    });
  }, []);

  const disp = dispositivos.find((d) => d.id === dispositivoId);

  const registrar = async (payload: any) => {
    await supabase.from("asistencias").insert({ ...payload, dispositivo_id: dispositivoId } as any);
  };

  const simularBiometrico = async () => {
    setResult(null);
    if (!disp) return;
    if (disp.estado === "caido" || disp.forzar_pin) {
      setShowPin(true);
      setResult({ tipo: "denied", mensaje: "Lector no disponible. Use PIN o DNI." });
      return;
    }
    setScanning(true);
    await new Promise((r) => setTimeout(r, 1400));
    // Pick random active membership
    const { data: m } = await supabase.from("membresias").select("*, profiles!inner(nombre)").eq("estado", "activa").gte("fecha_fin", new Date().toISOString().slice(0, 10)).limit(20);
    setScanning(false);
    if (!m || m.length === 0) {
      setResult({ tipo: "denied", mensaje: "No se reconoce la huella." });
      await registrar({ estado: "denegado", metodo: "biometric", motivo: "Huella no reconocida" });
      return;
    }
    const pick: any = m[Math.floor(Math.random() * m.length)];
    setResult({ tipo: "ok", nombre: pick.profiles?.nombre, mensaje: "Acceso permitido" });
    await registrar({ user_id: pick.user_id, estado: "permitido", metodo: "biometric" });
  };

  const validarPin = async () => {
    if (!pin) return;
    const { data } = await supabase.from("pines_emergencia").select("*, profiles!inner(nombre)").eq("pin", pin).eq("activo", true).maybeSingle();
    if (!data) {
      setResult({ tipo: "pin_fail", mensaje: "PIN inválido" });
      await registrar({ estado: "denegado", metodo: "pin", motivo: "PIN incorrecto" });
      return;
    }
    const uid = (data as any).user_id;
    setResult({ tipo: "pin_ok", nombre: (data as any).profiles?.nombre, mensaje: "Acceso por contingencia (PIN)" });
    await registrar({ user_id: uid, estado: "permitido", metodo: "pin" });
    await supabase.from("alertas").insert({ tipo: "contingencia", canal: "sistema", mensaje: `Ingreso por PIN: ${(data as any).profiles?.nombre}` } as any);
    setPin("");
    setShowPin(false);
  };

  const validarDni = async () => {
    if (!dni) return;
    const { data: p } = await supabase.from("profiles").select("id, nombre").eq("dni", dni).maybeSingle();
    if (!p) {
      const { data: v } = await supabase.from("visitantes").select("*").eq("dni", dni).eq("fecha_visita", new Date().toISOString().slice(0, 10)).maybeSingle();
      if (v) {
        setResult({ tipo: "ok", nombre: v.nombre, mensaje: "Acceso de visitante" });
        await registrar({ estado: "permitido", metodo: "dni", dni, visitante_id: v.id });
        await supabase.from("visitantes").update({ acceso_usado: true } as any).eq("id", v.id);
      } else {
        setResult({ tipo: "denied", mensaje: "DNI no registrado" });
        await registrar({ estado: "denegado", metodo: "dni", dni });
      }
      setDni("");
      return;
    }
    const { data: m } = await supabase.from("membresias").select("*").eq("user_id", p.id).eq("estado", "activa").gte("fecha_fin", new Date().toISOString().slice(0, 10)).maybeSingle();
    if (!m) {
      setResult({ tipo: "expired", nombre: p.nombre, mensaje: "Membresía vencida o inactiva" });
      await registrar({ user_id: p.id, estado: "denegado", metodo: "dni", motivo: "Sin membresía" });
    } else {
      setResult({ tipo: "ok", nombre: p.nombre, mensaje: "Acceso permitido (DNI)" });
      await registrar({ user_id: p.id, estado: "permitido", metodo: "dni" });
    }
    setDni("");
  };

  const r = result;

  return (
    <AdminShell title="Control de acceso" subtitle="Simulación biométrica + contingencia">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface rounded-xl p-8 text-center">
          <div className="mb-4 flex justify-center gap-2">
            <Label className="text-xs uppercase text-muted-foreground">Terminal</Label>
            <select value={dispositivoId} onChange={(e) => setDispositivoId(e.target.value)} className="rounded border border-border bg-card px-2 py-1 text-sm">
              {dispositivos.map((d) => <option key={d.id} value={d.id}>{d.nombre} — {d.estado}</option>)}
            </select>
          </div>
          <div className={`relative mx-auto flex h-44 w-44 items-center justify-center rounded-full border-4 ${scanning ? "border-primary animate-pulse" : "border-border"}`}>
            <Fingerprint className={`h-24 w-24 ${scanning ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <Button onClick={simularBiometrico} disabled={scanning} className="mt-6" size="lg">
            {scanning ? "Leyendo..." : "Simular huella"}
          </Button>
          <Button variant="outline" onClick={() => setShowPin((v) => !v)} className="mt-3 ml-2" size="lg">
            <KeyRound className="mr-2 h-4 w-4" /> Usar PIN / DNI
          </Button>

          {showPin && (
            <div className="mt-6 space-y-3 text-left">
              <div className="flex gap-2">
                <Input placeholder="PIN de contingencia" value={pin} onChange={(e) => setPin(e.target.value)} />
                <Button onClick={validarPin}>Validar PIN</Button>
              </div>
              <div className="flex gap-2">
                <Input placeholder="DNI" value={dni} onChange={(e) => setDni(e.target.value)} maxLength={8} />
                <Button variant="outline" onClick={validarDni}>Validar DNI</Button>
              </div>
            </div>
          )}
        </div>

        <div className="surface rounded-xl p-8">
          <h2 className="font-display text-lg uppercase">Resultado</h2>
          {!r && <p className="mt-6 text-muted-foreground">Esperando lectura...</p>}
          {r && (
            <div className={`mt-6 rounded-xl border p-6 ${
              r.tipo === "ok" || r.tipo === "pin_ok" ? "border-emerald-500/40 bg-emerald-500/10" :
              r.tipo === "expired" ? "border-amber-500/40 bg-amber-500/10" :
              "border-destructive/40 bg-destructive/10"
            }`}>
              {r.tipo === "ok" || r.tipo === "pin_ok" ? <CheckCircle2 className="h-12 w-12 text-emerald-400" /> :
               r.tipo === "expired" ? <AlertTriangle className="h-12 w-12 text-amber-400" /> :
               <XCircle className="h-12 w-12 text-destructive" />}
              <p className="mt-4 font-display text-2xl uppercase">{r.mensaje}</p>
              {r.nombre && <p className="mt-1 text-muted-foreground">{r.nombre}</p>}
              <p className="mt-2 text-xs text-muted-foreground">{new Date().toLocaleString("es-PE")}</p>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}