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
      clients: {
        Row: {
          auth_user_id: string
          company_name: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          company_name?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          company_name?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string | null
        }
        Relationships: []
      }
      document_activity: {
        Row: {
          action: string
          created_at: string
          document_id: string
          id: string
          metadata: Json | null
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          document_id: string
          id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          document_id?: string
          id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_activity_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          client_id: string
          description: string | null
          download_count: number
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          project_id: string
          replaces_document_id: string | null
          title: string
          updated_at: string
          uploaded_at: string
          uploaded_by: string | null
          version: number
          visible_to_client: boolean
        }
        Insert: {
          category?: string
          client_id: string
          description?: string | null
          download_count?: number
          file_name: string
          file_path: string
          file_size?: number
          file_type?: string
          id?: string
          project_id: string
          replaces_document_id?: string | null
          title: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
          version?: number
          visible_to_client?: boolean
        }
        Update: {
          category?: string
          client_id?: string
          description?: string | null
          download_count?: number
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          project_id?: string
          replaces_document_id?: string | null
          title?: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
          version?: number
          visible_to_client?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_replaces_document_id_fkey"
            columns: ["replaces_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiries: {
        Row: {
          admin_notes: string | null
          attachments: Json
          client_id: string
          created_at: string
          description: string
          estimated_budget: number | null
          id: string
          preferred_completion_date: string | null
          priority: Database["public"]["Enums"]["enquiry_priority"]
          service_category: string
          status: Database["public"]["Enums"]["enquiry_status"]
          title: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          attachments?: Json
          client_id: string
          created_at?: string
          description: string
          estimated_budget?: number | null
          id?: string
          preferred_completion_date?: string | null
          priority?: Database["public"]["Enums"]["enquiry_priority"]
          service_category: string
          status?: Database["public"]["Enums"]["enquiry_status"]
          title: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          attachments?: Json
          client_id?: string
          created_at?: string
          description?: string
          estimated_budget?: number | null
          id?: string
          preferred_completion_date?: string | null
          priority?: Database["public"]["Enums"]["enquiry_priority"]
          service_category?: string
          status?: Database["public"]["Enums"]["enquiry_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_client_id_fkey_profiles"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          discount_amount: number
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string | null
          paid_date: string | null
          project_id: string | null
          status: string
          subtotal: number
          tax_amount: number
          title: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          discount_amount?: number
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string | null
          paid_date?: string | null
          project_id?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          title: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          discount_amount?: number
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string | null
          paid_date?: string | null
          project_id?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          title?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: string
          payment_reference: string | null
          proof_document_id: string | null
          verification_status: string
          verified_by: string | null
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          payment_reference?: string | null
          proof_document_id?: string | null
          verification_status?: string
          verified_by?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          payment_reference?: string | null
          proof_document_id?: string | null
          verification_status?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_proof_document_id_fkey"
            columns: ["proof_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approval_status: string
          business_address: string | null
          company_name: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          approval_status?: string
          business_address?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          approval_status?: string
          business_address?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_updates: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          progress_percentage: number | null
          project_id: string
          update_message: string | null
          update_title: string
          visible_to_client: boolean
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          progress_percentage?: number | null
          project_id: string
          update_message?: string | null
          update_title: string
          visible_to_client?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          progress_percentage?: number | null
          project_id?: string
          update_message?: string | null
          update_title?: string
          visible_to_client?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          archived_at: string | null
          client_id: string
          completion_date: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          enquiry_id: string | null
          id: string
          priority: string
          progress_percentage: number
          project_name: string
          quotation_id: string | null
          service_category: string | null
          source: string | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          client_id: string
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          enquiry_id?: string | null
          id?: string
          priority?: string
          progress_percentage?: number
          project_name: string
          quotation_id?: string | null
          service_category?: string | null
          source?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          client_id?: string
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          enquiry_id?: string | null
          id?: string
          priority?: string
          progress_percentage?: number
          project_name?: string
          quotation_id?: string | null
          service_category?: string | null
          source?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "enquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_items: {
        Row: {
          created_at: string
          description: string
          discount: number
          id: string
          quantity: number
          quotation_id: string
          sort_order: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          discount?: number
          id?: string
          quantity?: number
          quotation_id: string
          sort_order?: number
          total?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          discount?: number
          id?: string
          quantity?: number
          quotation_id?: string
          sort_order?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          acceptance_method: string | null
          acceptance_notes: string | null
          accepted_at: string | null
          accepted_by: string | null
          clarification_note: string | null
          clarification_requested_at: string | null
          client_id: string
          created_at: string
          created_by: string | null
          currency: string
          delivery_timeline: string | null
          description: string | null
          discount_total: number
          enquiry_id: string | null
          id: string
          notes: string | null
          payment_terms: string | null
          pdf_path: string | null
          quote_number: string
          rejected_at: string | null
          rejection_reason: string | null
          revision: number
          sent_at: string | null
          status: Database["public"]["Enums"]["quotation_status"]
          subtotal: number
          tax_amount: number
          tax_rate: number
          terms: string | null
          title: string
          total_amount: number
          updated_at: string
          updated_by: string | null
          valid_until: string | null
          vat_enabled: boolean
        }
        Insert: {
          acceptance_method?: string | null
          acceptance_notes?: string | null
          accepted_at?: string | null
          accepted_by?: string | null
          clarification_note?: string | null
          clarification_requested_at?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          delivery_timeline?: string | null
          description?: string | null
          discount_total?: number
          enquiry_id?: string | null
          id?: string
          notes?: string | null
          payment_terms?: string | null
          pdf_path?: string | null
          quote_number: string
          rejected_at?: string | null
          rejection_reason?: string | null
          revision?: number
          sent_at?: string | null
          status?: Database["public"]["Enums"]["quotation_status"]
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          terms?: string | null
          title: string
          total_amount?: number
          updated_at?: string
          updated_by?: string | null
          valid_until?: string | null
          vat_enabled?: boolean
        }
        Update: {
          acceptance_method?: string | null
          acceptance_notes?: string | null
          accepted_at?: string | null
          accepted_by?: string | null
          clarification_note?: string | null
          clarification_requested_at?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          delivery_timeline?: string | null
          description?: string | null
          discount_total?: number
          enquiry_id?: string | null
          id?: string
          notes?: string | null
          payment_terms?: string | null
          pdf_path?: string | null
          quote_number?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          revision?: number
          sent_at?: string | null
          status?: Database["public"]["Enums"]["quotation_status"]
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          terms?: string | null
          title?: string
          total_amount?: number
          updated_at?: string
          updated_by?: string | null
          valid_until?: string | null
          vat_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "quotations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "enquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          budget: string | null
          company_name: string | null
          contact_name: string
          created_at: string | null
          email: string
          id: string
          phone: string | null
          project_details: string | null
          service: string | null
          status: string | null
          timeline: string | null
        }
        Insert: {
          budget?: string | null
          company_name?: string | null
          contact_name: string
          created_at?: string | null
          email: string
          id?: string
          phone?: string | null
          project_details?: string | null
          service?: string | null
          status?: string | null
          timeline?: string | null
        }
        Update: {
          budget?: string | null
          company_name?: string | null
          contact_name?: string
          created_at?: string | null
          email?: string
          id?: string
          phone?: string | null
          project_details?: string | null
          service?: string | null
          status?: string | null
          timeline?: string | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "client" | "staff"
      enquiry_priority: "Low" | "Medium" | "High"
      enquiry_status:
        | "Pending Review"
        | "Needs More Information"
        | "Approved"
        | "Rejected"
        | "Converted to Project"
      quotation_status:
        | "Draft"
        | "Sent"
        | "Accepted"
        | "Rejected"
        | "Expired"
        | "Revised"
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
      app_role: ["admin", "client", "staff"],
      enquiry_priority: ["Low", "Medium", "High"],
      enquiry_status: [
        "Pending Review",
        "Needs More Information",
        "Approved",
        "Rejected",
        "Converted to Project",
      ],
      quotation_status: [
        "Draft",
        "Sent",
        "Accepted",
        "Rejected",
        "Expired",
        "Revised",
      ],
    },
  },
} as const
