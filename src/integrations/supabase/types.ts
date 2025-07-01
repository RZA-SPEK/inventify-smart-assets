export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      asset_relationships: {
        Row: {
          child_asset_id: string
          created_at: string | null
          id: string
          parent_asset_id: string
          relationship_type: string
        }
        Insert: {
          child_asset_id: string
          created_at?: string | null
          id?: string
          parent_asset_id: string
          relationship_type: string
        }
        Update: {
          child_asset_id?: string
          created_at?: string | null
          id?: string
          parent_asset_id?: string
          relationship_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_relationships_child_asset_id_fkey"
            columns: ["child_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_relationships_parent_asset_id_fkey"
            columns: ["parent_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          assigned_to: string | null
          assigned_to_location: string | null
          brand: string | null
          category: string
          condition_notes: string | null
          created_at: string | null
          created_by: string | null
          depreciation_rate: number | null
          id: string
          image_url: string | null
          last_maintenance: string | null
          location: string
          model: string | null
          next_maintenance: string | null
          purchase_date: string
          purchase_price: number | null
          serial_number: string
          status: string
          type: string
          updated_at: string | null
          warranty_expiry: string | null
        }
        Insert: {
          assigned_to?: string | null
          assigned_to_location?: string | null
          brand?: string | null
          category?: string
          condition_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          depreciation_rate?: number | null
          id?: string
          image_url?: string | null
          last_maintenance?: string | null
          location: string
          model?: string | null
          next_maintenance?: string | null
          purchase_date: string
          purchase_price?: number | null
          serial_number: string
          status?: string
          type: string
          updated_at?: string | null
          warranty_expiry?: string | null
        }
        Update: {
          assigned_to?: string | null
          assigned_to_location?: string | null
          brand?: string | null
          category?: string
          condition_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          depreciation_rate?: number | null
          id?: string
          image_url?: string | null
          last_maintenance?: string | null
          location?: string
          model?: string | null
          next_maintenance?: string | null
          purchase_date?: string
          purchase_price?: number | null
          serial_number?: string
          status?: string
          type?: string
          updated_at?: string | null
          warranty_expiry?: string | null
        }
        Relationships: []
      }
      maintenance_history: {
        Row: {
          asset_id: string
          cost: number | null
          created_at: string | null
          description: string | null
          id: string
          maintenance_type: string
          next_due_date: string | null
          performed_by: string | null
          performed_date: string
          updated_at: string | null
        }
        Insert: {
          asset_id: string
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          maintenance_type: string
          next_due_date?: string | null
          performed_by?: string | null
          performed_date: string
          updated_at?: string | null
        }
        Update: {
          asset_id?: string
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          maintenance_type?: string
          next_due_date?: string | null
          performed_by?: string | null
          performed_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_history_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read_at: string | null
          related_asset_id: string | null
          related_reservation_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read_at?: string | null
          related_asset_id?: string | null
          related_reservation_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read_at?: string | null
          related_asset_id?: string | null
          related_reservation_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_asset_id_fkey"
            columns: ["related_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_reservation_id_fkey"
            columns: ["related_reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          approved_by: string | null
          asset_id: string
          created_at: string | null
          id: string
          purpose: string
          requested_date: string
          requester_id: string
          requester_name: string
          return_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          asset_id: string
          created_at?: string | null
          id?: string
          purpose: string
          requested_date: string
          requester_id: string
          requester_name: string
          return_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          asset_id?: string
          created_at?: string | null
          id?: string
          purpose?: string
          requested_date?: string
          requester_id?: string
          requester_name?: string
          return_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string | null
          id: string
          name: string
          search_criteria: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          search_criteria: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          search_criteria?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
