import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth_/admin")({
  head: () => ({ meta: [{ title: "Acceso administrador — Evolution Gym" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session, role } = useAuth();

  useEffect(() => {
    if (session && role === "admin") navigate({ to: "/admin" });
  }, [session, role, navigate]);

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth/admin",
    });
    if (result.error) { setLoading(false); return toast.error("No se pudo iniciar sesión con Google"); }
    if (result.redirected) return;

    // Session set. Check role.
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setLoading(false); return; }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
    const isAdmin = roles?.some((r) => r.role === "admin");
    if (!isAdmin) {
      toast.error("Esta cuenta no tiene permisos de administrador.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }
    toast.success("Acceso autorizado");
    navigate({ to: "/admin" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex justify-center"><BrandLogo size={64} withText /></Link>
        <div className="surface neon-border rounded-xl p-8 text-center">
          <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h1 className="font-display text-2xl uppercase">Panel administrativo</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acceso restringido. Inicia sesión con tu cuenta autorizada de Google.
          </p>
          <Button onClick={handleGoogle} className="mt-6 w-full" size="lg" disabled={loading}>
            {loading ? "Conectando..." : "Continuar con Google"}
          </Button>
          <p className="mt-6 text-xs text-muted-foreground">
            <Link to="/auth" className="text-primary hover:underline">¿Eres socio? Ingresa aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}