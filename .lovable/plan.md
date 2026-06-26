## Gym Evolution — Plan de construcción

App web para control de acceso y gestión del gimnasio **Evolution Gym Huánuco**, con dashboard en tiempo real, contingencia por PIN cuando falla la biometría, y gestión completa de socios/membresías/eventos.

### Stack
- TanStack Start (React + TS, ya instalado) + Tailwind v4 + shadcn/ui.
- Lovable Cloud (Supabase) para auth, DB, Realtime y Storage.
- Recharts para gráficos, date-fns para fechas, sonner para notificaciones.

### Diseño
- Tema oscuro permanente. Paleta: `#1C1C1C` fondo, `#D31413` rojo neón (primario/acento), `#F4F4F4` texto, `#8B8C8D` plomo (muted).
- Tipografía deportiva (Inter + acento tipo "Oswald/Bebas" para títulos).
- Logo Evolution Gym en sidebar y splash.
- Layout SaaS: sidebar fijo en admin, navbar simple en usuario.

### Roles
- `admin` y `user` en tabla `user_roles` separada (security definer `has_role`).
- Google OAuth **solo** para admin (botón Google en `/auth/admin`).
- Usuarios: login email/password.

### Esquema de base de datos
- `profiles` (id→auth.users, dni, nombre, teléfono, foto, fecha_nacimiento)
- `user_roles` (user_id, role enum: admin|user)
- `membresias` (id, user_id, plan, fecha_inicio, fecha_fin, estado, precio)
- `pagos` (id, user_id, membresia_id, monto, método, fecha)
- `asistencias` (id, user_id, dispositivo_id, fecha_hora, método: biometric|pin|dni, estado: permitido|denegado, motivo)
- `eventos` (id, título, descripción, fecha, imagen, publicado)
- `dispositivos` (id, nombre, ubicación, estado: activo|mantenimiento|caido, última_señal)
- `logs_hardware` (id, dispositivo_id, tipo, mensaje, fecha)
- `errores` (id, contexto, mensaje, severidad, fecha)
- `alertas` (id, tipo, canal: email|whatsapp, destinatario, mensaje, enviada, fecha)
- `visitantes` (id, dni, nombre, monto, fecha_visita, acceso_usado)
- `pines_emergencia` (id, user_id, pin_hash, activo, generado_en)
- `configuraciones` (key, value JSONB) — para SMTP, Twilio, etc.
- `notificaciones` (id, user_id, título, mensaje, leída, fecha)

Todas con RLS: usuarios ven solo su data; admin con `has_role` ve todo. GRANTs explícitos.

### Rutas
**Públicas**
- `/` — Landing (logo, eventos publicados, info del gym, CTA login)
- `/auth` — Login usuario (email/password)
- `/auth/admin` — Login admin (Google)

**Usuario (`_authenticated/`)**
- `/dashboard` — Resumen membresía + próximas asistencias
- `/perfil` — Datos personales
- `/membresia` — Estado + comprar/renovar
- `/asistencias` — Historial + calendario
- `/eventos` — Lista de eventos
- `/notificaciones`

**Admin (`_authenticated/admin/`)** (gate por `has_role('admin')`)
- `/admin` — Dashboard tiempo real (ingresos, métricas, estado dispositivos, alertas)
- `/admin/socios` — CRUD socios + activar/desactivar + PIN respaldo + historial
- `/admin/visitantes` — Registro de pase diario
- `/admin/control-acceso` — Simulador biométrico (validar, registrar, mostrar mensajes)
- `/admin/dispositivos` — Monitoreo, logs, consola diagnóstico, botón "simular caída", forzar PIN
- `/admin/alertas` — Configuración email/WhatsApp + historial
- `/admin/eventos` — CRUD eventos/anuncios
- `/admin/configuracion` — Settings generales

### Flujo de control de acceso
1. Admin abre `/admin/control-acceso`, selecciona socio (o ingresa DNI).
2. Click "Simular huella" → valida membresía vigente → inserta `asistencias` (método=biometric, estado=permitido/denegado).
3. Si simula falla biométrica → input PIN → valida `pines_emergencia` → registra (método=pin) + crea `alerta` para admin.
4. Realtime: dashboard admin se actualiza vía Supabase Realtime channel en `asistencias` y `dispositivos`.

### Realtime
- Subscripción a `asistencias` (insert) → actualiza contadores y feed en vivo.
- Subscripción a `dispositivos` (update) → estados.
- Subscripción a `alertas` → toast en admin.

### Notificaciones
- Email/WhatsApp: panel de configuración guarda credenciales (Twilio) en `configuraciones`. Envío real queda como server function preparada (mock por defecto para demo). Se registra cada envío en `alertas`.

### Server functions (TanStack)
- `registrar_asistencia` (auth admin) — valida membresía e inserta.
- `generar_pin` (auth admin) — genera y guarda hash.
- `validar_pin` (auth admin) — verifica.
- `simular_falla_dispositivo` (auth admin).
- `enviar_alerta` (auth admin) — mock + log.

### Datos demo
Migración seed con: 3 dispositivos, 6 socios demo con membresías mixtas (activa/vencida/por vencer), 8 asistencias recientes, 3 eventos publicados, 2 visitantes, 5 alertas, PINs de respaldo.

### Entregable
App funcional navegable end-to-end con demo data, lista para mostrar como prototipo sólido. La integración real de Twilio queda mockeada con interfaz preparada (se puede activar luego con el connector).

### Fuera de alcance (mencionar)
- Integración Twilio real (queda interfaz lista, requiere connector).
- SMTP real (configurable, default mock).
- Hardware biométrico real (es simulado, como pide el prompt).
