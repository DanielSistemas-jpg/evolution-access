import { createFileRoute, Link } from "@tanstack/react-router";
import { UserShell } from "@/components/user-shell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CalendarCheck, CreditCard, Flame, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user, profile } = useAuth();
  const [membership, setMembership] = useState<any>(null);
  const [stats, setStats] = useState({ asistencias: 0, ultima: null as string | null });
  const [eventos, setEventos] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: m } = await supabase
        .from("membresias").select("*")
        .eq("user_id", user.id).eq("estado", "activa")
        .order("fecha_fin", { ascending: false }).limit(1).maybeSingle();
      setMembership(m);
      const { data: a, count } = await supabase
        .from("asistencias").select("fecha_hora", { count: "exact" })
        .eq("user_id", user.id).order("fecha_hora", { ascending: false }).limit(1);
      setStats({ asistencias: count ?? 0, ultima: a?.[0]?.fecha_hora ?? null });
      const { data: ev } = await supabase
        .from("eventos").select("*").eq("publicado", true).order("fecha").limit(3);
      setEventos(ev ?? []);
    })();
  }, [user]);

  const dias = membership?.fecha_fin
    ? Math.max(0, Math.ceil((new Date(membership.fecha_fin).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <UserShell title={`Hola, ${profile?.nombre ?? "atleta"}`}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card icon={CreditCard} label="Membresía" value={membership ? String(membership.plan).toUpperCase() : "Sin membresía"}
              hint={dias != null ? `${dias} días restantes` : "Adquiere un plan"} accent={!membership || (dias != null && dias < 5)} />
        <Card icon={CalendarCheck} label="Asistencias" value={String(stats.asistencias)}
              hint={stats.ultima ? `Última: ${new Date(stats.ultima).toLocaleDateString("es-PE")}` : "Sin registros"} />
        <Card icon={Flame} label="Estado" value={membership?.estado === "activa" ? "Activa" : "Inactiva"}
              hint={membership?.estado === "activa" ? "Disfruta el gym" : "Renueva tu plan"} accent={membership?.estado !== "activa"} />
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="surface rounded-xl p-6">
          <h2 className="font-display text-lg uppercase">Tu plan</h2>
          {membership ? (
            <div className="mt-4 space-y-2 text-sm">
              <p><span className="text-muted-foreground">Plan:</span> {membership.plan}</p>
              <p><span className="text-muted-foreground">Desde:</span> {new Date(membership.fecha_inicio).toLocaleDateString("es-PE")}</p>
              <p><span className="text-muted-foreground">Hasta:</span> {new Date(membership.fecha_fin).toLocaleDateString("es-PE")}</p>
              <Button asChild className="mt-4"><Link to="/membresia">Renovar</Link></Button>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Aún no tienes una membresía activa.</p>
              <Button asChild className="mt-4"><Link to="/membresia">Comprar membresía</Link></Button>
            </div>
          )}
        </div>
        <div className="surface rounded-xl p-6">
          <h2 className="font-display text-lg uppercase">Próximos eventos</h2>
          <ul className="mt-4 space-y-3">
            {eventos.length === 0 && <li className="text-sm text-muted-foreground">Sin eventos.</li>}
            {eventos.map((e) => (
              <li key={e.id} className="flex items-start gap-3 rounded-md border border-border p-3">
                <CalendarDays className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">{e.titulo}</p>
                  <p className="text-xs text-muted-foreground">{new Date(e.fecha).toLocaleDateString("es-PE")}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </UserShell>
  );
}

function Card({ icon: Icon, label, value, hint, accent }: any) {
  return (
    <div className={`surface rounded-xl p-6 ${accent ? "neon-border" : ""}`}>
      <Icon className={`h-6 w-6 ${accent ? "text-primary" : "text-muted-foreground"}`} />
      <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-display text-2xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}