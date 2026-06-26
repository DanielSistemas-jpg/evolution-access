import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Key } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/socios")({ component: Socios });

function Socios() {
  const [list, setList] = useState<any[]>([]);
  const [q, setQ] = useState("");

  const load = async () => {
    const { data } = await supabase.from("profiles").select("*, membresias(plan,estado,fecha_fin)").order("created_at", { ascending: false });
    setList(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const generarPin = async (uid: string) => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    await supabase.from("pines_emergencia").update({ activo: false } as any).eq("user_id", uid);
    const { error } = await supabase.from("pines_emergencia").insert({ user_id: uid, pin, activo: true } as any);
    if (error) return toast.error(error.message);
    toast.success(`PIN generado: ${pin}`);
  };

  const filtered = list.filter((p) =>
    [p.nombre, p.dni, p.email].some((v) => v?.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <AdminShell title="Socios" subtitle="Gestión de miembros">
      <div className="surface rounded-xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre, DNI o correo" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted-foreground">
              <tr><th className="p-2 text-left">Nombre</th><th className="p-2 text-left">DNI</th><th className="p-2 text-left">Membresía</th><th className="p-2 text-left">Estado</th><th className="p-2"></th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => {
                const m = p.membresias?.[0];
                return (
                  <tr key={p.id}>
                    <td className="p-2">{p.nombre}</td>
                    <td className="p-2 text-muted-foreground">{p.dni ?? "—"}</td>
                    <td className="p-2">{m?.plan ?? "—"}</td>
                    <td className="p-2"><span className={`rounded px-2 py-0.5 text-xs ${m?.estado === "activa" ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"}`}>{m?.estado ?? "sin plan"}</span></td>
                    <td className="p-2 text-right">
                      <Button size="sm" variant="outline" onClick={() => generarPin(p.id)}>
                        <Key className="mr-1 h-3 w-3" /> Nuevo PIN
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}