import { createFileRoute } from "@tanstack/react-router";
import { UserShell } from "@/components/user-shell";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/membresia")({ component: Membresia });

const PLANES = [
  { plan: "diario", precio: 15, dias: 1, beneficios: ["Acceso por 1 día"] },
  { plan: "mensual", precio: 90, dias: 30, beneficios: ["Acceso ilimitado", "Clases grupales"] },
  { plan: "trimestral", precio: 240, dias: 90, beneficios: ["Acceso ilimitado", "Clases grupales", "1 evaluación física"] },
  { plan: "anual", precio: 850, dias: 365, beneficios: ["Todo incluido", "Plan de entrenamiento", "Asesoría nutricional"] },
];

function Membresia() {
  const { user } = useAuth();
  const [actual, setActual] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("membresias").select("*").eq("user_id", user.id).order("fecha_fin", { ascending: false }).limit(1).maybeSingle();
    setActual(data);
  };
  useEffect(() => { load(); }, [user]);

  const comprar = async (p: typeof PLANES[number]) => {
    if (!user) return;
    setLoading(true);
    const inicio = new Date();
    const fin = new Date(); fin.setDate(fin.getDate() + p.dias);
    const { data: nuevaMem, error } = await supabase.from("membresias").insert({
      user_id: user.id, plan: p.plan, precio: p.precio,
      fecha_inicio: inicio.toISOString().slice(0, 10),
      fecha_fin: fin.toISOString().slice(0, 10),
      estado: "activa",
    } as any).select().single();
    if (!error && nuevaMem) await supabase.from("pagos").insert({ user_id: user.id, membresia_id: nuevaMem.id, monto: p.precio, concepto: `Membresía ${p.plan}` } as any);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("¡Membresía activada!");
    load();
  };

  return (
    <UserShell title="Membresías">
      {actual && (
        <div className="surface neon-border mb-6 rounded-xl p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Plan actual</p>
          <p className="font-display text-2xl">{String(actual.plan).toUpperCase()}</p>
          <p className="text-sm text-muted-foreground">Vence el {new Date(actual.fecha_fin).toLocaleDateString("es-PE")}</p>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-4">
        {PLANES.map((p) => (
          <div key={p.plan} className="surface flex flex-col rounded-xl p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.plan}</p>
            <p className="font-display text-3xl text-primary">S/ {p.precio}</p>
            <p className="text-xs text-muted-foreground">{p.dias} días</p>
            <ul className="my-4 flex-1 space-y-2 text-sm">
              {p.beneficios.map((b) => (
                <li key={b} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />{b}</li>
              ))}
            </ul>
            <Button onClick={() => comprar(p)} disabled={loading}>Adquirir</Button>
          </div>
        ))}
      </div>
    </UserShell>
  );
}