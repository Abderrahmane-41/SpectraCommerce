// src/integrations/supabase/types.ts

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
      orders: {
        Row: {
          color: string
          commune: string
          created_at: string | null
          customer_name: string
          customer_phone: string
          full_address: string
          id: string
          product_name: string
          size: string
          status: string | null
          total_price: number
          updated_at: string | null
          wilaya: string
          product_id: string
          ip_address?: string
          quantity: number
          order_time: string
          is_synced_to_gsheet: boolean | null// Add this line
        }
        Insert: {
          color: string
          commune: string
          created_at?: string | null
          customer_name: string
          customer_phone: string
          full_address: string
          product_id: string
          ip_address?: string
          quantity: number
          id?: string
          product_name: string
          size: string
          status?: string | null
          total_price: number
          updated_at?: string | null
          wilaya: string
          order_time?: string
          is_synced_to_gsheet?: boolean | null // Add this line
        }
        Update: {
          color?: string
          commune?: string
          created_at?: string | null
          customer_name?: string
          customer_phone?: string
          full_address?: string
          id?: string
          product_name?: string
          size?: string
          status?: string | null
          total_price?: number
          updated_at?: string | null
          wilaya?: string
          product_id?: string
          ip_address?: string
          quantity?: number
          order_time?: string
          is_synced_to_gsheet?: boolean | null // Add this line
        }
        Relationships: []
      }
      product_types: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          base_price: number
          created_at: string | null
          price_before_discount: number | null
          description: string | null
          id: string
          images: string[] | null
          name: string
          options: Json | null
          product_type_id: string | null
          updated_at: string | null
          quantity_offers: Json | null
          description_content?: Json | null
          min_quantity: number
          max_quantity: number | null
        }
        Insert: {
          base_price: number
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          name: string
          options?: Json | null
          product_type_id?: string | null
          price_before_discount?: number | null
          updated_at?: string | null
          quantity_offers?: Json | null
          description_content?: Json | null
          min_quantity: number
          max_quantity: number | null
        }
        Update: {
          base_price?: number
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          name?: string
          options?: Json | null
          product_type_id?: string | null
          updated_at?: string | null
          quantity_offers?: Json | null
          description_content?: Json | null
          min_quantity: number
          max_quantity: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "product_types"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: { // Add this new table definition
        Row: {
          id: number
          store_name: string
          logo_url: string
          hero_images: string[]
          social_media: Json
          phone_number: string
          facebook_pixel_id: string | null // Added
          created_at: string
          updated_at: string
          google_sheet_api_url?: string | null // Added
        }
        Insert: {
          id?: number
          store_name: string
          logo_url: string
          hero_images: string[]
          social_media: Json
          phone_number: string
          facebook_pixel_id?: string | null // Added
          created_at?: string
          updated_at?: string
          google_sheet_api_url?: string | null // Added
        }
        Update: {
          id?: number
          store_name?: string
          logo_url?: string
          hero_images?: string[]
          social_media?: Json
          phone_number?: string
          facebook_pixel_id?: string | null // Added
          created_at?: string
          updated_at?: string
          google_sheet_api_url?: string | null // Added
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          product_id: string | null
          rating: number
          reviewer_name: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating: number
          reviewer_name?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating?: number
          reviewer_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_data: {
        Row: {
          base_price: number
          communes: string[]
          created_at: string
          id: string
          updated_at: string
          wilaya: string
          shipping_home_price:number
        }
        Insert: {
          base_price?: number
          communes?: string[]
          created_at?: string
          id?: string
          updated_at?: string
          wilaya: string
          shipping_home_price:number
        }
        Update: {
          base_price?: number
          communes?: string[]
          created_at?: string
          id?: string
          updated_at?: string
          wilaya?: string
          shipping_home_price?:number
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