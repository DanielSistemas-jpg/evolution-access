export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alertas: {
        Row: {
          canal: Database["public"]["Enums"]["alerta_canal"]
          destinatario: string | null
          enviada: boolean
          fecha: string
          id: string
          leida: boolean
          mensaje: string
          tipo: string
        }
        Insert: {
          canal?: Database["public"]["Enums"]["alerta_canal"]
          destinatario?: string | null
          enviada?: boolean
          fecha?: string
          id?: string
          leida?: boolean
          mensaje: string
          tipo: string
        }
        Update: {
          canal?: Database["public"]["Enums"]["alerta_canal"]
          destinatario?: string | null
          enviada?: boolean
          fecha?: string
          id?: string
          leida?: boolean
          mensaje?: string
          tipo?: string
        }
        Relationships: []
      }
      asistencias: {
        Row: {
          created_at: string
          dispositivo_id: string | null
          dni: string | null
          estado: Database["public"]["Enums"]["acceso_estado"]
          fecha_hora: string
          id: string
          metodo: Database["public"]["Enums"]["acceso_metodo"]
          motivo: string | null
          user_id: string | null
          visitante_id: string | null
        }
        Insert: {
          created_at?: string
          dispositivo_id?: string | null
          dni?: string | null
          estado: Database["public"]["Enums"]["acceso_estado"]
          fecha_hora?: string
          id?: string
          metodo: Database["public"]["Enums"]["acceso_metodo"]
          motivo?: string | null
          user_id?: string | null
          visitante_id?: string | null
        }
        Update: {
          created_at?: string
          dispositivo_id?: string | null
          dni?: string | null
          estado?: Database["public"]["Enums"]["acceso_estado"]
          fecha_hora?: string
          id?: string
          metodo?: Database["public"]["Enums"]["acceso_metodo"]
          motivo?: string | null
          user_id?: string | null
          visitante_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asistencias_dispositivo_id_fkey"
            columns: ["dispositivo_id"]
            isOneToOne: false
            referencedRelation: "dispositivos"
            referencedColumns: ["id"]
          },
        ]
      }
      configuraciones: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      dispositivos: {
        Row: {
          created_at: string
          estado: Database["public"]["Enums"]["dispositivo_estado"]
          forzar_pin: boolean
          id: string
          nombre: string
          ubicacion: string | null
          ultima_senal: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          estado?: Database["public"]["Enums"]["dispositivo_estado"]
          forzar_pin?: boolean
          id?: string
          nombre: string
          ubicacion?: string | null
          ultima_senal?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          estado?: Database["public"]["Enums"]["dispositivo_estado"]
          forzar_pin?: boolean
          id?: string
          nombre?: string
          ubicacion?: string | null
          ultima_senal?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      errores: {
        Row: {
          contexto: string | null
          fecha: string
          id: string
          mensaje: string
          severidad: string | null
        }
        Insert: {
          contexto?: string | null
          fecha?: string
          id?: string
          mensaje: string
          severidad?: string | null
        }
        Update: {
          contexto?: string | null
          fecha?: string
          id?: string
          mensaje?: string
          severidad?: string | null
        }
        Relationships: []
      }
      eventos: {
        Row: {
          created_at: string
          descripcion: string | null
          fecha: string
          id: string
          imagen_url: string | null
          publicado: boolean
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          fecha: string
          id?: string
          imagen_url?: string | null
          publicado?: boolean
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          fecha?: string
          id?: string
          imagen_url?: string | null
          publicado?: boolean
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      logs_hardware: {
        Row: {
          dispositivo_id: string | null
          fecha: string
          id: string
          mensaje: string | null
          severidad: string | null
          tipo: string
        }
        Insert: {
          dispositivo_id?: string | null
          fecha?: string
          id?: string
          mensaje?: string | null
          severidad?: string | null
          tipo: string
        }
        Update: {
          dispositivo_id?: string | null
          fecha?: string
          id?: string
          mensaje?: string | null
          severidad?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_hardware_dispositivo_id_fkey"
            columns: ["dispositivo_id"]
            isOneToOne: false
            referencedRelation: "dispositivos"
            referencedColumns: ["id"]
          },
        ]
      }
      membresias: {
        Row: {
          created_at: string
          estado: Database["public"]["Enums"]["membresia_estado"]
          fecha_fin: string
          fecha_inicio: string
          id: string
          plan: string
          precio: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          estado?: Database["public"]["Enums"]["membresia_estado"]
          fecha_fin: string
          fecha_inicio?: string
          id?: string
          plan: string
          precio?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          estado?: Database["public"]["Enums"]["membresia_estado"]
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          plan?: string
          precio?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notificaciones: {
        Row: {
          fecha: string
          id: string
          leida: boolean
          mensaje: string | null
          tipo: string | null
          titulo: string
          user_id: string
        }
        Insert: {
          fecha?: string
          id?: string
          leida?: boolean
          mensaje?: string | null
          tipo?: string | null
          titulo: string
          user_id: string
        }
        Update: {
          fecha?: string
          id?: string
          leida?: boolean
          mensaje?: string | null
          tipo?: string | null
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      pagos: {
        Row: {
          concepto: string | null
          fecha: string
          id: string
          membresia_id: string | null
          metodo: string
          monto: number
          user_id: string | null
        }
        Insert: {
          concepto?: string | null
          fecha?: string
          id?: string
          membresia_id?: string | null
          metodo?: string
          monto: number
          user_id?: string | null
        }
        Update: {
          concepto?: string | null
          fecha?: string
          id?: string
          membresia_id?: string | null
          metodo?: string
          monto?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_membresia_id_fkey"
            columns: ["membresia_id"]
            isOneToOne: false
            referencedRelation: "membresias"
            referencedColumns: ["id"]
          },
        ]
      }
      pines_emergencia: {
        Row: {
          activo: boolean
          generado_en: string
          id: string
          pin: string
          user_id: string
        }
        Insert: {
          activo?: boolean
          generado_en?: string
          id?: string
          pin: string
          user_id: string
        }
        Update: {
          activo?: boolean
          generado_en?: string
          id?: string
          pin?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          dni: string | null
          email: string | null
          fecha_nacimiento: string | null
          foto_url: string | null
          id: string
          nombre: string
          telefono: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dni?: string | null
          email?: string | null
          fecha_nacimiento?: string | null
          foto_url?: string | null
          id: string
          nombre: string
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dni?: string | null
          email?: string | null
          fecha_nacimiento?: string | null
          foto_url?: string | null
          id?: string
          nombre?: string
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitantes: {
        Row: {
          acceso_usado: boolean
          created_at: string
          dni: string
          fecha_visita: string
          id: string
          monto: number
          nombre: string
        }
        Insert: {
          acceso_usado?: boolean
          created_at?: string
          dni: string
          fecha_visita?: string
          id?: string
          monto?: number
          nombre: string
        }
        Update: {
          acceso_usado?: boolean
          created_at?: string
          dni?: string
          fecha_visita?: string
          id?: string
          monto?: number
          nombre?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      acceso_estado: "permitido" | "denegado"
      acceso_metodo: "biometric" | "pin" | "dni" | "manual"
      alerta_canal: "email" | "whatsapp" | "sistema"
      app_role: "admin" | "user"
      dispositivo_estado: "activo" | "mantenimiento" | "caido"
      membresia_estado: "activa" | "vencida" | "cancelada" | "pendiente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      acceso_estado: ["permitido", "denegado"],
      acceso_metodo: ["biometric", "pin", "dni", "manual"],
      alerta_canal: ["email", "whatsapp", "sistema"],
      app_role: ["admin", "user"],
      dispositivo_estado: ["activo", "mantenimiento", "caido"],
      membresia_estado: ["activa", "vencida", "cancelada", "pendiente"],
    },
  },
} as const
