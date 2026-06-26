import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, User, CreditCard, CalendarCheck, CalendarDays, Bell, LogOut } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import type { ReactNode } from "react";

const nav = [
  { to: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { to: "/perfil", label: "Perfil", icon: User },
  { to: "/membresia", label: "Membresía", icon: CreditCard },
  { to: "/asistencias", label: "Asistencias", icon: CalendarCheck },
  { to: "/eventos", label: "Eventos", icon: CalendarDays },
  { to: "/notificaciones", label: "Avisos", icon: Bell },
] as const;

export function UserShell({ children, title }: { children: ReactNode; title: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <BrandLogo size={36} withText />
          <Button size="sm" variant="ghost" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <nav className="container mx-auto flex gap-1 overflow-x-auto px-4 pb-2">
          {nav.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm transition ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 font-display text-3xl uppercase tracking-wide">{title}</h1>
        {children}
      </main>
    </div>
  );
}