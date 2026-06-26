import { createFileRoute } from "@tanstack/react-router";
import { UserShell } from "@/components/user-shell";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/perfil")({ component: Perfil });

function Perfil() {
  const { profile, user, refreshProfile } = useAuth();
  const [form, setForm] = useState({ nombre: "", dni: "", telefono: "", fecha_nacimiento: "" });
  const [pin, setPin] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({
      nombre: profile.nombre ?? "",
      dni: profile.dni ?? "",
      telefono: profile.telefono ?? "",
      fecha_nacimiento: "",
    });
    if (user) supabase.from("pines_emergencia").select("pin").eq("user_id", user.id).eq("activo", true).maybeSingle().then(({ data }) => setPin(data?.pin ?? null));
  }, [profile, user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(form as any).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Perfil actualizado");
    refreshProfile();
  };

  return (
    <UserShell title="Mi perfil">
      <div className="grid gap-6 md:grid-cols-2">
        <form onSubmit={save} className="surface space-y-4 rounded-xl p-6">
          <div><Label>Nombre</Label><Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
          <div><Label>DNI</Label><Input value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} maxLength={8} /></div>
          <div><Label>Teléfono</Label><Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></div>
          <div><Label>Correo</Label><Input value={user?.email ?? ""} disabled /></div>
          <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
        </form>
        <div className="surface rounded-xl p-6">
          <h2 className="font-display text-lg uppercase">PIN de contingencia</h2>
          <p className="mt-2 text-sm text-muted-foreground">Úsalo si el lector biométrico falla.</p>
          <div className="mt-6 rounded-lg border border-primary/40 bg-primary/10 p-6 text-center">
            <p className="font-display text-4xl tracking-[0.5em] text-primary">{pin ?? "----"}</p>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Si no tienes PIN, solicítalo a recepción.</p>
        </div>
      </div>
    </UserShell>
  );
}