import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Activity, CheckCircle2, XCircle, HardDrive, Bell } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState({ socios: 0, hoy: 0, denegados: 0, dispositivos: 0 });
  const [feed, setFeed] = useState<any[]>([]);
  const [devs, setDevs] = useState<any[]>([]);
  const [alertas, setAlertas] = useState<any[]>([]);

  const loadAll = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const [{ count: socios }, { count: hoy }, { count: denegados }, { data: dvs }, { data: feedData }, { data: al }] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("asistencias").select("id", { count: "exact", head: true }).gte("fecha_hora", today + "T00:00:00"),
      supabase.from("asistencias").select("id", { count: "exact", head: true }).eq("estado", "denegado").gte("fecha_hora", today + "T00:00:00"),
      supabase.from("dispositivos").select("*"),
      supabase.from("asistencias").select("*").order("fecha_hora", { ascending: false }).limit(10),
      supabase.from("alertas").select("*").order("fecha", { ascending: false }).limit(5),
    ]);
    setStats({ socios: socios ?? 0, hoy: hoy ?? 0, denegados: denegados ?? 0, dispositivos: dvs?.length ?? 0 });
    setDevs(dvs ?? []); setFeed(feedData ?? []); setAlertas(al ?? []);
  };

  useEffect(() => {
    loadAll();
    const ch = supabase
      .channel("admin-dash")
      .on("postgres_changes", { event: "*", schema: "public", table: "asistencias" }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "dispositivos" }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "alertas" }, () => loadAll())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <AdminShell title="Dashboard" subtitle="Monitoreo en tiempo real">
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi icon={Users} label="Socios" value={stats.socios} />
        <Kpi icon={Activity} label="Ingresos hoy" value={stats.hoy} accent />
        <Kpi icon={XCircle} label="Denegados hoy" value={stats.denegados} />
        <Kpi icon={HardDrive} label="Dispositivos" value={stats.dispositivos} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="surface rounded-xl p-6 lg:col-span-2">
          <h2 className="mb-4 font-display text-lg uppercase">Feed de accesos</h2>
          <div className="divide-y divide-border">
            {feed.length === 0 && <p className="text-sm text-muted-foreground">Sin actividad reciente.</p>}
            {feed.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-muted-foreground">{new Date(a.fecha_hora).toLocaleTimeString("es-PE")}</span>
                <span className="text-xs uppercase">{a.metodo}</span>
                {a.estado === "permitido"
                  ? <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Permitido</span>
                  : <span className="flex items-center gap-1 text-destructive"><XCircle className="h-4 w-4" /> Denegado</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="surface rounded-xl p-6">
            <h2 className="mb-4 font-display text-lg uppercase">Dispositivos</h2>
            <ul className="space-y-2 text-sm">
              {devs.map((d) => (
                <li key={d.id} className="flex items-center justify-between">
                  <span>{d.nombre}</span>
                  <span className={`rounded px-2 py-0.5 text-xs ${
                    d.estado === "activo" ? "bg-emerald-500/20 text-emerald-400" :
                    d.estado === "mantenimiento" ? "bg-amber-500/20 text-amber-400" :
                    "bg-destructive/20 text-destructive"}`}>{d.estado}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="surface rounded-xl p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg uppercase"><Bell className="h-4 w-4 text-primary" /> Alertas</h2>
            <ul className="space-y-2 text-sm">
              {alertas.length === 0 && <li className="text-muted-foreground">Sin alertas.</li>}
              {alertas.map((a) => (
                <li key={a.id} className="rounded border border-border p-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{a.tipo}</p>
                  <p>{a.mensaje}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function Kpi({ icon: Icon, label, value, accent }: any) {
  return (
    <div className={`surface rounded-xl p-6 ${accent ? "neon-border" : ""}`}>
      <Icon className={`h-6 w-6 ${accent ? "text-primary" : "text-muted-foreground"}`} />
      <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-display text-3xl">{value}</p>
    </div>
  );
}