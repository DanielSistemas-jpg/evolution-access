import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, Phone, ShieldCheck, Activity, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Evolution Gym Huánuco — Transforma tu evolución" },
      { name: "description", content: "Gimnasio con control de acceso biométrico, membresías flexibles y comunidad fitness en Huánuco." },
      { property: "og:title", content: "Evolution Gym Huánuco" },
      { property: "og:description", content: "Transforma tu evolución. Membresías, eventos y control de acceso 24/7." },
    ],
  }),
  component: Index,
});

type Evento = { id: string; titulo: string; descripcion: string | null; fecha: string };

function Index() {
  const [eventos, setEventos] = useState<Evento[]>([]);

  useEffect(() => {
    supabase
      .from("eventos")
      .select("id, titulo, descripcion, fecha")
      .eq("publicado", true)
      .order("fecha", { ascending: true })
      .limit(6)
      .then(({ data }) => setEventos(data ?? []));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <BrandLogo size={36} withText />
          <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
            <a href="#sobre" className="hover:text-foreground">Sobre</a>
            <a href="#eventos" className="hover:text-foreground">Eventos</a>
            <a href="#contacto" className="hover:text-foreground">Contacto</a>
          </nav>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/auth">Soy socio</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth/admin">Admin</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 20% 30%, color-mix(in oklab, var(--neon) 50%, transparent), transparent 50%), radial-gradient(circle at 80% 70%, color-mix(in oklab, var(--neon) 30%, transparent), transparent 60%)",
          }}
        />
        <div className="container relative mx-auto grid gap-12 px-4 py-20 md:grid-cols-2 md:py-32">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs uppercase tracking-widest text-primary">
              <Activity className="h-3 w-3" /> Sistema de acceso 24/7
            </span>
            <h1 className="font-display text-5xl uppercase leading-none tracking-tight md:text-7xl">
              Transforma tu <span className="neon-text">evolución</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Membresías flexibles, control biométrico, eventos y comunidad fitness en el corazón de Huánuco.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth">Acceder como socio</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#eventos">Ver eventos</a>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 -m-10 rounded-full bg-primary/20 blur-3xl" />
              <BrandLogo size={280} />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="sobre" className="container mx-auto grid gap-6 px-4 py-20 md:grid-cols-3">
        {[
          { icon: ShieldCheck, t: "Control biométrico", d: "Ingreso por huella con PIN de respaldo cuando falla el lector." },
          { icon: Activity, t: "Dashboard en vivo", d: "Monitoreo de accesos, dispositivos y alertas en tiempo real." },
          { icon: Users, t: "Comunidad", d: "Eventos, retos y clases magistrales para socios activos." },
        ].map((f) => (
          <div key={f.t} className="surface rounded-xl p-6">
            <f.icon className="mb-4 h-8 w-8 text-primary" />
            <h3 className="font-display text-xl uppercase">{f.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </section>

      {/* Eventos */}
      <section id="eventos" className="border-t border-border bg-card/30">
        <div className="container mx-auto px-4 py-20">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary">Próximos</p>
              <h2 className="font-display text-4xl uppercase">Eventos</h2>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {eventos.length === 0 && (
              <p className="col-span-3 text-muted-foreground">No hay eventos publicados.</p>
            )}
            {eventos.map((e) => (
              <article key={e.id} className="surface group rounded-xl p-6 transition hover:border-primary">
                <Calendar className="mb-3 h-6 w-6 text-primary" />
                <h3 className="font-display text-lg uppercase">{e.titulo}</h3>
                <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                  {new Date(e.fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
                {e.descripcion && <p className="mt-3 text-sm text-muted-foreground">{e.descripcion}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="border-t border-border">
        <div className="container mx-auto grid gap-8 px-4 py-16 md:grid-cols-3">
          <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /> Jr. Huánuco 123, Huánuco</div>
          <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary" /> +51 962 000 000</div>
          <div className="flex items-center gap-3"><Activity className="h-5 w-5 text-primary" /> Lunes a Sábado · 5am – 11pm</div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Evolution Gym Huánuco. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
