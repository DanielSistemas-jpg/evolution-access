import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/eventos")({ component: AdminEventos });

function AdminEventos() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ titulo: "", descripcion: "", fecha: "", publicado: true });

  const load = async () => {
    const { data } = await supabase.from("eventos").select("*").order("fecha", { ascending: false });
    setList(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("eventos").insert(form as any);
    if (error) return toast.error(error.message);
    toast.success("Evento creado");
    setForm({ titulo: "", descripcion: "", fecha: "", publicado: true });
    load();
  };

  const eliminar = async (id: string) => {
    await supabase.from("eventos").delete().eq("id", id);
    load();
  };

  return (
    <AdminShell title="Eventos" subtitle="Gestión de contenido público">
      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={crear} className="surface space-y-4 rounded-xl p-6">
          <h2 className="font-display text-lg uppercase">Nuevo evento</h2>
          <div><Label>Título</Label><Input required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></div>
          <div><Label>Descripción</Label><Textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></div>
          <div><Label>Fecha</Label><Input required type="datetime-local" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></div>
          <Button type="submit" className="w-full">Publicar</Button>
        </form>
        <div className="space-y-3 lg:col-span-2">
          {list.map((e) => (
            <div key={e.id} className="surface flex items-start justify-between rounded-xl p-4">
              <div>
                <p className="font-medium">{e.titulo}</p>
                <p className="text-xs text-muted-foreground">{new Date(e.fecha).toLocaleString("es-PE")}</p>
                {e.descripcion && <p className="mt-2 text-sm text-muted-foreground">{e.descripcion}</p>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => eliminar(e.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}