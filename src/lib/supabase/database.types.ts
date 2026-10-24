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
      buildings: {
        Row: {
          city: string
          created_at: string
          district_slug: string
          external_id: string | null
          features: string[]
          house_number: string
          id: string
          location: unknown
          market_area: Database["public"]["Enums"]["market_area"]
          name: string | null
          postal_code: string
          source: Database["public"]["Enums"]["record_source"]
          street: string
          synced_at: string | null
          updated_at: string
        }
        Insert: {
          city?: string
          created_at?: string
          district_slug: string
          external_id?: string | null
          features?: string[]
          house_number?: string
          id?: string
          location?: unknown
          market_area: Database["public"]["Enums"]["market_area"]
          name?: string | null
          postal_code: string
          source?: Database["public"]["Enums"]["record_source"]
          street: string
          synced_at?: string | null
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          district_slug?: string
          external_id?: string | null
          features?: string[]
          house_number?: string
          id?: string
          location?: unknown
          market_area?: Database["public"]["Enums"]["market_area"]
          name?: string | null
          postal_code?: string
          source?: Database["public"]["Enums"]["record_source"]
          street?: string
          synced_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buildings_district_slug_fkey"
            columns: ["district_slug"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["slug"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          email: string
          external_id: string | null
          id: string
          image_url: string | null
          name: string
          phone: string
          role: string
          source: Database["public"]["Enums"]["record_source"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          external_id?: string | null
          id?: string
          image_url?: string | null
          name: string
          phone?: string
          role?: string
          source?: Database["public"]["Enums"]["record_source"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          external_id?: string | null
          id?: string
          image_url?: string | null
          name?: string
          phone?: string
          role?: string
          source?: Database["public"]["Enums"]["record_source"]
          updated_at?: string
        }
        Relationships: []
      }
      districts: {
        Row: {
          center_lat: number | null
          center_lng: number | null
          market_area: Database["public"]["Enums"]["market_area"]
          name: string
          slug: string
        }
        Insert: {
          center_lat?: number | null
          center_lng?: number | null
          market_area: Database["public"]["Enums"]["market_area"]
          name: string
          slug: string
        }
        Update: {
          center_lat?: number | null
          center_lng?: number | null
          market_area?: Database["public"]["Enums"]["market_area"]
          name?: string
          slug?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          company: string | null
          created_at: string
          email: string
          exported_at: string | null
          external_id: string | null
          id: string
          message: string
          name: string
          phone: string | null
          property_id: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          exported_at?: string | null
          external_id?: string | null
          id?: string
          message: string
          name: string
          phone?: string | null
          property_id?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          exported_at?: string | null
          external_id?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string | null
          property_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          archived_at: string | null
          area_range_max_sqm: number | null
          area_range_min_sqm: number | null
          building_id: string
          categories: Database["public"]["Enums"]["property_category"][]
          category: Database["public"]["Enums"]["property_category"]
          commission_free: boolean
          commission_months: number | null
          commission_note: string | null
          contact_id: string | null
          created_at: string
          description: string
          detail_hash: string | null
          expose_pdf_url: string | null
          external_id: string | null
          featured_rank: number | null
          features: string[]
          id: string
          last_seen_at: string | null
          price_note: string | null
          price_type: Database["public"]["Enums"]["price_type"]
          property_type: Database["public"]["Enums"]["property_type"]
          published_at: string | null
          reference_number: string
          slug: string
          source: Database["public"]["Enums"]["record_source"]
          source_hash: string | null
          status: Database["public"]["Enums"]["property_status"]
          synced_at: string | null
          teaser: string
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          area_range_max_sqm?: number | null
          area_range_min_sqm?: number | null
          building_id: string
          categories: Database["public"]["Enums"]["property_category"][]
          category: Database["public"]["Enums"]["property_category"]
          commission_free?: boolean
          commission_months?: number | null
          commission_note?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string
          detail_hash?: string | null
          expose_pdf_url?: string | null
          external_id?: string | null
          featured_rank?: number | null
          features?: string[]
          id?: string
          last_seen_at?: string | null
          price_note?: string | null
          price_type?: Database["public"]["Enums"]["price_type"]
          property_type: Database["public"]["Enums"]["property_type"]
          published_at?: string | null
          reference_number: string
          slug: string
          source?: Database["public"]["Enums"]["record_source"]
          source_hash?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          synced_at?: string | null
          teaser?: string
          title: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          area_range_max_sqm?: number | null
          area_range_min_sqm?: number | null
          building_id?: string
          categories?: Database["public"]["Enums"]["property_category"][]
          category?: Database["public"]["Enums"]["property_category"]
          commission_free?: boolean
          commission_months?: number | null
          commission_note?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string
          detail_hash?: string | null
          expose_pdf_url?: string | null
          external_id?: string | null
          featured_rank?: number | null
          features?: string[]
          id?: string
          last_seen_at?: string | null
          price_note?: string | null
          price_type?: Database["public"]["Enums"]["price_type"]
          property_type?: Database["public"]["Enums"]["property_type"]
          published_at?: string | null
          reference_number?: string
          slug?: string
          source?: Database["public"]["Enums"]["record_source"]
          source_hash?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          synced_at?: string | null
          teaser?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          alt: string
          attempts: number
          checksum: string | null
          created_at: string
          external_id: string | null
          id: string
          last_error: string | null
          processed_at: string | null
          property_id: string
          sort_order: number
          source: Database["public"]["Enums"]["record_source"]
          source_url: string | null
          status: string
          storage_path: string | null
          storage_paths: string[]
          synced_at: string | null
          thumb_url: string | null
          url: string
        }
        Insert: {
          alt?: string
          attempts?: number
          checksum?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          last_error?: string | null
          processed_at?: string | null
          property_id: string
          sort_order?: number
          source?: Database["public"]["Enums"]["record_source"]
          source_url?: string | null
          status?: string
          storage_path?: string | null
          storage_paths?: string[]
          synced_at?: string | null
          thumb_url?: string | null
          url: string
        }
        Update: {
          alt?: string
          attempts?: number
          checksum?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          last_error?: string | null
          processed_at?: string | null
          property_id?: string
          sort_order?: number
          source?: Database["public"]["Enums"]["record_source"]
          source_url?: string | null
          status?: string
          storage_path?: string | null
          storage_paths?: string[]
          synced_at?: string | null
          thumb_url?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_units: {
        Row: {
          area_sqm: number
          available_from: string | null
          created_at: string
          divisible: boolean
          external_id: string | null
          floor: number | null
          id: string
          label: string
          property_id: string
          rent_per_sqm: number | null
          rent_total_monthly: number | null
          rooms: number | null
          service_charge_per_sqm: number | null
          sort_order: number
          source: Database["public"]["Enums"]["record_source"]
          synced_at: string | null
          updated_at: string
        }
        Insert: {
          area_sqm: number
          available_from?: string | null
          created_at?: string
          divisible?: boolean
          external_id?: string | null
          floor?: number | null
          id?: string
          label?: string
          property_id: string
          rent_per_sqm?: number | null
          rent_total_monthly?: number | null
          rooms?: number | null
          service_charge_per_sqm?: number | null
          sort_order?: number
          source?: Database["public"]["Enums"]["record_source"]
          synced_at?: string | null
          updated_at?: string
        }
        Update: {
          area_sqm?: number
          available_from?: string | null
          created_at?: string
          divisible?: boolean
          external_id?: string | null
          floor?: number | null
          id?: string
          label?: string
          property_id?: string
          rent_per_sqm?: number | null
          rent_total_monthly?: number | null
          rooms?: number | null
          service_charge_per_sqm?: number | null
          sort_order?: number
          source?: Database["public"]["Enums"]["record_source"]
          synced_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_runs: {
        Row: {
          error: string | null
          finished_at: string | null
          id: string
          mode: string | null
          source: Database["public"]["Enums"]["record_source"]
          started_at: string
          stats: Json
          status: string
          watermark: string | null
        }
        Insert: {
          error?: string | null
          finished_at?: string | null
          id?: string
          mode?: string | null
          source?: Database["public"]["Enums"]["record_source"]
          started_at?: string
          stats?: Json
          status?: string
          watermark?: string | null
        }
        Update: {
          error?: string | null
          finished_at?: string | null
          id?: string
          mode?: string | null
          source?: Database["public"]["Enums"]["record_source"]
          started_at?: string
          stats?: Json
          status?: string
          watermark?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      property_listings: {
        Row: {
          address: string | null
          area: number | null
          area_range_max: number | null
          area_range_min: number | null
          area_search_max: number | null
          area_search_min: number | null
          building: Json | null
          categories: Database["public"]["Enums"]["property_category"][] | null
          category: Database["public"]["Enums"]["property_category"] | null
          commission_free: boolean | null
          commission_months: number | null
          commission_note: string | null
          contact: Json | null
          description: string | null
          district_name: string | null
          district_slug: string | null
          expose_pdf_url: string | null
          featured_rank: number | null
          features: string[] | null
          id: string | null
          images: Json | null
          lat: number | null
          lng: number | null
          location: unknown
          market_area: Database["public"]["Enums"]["market_area"] | null
          price_note: string | null
          price_type: Database["public"]["Enums"]["price_type"] | null
          property_type: Database["public"]["Enums"]["property_type"] | null
          published_at: string | null
          reference_number: string | null
          reference_sort: number | null
          rent_per_sqm: number | null
          rent_total_monthly: number | null
          slug: string | null
          status: Database["public"]["Enums"]["property_status"] | null
          teaser: string | null
          title: string | null
          units: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "buildings_district_slug_fkey"
            columns: ["district_slug"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["slug"]
          },
        ]
      }
    }
    Functions: {
      invoke_buerohamburg_sync: { Args: { mode: string }; Returns: number }
      search_properties: {
        Args: {
          p_area_max?: number
          p_area_min?: number
          p_bbox?: number[]
          p_category?: Database["public"]["Enums"]["property_category"]
          p_districts?: string[]
          p_features?: string[]
          p_market_area?: Database["public"]["Enums"]["market_area"]
          p_rent_max?: number
          p_rent_min?: number
        }
        Returns: {
          address: string | null
          area: number | null
          area_range_max: number | null
          area_range_min: number | null
          area_search_max: number | null
          area_search_min: number | null
          building: Json | null
          categories: Database["public"]["Enums"]["property_category"][] | null
          category: Database["public"]["Enums"]["property_category"] | null
          commission_free: boolean | null
          commission_months: number | null
          commission_note: string | null
          contact: Json | null
          description: string | null
          district_name: string | null
          district_slug: string | null
          expose_pdf_url: string | null
          featured_rank: number | null
          features: string[] | null
          id: string | null
          images: Json | null
          lat: number | null
          lng: number | null
          location: unknown
          market_area: Database["public"]["Enums"]["market_area"] | null
          price_note: string | null
          price_type: Database["public"]["Enums"]["price_type"] | null
          property_type: Database["public"]["Enums"]["property_type"] | null
          published_at: string | null
          reference_number: string | null
          reference_sort: number | null
          rent_per_sqm: number | null
          rent_total_monthly: number | null
          slug: string | null
          status: Database["public"]["Enums"]["property_status"] | null
          teaser: string | null
          title: string | null
          units: Json | null
        }[]
        SetofOptions: {
          from: "*"
          to: "property_listings"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      market_area:
        | "hh-city"
        | "hh-city-sued"
        | "hh-alster"
        | "hh-west"
        | "hh-nord"
        | "hh-ost"
        | "hh-sued"
      price_type: "qm" | "monat"
      property_category: "buero-praxis" | "laden-gastro" | "lager-logistik"
      property_status:
        | "draft"
        | "published"
        | "reserved"
        | "rented"
        | "archived"
      property_type: "buero" | "laden" | "lager"
      record_source: "manual" | "filemaker"
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
      market_area: [
        "hh-city",
        "hh-city-sued",
        "hh-alster",
        "hh-west",
        "hh-nord",
        "hh-ost",
        "hh-sued",
      ],
      price_type: ["qm", "monat"],
      property_category: ["buero-praxis", "laden-gastro", "lager-logistik"],
      property_status: ["draft", "published", "reserved", "rented", "archived"],
      property_type: ["buero", "laden", "lager"],
      record_source: ["manual", "filemaker"],
    },
  },
} as const
