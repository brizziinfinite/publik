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
      brands: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          brand_id: string
          content: string | null
          created_at: string
          id: string
          media_urls: string[]
          platform: Database["public"]["Enums"]["post_platform"]
          published_at: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["post_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id: string
          content?: string | null
          created_at?: string
          id?: string
          media_urls?: string[]
          platform: Database["public"]["Enums"]["post_platform"]
          published_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string
          content?: string | null
          created_at?: string
          id?: string
          media_urls?: string[]
          platform?: Database["public"]["Enums"]["post_platform"]
          published_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          id: string
          user_id: string
          brand_id: string
          platform: "instagram" | "facebook" | "tiktok"
          access_token: string
          refresh_token: string | null
          token_expires_at: string | null
          account_id: string
          account_name: string | null
          account_avatar: string | null
          scopes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          brand_id: string
          platform: "instagram" | "facebook" | "tiktok"
          access_token: string
          refresh_token?: string | null
          token_expires_at?: string | null
          account_id: string
          account_name?: string | null
          account_avatar?: string | null
          scopes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          brand_id?: string
          platform?: "instagram" | "facebook" | "tiktok"
          access_token?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          account_id?: string
          account_name?: string | null
          account_avatar?: string | null
          scopes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
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
      post_platform: "instagram" | "tiktok" | "facebook" | "twitter"
      post_status: "draft" | "scheduled" | "published" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

// Helpers de conveniência
export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]

export type Enums<T extends keyof DefaultSchema["Enums"]> =
  DefaultSchema["Enums"][T]

// Tipos de conveniência para usar no app
export type Profile = Tables<"profiles">
export type Brand = Tables<"brands">
export type Post = Tables<"posts">
export type PostStatus = Enums<"post_status">
export type PostPlatform = Enums<"post_platform">
export type SocialAccount = Tables<"social_accounts">
export type SocialPlatform = SocialAccount["platform"]
