import { createFileRoute } from "@tanstack/react-router";
import { UserShell } from "@/components/user-shell";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Fingerprint, KeyRound } from "lucide-react";

export const Route = createFileRoute("/_authenticated/asistencias")({ component: Asistencias });

function Asistencias() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("asistencias").select("*").eq("user_id", user.id).order("fecha_hora", { ascending: false }).limit(60)
      .then(({ data }) => setList(data ?? []));
  }, [user]);

  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    const hit = list.some((a) => a.fecha_hora?.slice(0, 10) === key && a.estado === "permitido");
    return { d, key, hit };
  });

  return (
    <UserShell title="Mis asistencias">
      <div className="surface mb-6 rounded-xl p-6">
        <h2 className="mb-4 font-display text-lg uppercase">Últimos 30 días</h2>
        <div className="grid grid-cols-10 gap-2 md:grid-cols-15">
          {days.map((d) => (
            <div key={d.key} title={d.key}
              className={`flex h-10 items-center justify-center rounded text-xs ${d.hit ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {d.d.getDate()}
            </div>
          ))}
        </div>
      </div>
      <div className="surface rounded-xl p-6">
        <h2 className="mb-4 font-display text-lg uppercase">Historial</h2>
        <div className="divide-y divide-border">
          {list.length === 0 && <p className="text-sm text-muted-foreground">Sin registros.</p>}
          {list.map((a) => (
            <div key={a.id} className="flex items-center justify-between py-3 text-sm">
              <div className="flex items-center gap-3">
                {a.metodo === "pin" ? <KeyRound className="h-4 w-4 text-amber-400" /> : <Fingerprint className="h-4 w-4 text-primary" />}
                <span>{new Date(a.fecha_hora).toLocaleString("es-PE")}</span>
              </div>
              {a.estado === "permitido" ? (
                <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Permitido</span>
              ) : (
                <span className="flex items-center gap-1 text-destructive"><XCircle className="h-4 w-4" /> Denegado</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </UserShell>
  );
}