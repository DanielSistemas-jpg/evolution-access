
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.membresia_estado AS ENUM ('activa', 'vencida', 'cancelada', 'pendiente');
CREATE TYPE public.dispositivo_estado AS ENUM ('activo', 'mantenimiento', 'caido');
CREATE TYPE public.acceso_metodo AS ENUM ('biometric', 'pin', 'dni', 'manual');
CREATE TYPE public.acceso_estado AS ENUM ('permitido', 'denegado');
CREATE TYPE public.alerta_canal AS ENUM ('email', 'whatsapp', 'sistema');

-- update_updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dni TEXT UNIQUE,
  nombre TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  foto_url TEXT,
  fecha_nacimiento DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Profiles policies
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- User roles policies
CREATE POLICY "View own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- MEMBRESIAS
CREATE TABLE public.membresias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  precio NUMERIC(10,2) NOT NULL DEFAULT 0,
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin DATE NOT NULL,
  estado membresia_estado NOT NULL DEFAULT 'activa',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.membresias TO authenticated;
GRANT ALL ON public.membresias TO service_role;
ALTER TABLE public.membresias ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER membresias_updated BEFORE UPDATE ON public.membresias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "View own membresia" ON public.membresias FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage membresias" ON public.membresias FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- PAGOS
CREATE TABLE public.pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  membresia_id UUID REFERENCES public.membresias(id) ON DELETE SET NULL,
  monto NUMERIC(10,2) NOT NULL,
  metodo TEXT NOT NULL DEFAULT 'efectivo',
  concepto TEXT,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pagos TO authenticated;
GRANT ALL ON public.pagos TO service_role;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View own pagos" ON public.pagos FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage pagos" ON public.pagos FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- DISPOSITIVOS
CREATE TABLE public.dispositivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  ubicacion TEXT,
  estado dispositivo_estado NOT NULL DEFAULT 'activo',
  forzar_pin BOOLEAN NOT NULL DEFAULT false,
  ultima_senal TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dispositivos TO authenticated;
GRANT ALL ON public.dispositivos TO service_role;
ALTER TABLE public.dispositivos ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER dispositivos_updated BEFORE UPDATE ON public.dispositivos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Auth view dispositivos" ON public.dispositivos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage dispositivos" ON public.dispositivos FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ASISTENCIAS
CREATE TABLE public.asistencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visitante_id UUID,
  dispositivo_id UUID REFERENCES public.dispositivos(id) ON DELETE SET NULL,
  fecha_hora TIMESTAMPTZ NOT NULL DEFAULT now(),
  metodo acceso_metodo NOT NULL,
  estado acceso_estado NOT NULL,
  motivo TEXT,
  dni TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asistencias TO authenticated;
GRANT ALL ON public.asistencias TO service_role;
ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View own asistencias" ON public.asistencias FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage asistencias" ON public.asistencias FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- EVENTOS
CREATE TABLE public.eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha TIMESTAMPTZ NOT NULL,
  imagen_url TEXT,
  publicado BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.eventos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eventos TO authenticated;
GRANT ALL ON public.eventos TO service_role;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER eventos_updated BEFORE UPDATE ON public.eventos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Public view published eventos" ON public.eventos FOR SELECT USING (publicado = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage eventos" ON public.eventos FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- LOGS HARDWARE
CREATE TABLE public.logs_hardware (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispositivo_id UUID REFERENCES public.dispositivos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  mensaje TEXT,
  severidad TEXT DEFAULT 'info',
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.logs_hardware TO authenticated;
GRANT ALL ON public.logs_hardware TO service_role;
ALTER TABLE public.logs_hardware ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage logs" ON public.logs_hardware FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ERRORES
CREATE TABLE public.errores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contexto TEXT,
  mensaje TEXT NOT NULL,
  severidad TEXT DEFAULT 'error',
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.errores TO authenticated;
GRANT ALL ON public.errores TO service_role;
ALTER TABLE public.errores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage errores" ON public.errores FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ALERTAS
CREATE TABLE public.alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  canal alerta_canal NOT NULL DEFAULT 'sistema',
  destinatario TEXT,
  mensaje TEXT NOT NULL,
  enviada BOOLEAN NOT NULL DEFAULT false,
  leida BOOLEAN NOT NULL DEFAULT false,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alertas TO authenticated;
GRANT ALL ON public.alertas TO service_role;
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage alertas" ON public.alertas FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- VISITANTES
CREATE TABLE public.visitantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dni TEXT NOT NULL,
  nombre TEXT NOT NULL,
  monto NUMERIC(10,2) NOT NULL DEFAULT 0,
  fecha_visita DATE NOT NULL DEFAULT CURRENT_DATE,
  acceso_usado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitantes TO authenticated;
GRANT ALL ON public.visitantes TO service_role;
ALTER TABLE public.visitantes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage visitantes" ON public.visitantes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- PINES EMERGENCIA
CREATE TABLE public.pines_emergencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pin TEXT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  generado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pines_emergencia TO authenticated;
GRANT ALL ON public.pines_emergencia TO service_role;
ALTER TABLE public.pines_emergencia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage pines" ON public.pines_emergencia FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users view own pin" ON public.pines_emergencia FOR SELECT TO authenticated USING (user_id = auth.uid());

-- CONFIGURACIONES
CREATE TABLE public.configuraciones (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.configuraciones TO authenticated;
GRANT ALL ON public.configuraciones TO service_role;
ALTER TABLE public.configuraciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage config" ON public.configuraciones FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- NOTIFICACIONES
CREATE TABLE public.notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensaje TEXT,
  tipo TEXT DEFAULT 'info',
  leida BOOLEAN NOT NULL DEFAULT false,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notificaciones TO authenticated;
GRANT ALL ON public.notificaciones TO service_role;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notif" ON public.notificaciones FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users update own notif" ON public.notificaciones FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage notif" ON public.notificaciones FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Auto-create profile + assign default 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.asistencias;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dispositivos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alertas;
