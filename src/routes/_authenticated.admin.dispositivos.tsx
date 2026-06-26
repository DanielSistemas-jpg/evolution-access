import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { HardDrive, Power, KeyRound, Wrench, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/dispositivos")({ component: Dispositivos });

function Dispositivos() {
  const [list, setList] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const load = async () => {
    const [{ data: d }, { data: l }] = await Promise.all([
      supabase.from("dispositivos").select("*").order("nombre"),
      supabase.from("logs_hardware").select("*").order("fecha", { ascending: false }).limit(20),
    ]);
    setList(d ?? []); setLogs(l ?? []);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("dev-mon")
      .on("postgres_changes", { event: "*", schema: "public", table: "dispositivos" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const setEstado = async (id: string, estado: string, nombre: string) => {
    await supabase.from("dispositivos").update({ estado } as any).eq("id", id);
    await supabase.from("logs_hardware").insert({ dispositivo_id: id, tipo: "estado", mensaje: `Estado cambiado a ${estado}`, severidad: estado === "caido" ? "critical" : "info" } as any);
    if (estado === "caido") await supabase.from("alertas").insert({ tipo: "dispositivo_caido", canal: "sistema", mensaje: `Lector "${nombre}" reportado como caído` } as any);
    toast.success("Estado actualizado");
  };

  const togglePin = async (id: string, val: boolean) => {
    await supabase.from("dispositivos").update({ forzar_pin: val } as any).eq("id", id);
    await supabase.from("logs_hardware").insert({ dispositivo_id: id, tipo: "config", mensaje: `forzar_pin=${val}` } as any);
    toast.success(val ? "Modo PIN forzado activo" : "Modo PIN forzado desactivado");
  };

  return (
    <AdminShell title="Dispositivos" subtitle="Monitoreo de hardware y consola">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((d) => (
          <div key={d.id} className="surface rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HardDrive className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">{d.nombre}</p>
                  <p className="text-xs text-muted-foreground">{d.ubicacion}</p>
                </div>
              </div>
              <span className={`rounded px-2 py-0.5 text-xs ${
                d.estado === "activo" ? "bg-emerald-500/20 text-emerald-400" :
                d.estado === "mantenimiento" ? "bg-amber-500/20 text-amber-400" :
                "bg-destructive/20 text-destructive"}`}>{d.estado}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setEstado(d.id, "activo", d.nombre)}><Power className="mr-1 h-3 w-3" />Activo</Button>
              <Button size="sm" variant="outline" onClick={() => setEstado(d.id, "mantenimiento", d.nombre)}><Wrench className="mr-1 h-3 w-3" />Mant.</Button>
              <Button size="sm" variant="destructive" onClick={() => setEstado(d.id, "caido", d.nombre)}><AlertCircle className="mr-1 h-3 w-3" />Simular caída</Button>
              <Button size="sm" variant={d.forzar_pin ? "default" : "outline"} onClick={() => togglePin(d.id, !d.forzar_pin)}>
                <KeyRound className="mr-1 h-3 w-3" />{d.forzar_pin ? "PIN forzado" : "Forzar PIN"}
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="surface mt-8 rounded-xl p-6">
        <h2 className="mb-4 font-display text-lg uppercase">Consola de diagnóstico</h2>
        <div className="rounded bg-black/60 p-4 font-mono text-xs text-emerald-300">
          {logs.length === 0 && <p className="text-muted-foreground">// sin logs</p>}
          {logs.map((l) => (
            <div key={l.id}>[{new Date(l.fecha).toLocaleTimeString("es-PE")}] [{l.severidad}] {l.tipo}: {l.mensaje}</div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}