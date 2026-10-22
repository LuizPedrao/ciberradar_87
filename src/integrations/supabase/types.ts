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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          contact_email: string | null
          id: number
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          contact_email?: string | null
          id?: number
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          contact_email?: string | null
          id?: number
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          company: string
          converted_at: string
          created_at: string
          email: string | null
          id: string
          lead_id: string | null
          name: string
          notes: string | null
          service_interest: string | null
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          company: string
          converted_at?: string
          created_at?: string
          email?: string | null
          id?: string
          lead_id?: string | null
          name: string
          notes?: string | null
          service_interest?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          company?: string
          converted_at?: string
          created_at?: string
          email?: string | null
          id?: string
          lead_id?: string | null
          name?: string
          notes?: string | null
          service_interest?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverables: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          status: Database["public"]["Enums"]["deliverable_status"]
          type: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["deliverable_status"]
          type: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["deliverable_status"]
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      followups: {
        Row: {
          client_id: string | null
          completed: boolean
          created_at: string
          description: string | null
          due_date: string
          id: string
          lead_id: string | null
          title: string
        }
        Insert: {
          client_id?: string | null
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          lead_id?: string | null
          title: string
        }
        Update: {
          client_id?: string | null
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          lead_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "followups_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          lead_id: string
        }
        Insert: {
          author_id?: string
          content: string
          created_at?: string
          id?: string
          lead_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          answers: Json
          classification: string
          company: string
          company_size: string
          consent_contact_at: string
          consent_marketing: boolean
          created_at: string
          email: string | null
          id: string
          main_concern: string | null
          name: string
          next_contact_at: string | null
          score: number
          source_hash: string | null
          status: Database["public"]["Enums"]["lead_status"]
          submission_id: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          answers: Json
          classification: string
          company: string
          company_size: string
          consent_contact_at: string
          consent_marketing?: boolean
          created_at?: string
          email?: string | null
          id?: string
          main_concern?: string | null
          name: string
          next_contact_at?: string | null
          score: number
          source_hash?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          submission_id: string
          updated_at?: string
          whatsapp: string
        }
        Update: {
          answers?: Json
          classification?: string
          company?: string
          company_size?: string
          consent_contact_at?: string
          consent_marketing?: boolean
          created_at?: string
          email?: string | null
          id?: string
          main_concern?: string | null
          name?: string
          next_contact_at?: string | null
          score?: number
          source_hash?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          submission_id?: string
          updated_at?: string
          whatsapp?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      convert_lead_to_client: { Args: { _lead_id: string }; Returns: string }
      get_public_settings: {
        Args: never
        Returns: {
          contact_email: string
          whatsapp_number: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin"
      client_status: "ativo" | "inativo" | "pausado"
      deliverable_status: "pendente" | "em_andamento" | "concluido"
      lead_status:
        | "novo"
        | "em_contato"
        | "qualificado"
        | "convertido"
        | "perdido"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
      client_status: ["ativo", "inativo", "pausado"],
      deliverable_status: ["pendente", "em_andamento", "concluido"],
      lead_status: [
        "novo",
        "em_contato",
        "qualificado",
        "convertido",
        "perdido",
      ],
    },
  },
} as const
