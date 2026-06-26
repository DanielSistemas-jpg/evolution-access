import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Mail, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/alertas")({ component: Alertas });

function Alertas() {
  const [list, setList] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("alertas").select("*").order("fecha", { ascending: false }).limit(100);
    setList(data ?? []);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("alertas-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "alertas" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <AdminShell title="Alertas" subtitle="Histórico de notificaciones del sistema">
      <div className="surface rounded-xl p-6">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted-foreground">
            <tr><th className="p-2 text-left">Fecha</th><th className="p-2 text-left">Tipo</th><th className="p-2 text-left">Canal</th><th className="p-2 text-left">Mensaje</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.length === 0 && <tr><td colSpan={4} className="p-4 text-muted-foreground">Sin alertas.</td></tr>}
            {list.map((a) => (
              <tr key={a.id}>
                <td className="p-2 text-muted-foreground">{new Date(a.fecha).toLocaleString("es-PE")}</td>
                <td className="p-2 uppercase">{a.tipo}</td>
                <td className="p-2"><span className="flex items-center gap-1 text-xs uppercase text-muted-foreground">
                  {a.canal === "email" ? <Mail className="h-3 w-3" /> : a.canal === "whatsapp" ? <MessageCircle className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
                  {a.canal}
                </span></td>
                <td className="p-2">{a.mensaje}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}