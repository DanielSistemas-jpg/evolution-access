import { createFileRoute } from "@tanstack/react-router";
import { UserShell } from "@/components/user-shell";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notificaciones")({ component: Notif });

function Notif() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("notificaciones").select("*").eq("user_id", user.id).order("fecha", { ascending: false })
      .then(({ data }) => setList(data ?? []));
  }, [user]);
  return (
    <UserShell title="Notificaciones">
      <div className="space-y-3">
        {list.length === 0 && <p className="text-muted-foreground">Sin notificaciones.</p>}
        {list.map((n) => (
          <div key={n.id} className="surface flex gap-4 rounded-xl p-4">
            <Bell className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{n.titulo}</p>
                <span className="text-xs text-muted-foreground">{new Date(n.fecha).toLocaleString("es-PE")}</span>
              </div>
              {n.mensaje && <p className="text-sm text-muted-foreground">{n.mensaje}</p>}
            </div>
          </div>
        ))}
      </div>
    </UserShell>
  );
}