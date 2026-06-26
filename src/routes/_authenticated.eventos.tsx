import { createFileRoute } from "@tanstack/react-router";
import { UserShell } from "@/components/user-shell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "lucide-react";

export const Route = createFileRoute("/_authenticated/eventos")({ component: Eventos });

function Eventos() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("eventos").select("*").eq("publicado", true).order("fecha").then(({ data }) => setList(data ?? []));
  }, []);
  return (
    <UserShell title="Eventos">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.length === 0 && <p className="text-muted-foreground">No hay eventos.</p>}
        {list.map((e) => (
          <article key={e.id} className="surface rounded-xl p-6">
            <Calendar className="mb-3 h-6 w-6 text-primary" />
            <h3 className="font-display text-lg uppercase">{e.titulo}</h3>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {new Date(e.fecha).toLocaleString("es-PE")}
            </p>
            {e.descripcion && <p className="mt-3 text-sm text-muted-foreground">{e.descripcion}</p>}
          </article>
        ))}
      </div>
    </UserShell>
  );
}