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
      blocked_slots: {
        Row: {
          all_day: boolean
          created_at: string
          end_time: string | null
          id: string
          reason: string | null
          slot_date: string
          start_time: string | null
        }
        Insert: {
          all_day?: boolean
          created_at?: string
          end_time?: string | null
          id?: string
          reason?: string | null
          slot_date: string
          start_time?: string | null
        }
        Update: {
          all_day?: boolean
          created_at?: string
          end_time?: string | null
          id?: string
          reason?: string | null
          slot_date?: string
          start_time?: string | null
        }
        Relationships: []
      }
      booking_services: {
        Row: {
          booking_id: string
          id: string
          price_snapshot: number
          service_id: string
        }
        Insert: {
          booking_id: string
          id?: string
          price_snapshot: number
          service_id: string
        }
        Update: {
          booking_id?: string
          id?: string
          price_snapshot?: number
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_services_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          confirmation_code: string
          created_at: string
          customer_id: string
          end_date: string | null
          end_time: string
          id: string
          notes: string | null
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
          vehicle_id: string | null
        }
        Insert: {
          booking_date: string
          confirmation_code: string
          created_at?: string
          customer_id: string
          end_date?: string | null
          end_time: string
          id?: string
          notes?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price: number
          vehicle_id?: string | null
        }
        Update: {
          booking_date?: string
          confirmation_code?: string
          created_at?: string
          customer_id?: string
          end_date?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      comparison_features: {
        Row: {
          id: string
          label: string
          sort_order: number
        }
        Insert: {
          id?: string
          label: string
          sort_order?: number
        }
        Update: {
          id?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          question: string
          sort_order: number
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
          sort_order?: number
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
          sort_order?: number
        }
        Relationships: []
      }
      gallery_photos: {
        Row: {
          ai_enhanced_at: string | null
          category: string | null
          created_at: string
          drive_file_id: string | null
          drive_folder_id: string | null
          drive_folder_name: string | null
          id: string
          photo_type: string
          photo_url: string
          publish_to_gallery: boolean
          storage_path: string | null
        }
        Insert: {
          ai_enhanced_at?: string | null
          category?: string | null
          created_at?: string
          drive_file_id?: string | null
          drive_folder_id?: string | null
          drive_folder_name?: string | null
          id?: string
          photo_type: string
          photo_url: string
          publish_to_gallery?: boolean
          storage_path?: string | null
        }
        Update: {
          ai_enhanced_at?: string | null
          category?: string | null
          created_at?: string
          drive_file_id?: string | null
          drive_folder_id?: string | null
          drive_folder_name?: string | null
          id?: string
          photo_type?: string
          photo_url?: string
          publish_to_gallery?: boolean
          storage_path?: string | null
        }
        Relationships: []
      }
      integration_tokens: {
        Row: {
          access_token: string | null
          expires_at: string | null
          metadata: Json | null
          provider: string
          refresh_token: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          expires_at?: string | null
          metadata?: Json | null
          provider: string
          refresh_token?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          expires_at?: string | null
          metadata?: Json | null
          provider?: string
          refresh_token?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category: string | null
          created_at: string
          id: string
          last_restocked_at: string | null
          low_stock_threshold: number | null
          name: string
          quantity: number
          unit: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          last_restocked_at?: string | null
          low_stock_threshold?: number | null
          name: string
          quantity?: number
          unit?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          last_restocked_at?: string | null
          low_stock_threshold?: number | null
          name?: string
          quantity?: number
          unit?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string | null
          id: string
          message: string | null
          name: string
          notes: string | null
          phone: string | null
          service_interest: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          vehicle: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          service_interest?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          vehicle?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          service_interest?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          vehicle?: string | null
        }
        Relationships: []
      }
      packages: {
        Row: {
          created_at: string
          description: string | null
          features: string[]
          id: string
          includes: Json
          is_active: boolean
          is_popular: boolean
          name: string
          price: number
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: string[]
          id?: string
          includes?: Json
          is_active?: boolean
          is_popular?: boolean
          name: string
          price: number
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: string[]
          id?: string
          includes?: Json
          is_active?: boolean
          is_popular?: boolean
          name?: string
          price?: number
          sort_order?: number
        }
        Relationships: []
      }
      page_sections: {
        Row: {
          content: Json
          id: string
          page_key: string
          section_key: string
          updated_at: string
        }
        Insert: {
          content?: Json
          id?: string
          page_key: string
          section_key: string
          updated_at?: string
        }
        Update: {
          content?: Json
          id?: string
          page_key?: string
          section_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_seo: {
        Row: {
          description: string | null
          og_image_url: string | null
          route: string
          title: string | null
          updated_at: string
        }
        Insert: {
          description?: string | null
          og_image_url?: string | null
          route: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          description?: string | null
          og_image_url?: string | null
          route?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string
          customer_name: string | null
          id: string
          is_published: boolean
          rating: number
          vehicle: string | null
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          customer_name?: string | null
          id?: string
          is_published?: boolean
          rating: number
          vehicle?: string | null
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          customer_name?: string | null
          id?: string
          is_published?: boolean
          rating?: number
          vehicle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          estimated_duration_minutes: number
          featured: boolean
          features: string[] | null
          id: string
          image_url: string | null
          images: Json
          is_active: boolean
          name: string
          price: number
          price_suv: number
          price_van: number
          short_description: string | null
          slug: string
          sort_order: number
          title_subline: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          estimated_duration_minutes: number
          featured?: boolean
          features?: string[] | null
          id?: string
          image_url?: string | null
          images?: Json
          is_active?: boolean
          name: string
          price: number
          price_suv?: number
          price_van?: number
          short_description?: string | null
          slug: string
          sort_order?: number
          title_subline?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number
          featured?: boolean
          features?: string[] | null
          id?: string
          image_url?: string | null
          images?: Json
          is_active?: boolean
          name?: string
          price?: number
          price_suv?: number
          price_van?: number
          short_description?: string | null
          slug?: string
          sort_order?: number
          title_subline?: string | null
        }
        Relationships: []
      }
      site_settings: {
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
      vehicles: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          make: string | null
          model: string | null
          photo_url: string | null
          registration: string | null
          storage_path: string | null
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          make?: string | null
          model?: string | null
          photo_url?: string | null
          registration?: string | null
          storage_path?: string | null
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          make?: string | null
          model?: string | null
          photo_url?: string | null
          registration?: string | null
          storage_path?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "staff"
      booking_status:
        | "booked"
        | "in_progress"
        | "completed"
        | "paid"
        | "cancelled"
      lead_status: "new" | "contacted" | "quoted" | "converted" | "lost"
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
      app_role: ["admin", "staff"],
      booking_status: [
        "booked",
        "in_progress",
        "completed",
        "paid",
        "cancelled",
      ],
      lead_status: ["new", "contacted", "quoted", "converted", "lost"],
    },
  },
} as const
