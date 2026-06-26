import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/visitantes")({ component: Visitantes });

function Visitantes() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ dni: "", nombre: "", monto: 15 });

  const load = async () => {
    const { data } = await supabase.from("visitantes").select("*").order("created_at", { ascending: false }).limit(50);
    setList(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("visitantes").insert(form as any);
    if (error) return toast.error(error.message);
    toast.success("Visitante registrado");
    setForm({ dni: "", nombre: "", monto: 15 });
    load();
  };

  return (
    <AdminShell title="Visitantes" subtitle="Pase de un día">
      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={submit} className="surface space-y-4 rounded-xl p-6">
          <h2 className="font-display text-lg uppercase">Nuevo visitante</h2>
          <div><Label>DNI</Label><Input required maxLength={8} value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} /></div>
          <div><Label>Nombre</Label><Input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
          <div><Label>Monto (S/)</Label><Input required type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: Number(e.target.value) })} /></div>
          <Button type="submit" className="w-full">Registrar</Button>
        </form>
        <div className="surface rounded-xl p-6 lg:col-span-2">
          <h2 className="mb-4 font-display text-lg uppercase">Visitantes recientes</h2>
          <table className="w-full text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted-foreground">
              <tr><th className="p-2 text-left">DNI</th><th className="p-2 text-left">Nombre</th><th className="p-2 text-left">Fecha</th><th className="p-2 text-left">Monto</th><th className="p-2 text-left">Acceso</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((v) => (
                <tr key={v.id}>
                  <td className="p-2">{v.dni}</td>
                  <td className="p-2">{v.nombre}</td>
                  <td className="p-2 text-muted-foreground">{new Date(v.fecha_visita).toLocaleDateString("es-PE")}</td>
                  <td className="p-2">S/ {v.monto}</td>
                  <td className="p-2">{v.acceso_usado ? "Usado" : "Pendiente"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}