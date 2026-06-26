import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/configuracion")({ component: Config });

function Config() {
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [twilioSid, setTwilioSid] = useState("");

  useEffect(() => {
    supabase.from("configuraciones").select("*").in("key", ["alert_email", "alert_whatsapp", "twilio_sid"])
      .then(({ data }) => {
        const map = Object.fromEntries((data ?? []).map((c) => [c.key, c.value]));
        setEmail((map.alert_email as any)?.value ?? "");
        setWhatsapp((map.alert_whatsapp as any)?.value ?? "");
        setTwilioSid((map.twilio_sid as any)?.value ?? "");
      });
  }, []);

  const save = async () => {
    await supabase.from("configuraciones").upsert([
      { key: "alert_email", value: { value: email } },
      { key: "alert_whatsapp", value: { value: whatsapp } },
      { key: "twilio_sid", value: { value: twilioSid } },
    ] as any);
    toast.success("Configuración guardada");
  };

  return (
    <AdminShell title="Configuración" subtitle="Notificaciones e integraciones">
      <div className="surface max-w-xl space-y-4 rounded-xl p-6">
        <div><Label>Email para alertas</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></div>
        <div><Label>WhatsApp (con código país)</Label><Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+51962000000" /></div>
        <div><Label>Twilio Account SID</Label><Input value={twilioSid} onChange={(e) => setTwilioSid(e.target.value)} /></div>
        <Button onClick={save}>Guardar</Button>
        <p className="text-xs text-muted-foreground">La integración con Twilio se activa cuando se proporcionen credenciales válidas en el backend.</p>
      </div>
    </AdminShell>
  );
}