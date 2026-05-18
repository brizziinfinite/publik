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
          niche: string | null
          tone: string | null
          target_persona: string | null
          pillars: Json[]
          forbidden_topics: string[]
          is_active: boolean
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
          niche?: string | null
          tone?: string | null
          target_persona?: string | null
          pillars?: Json[]
          forbidden_topics?: string[]
          is_active?: boolean
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
          niche?: string | null
          tone?: string | null
          target_persona?: string | null
          pillars?: Json[]
          forbidden_topics?: string[]
          is_active?: boolean
        }
        Relationships: []
      }
      brand_plans: {
        Row: {
          id: string
          brand_id: string
          user_id: string
          goal_primary: string
          goal_metric: string
          goal_target_value: number
          goal_current_value: number
          support_metrics: Json[]
          timeline_days: number
          started_at: string
          deadline: string
          current_phase: "validate_message" | "validate_offer" | "predictable_sales" | "scale_acquisition"
          current_blocker: string | null
          brand_assets: Json
          weekly_priorities: Json[]
          pricing: Json
          main_offer: string | null
          main_cta: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          user_id: string
          goal_primary: string
          goal_metric: string
          goal_target_value: number
          goal_current_value?: number
          support_metrics?: Json[]
          timeline_days: number
          started_at?: string
          current_phase: "validate_message" | "validate_offer" | "predictable_sales" | "scale_acquisition"
          current_blocker?: string | null
          brand_assets?: Json
          weekly_priorities?: Json[]
          pricing?: Json
          main_offer?: string | null
          main_cta?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          user_id?: string
          goal_primary?: string
          goal_metric?: string
          goal_target_value?: number
          goal_current_value?: number
          support_metrics?: Json[]
          timeline_days?: number
          started_at?: string
          current_phase?: "validate_message" | "validate_offer" | "predictable_sales" | "scale_acquisition"
          current_blocker?: string | null
          brand_assets?: Json
          weekly_priorities?: Json[]
          pricing?: Json
          main_offer?: string | null
          main_cta?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      content_ideas: {
        Row: {
          id: string
          brand_id: string
          user_id: string
          plan_id: string | null
          angle: string
          topic: string
          hook: string | null
          detail: string | null
          cta: string | null
          format: "carrossel" | "reel" | "story" | "blog" | "email" | "post"
          pillar: string | null
          rationale: string | null
          contributes_to: string | null
          scheduled_for: string | null
          week_of: string | null
          status: "pending" | "approved" | "rejected" | "generated" | "posted" | "archived"
          post_id: string | null
          generated_by: string
          llm_model: string | null
          llm_cost_usd: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          user_id: string
          plan_id?: string | null
          angle: string
          topic: string
          hook?: string | null
          detail?: string | null
          cta?: string | null
          format: "carrossel" | "reel" | "story" | "blog" | "email" | "post"
          pillar?: string | null
          rationale?: string | null
          contributes_to?: string | null
          scheduled_for?: string | null
          week_of?: string | null
          status?: "pending" | "approved" | "rejected" | "generated" | "posted" | "archived"
          post_id?: string | null
          generated_by?: string
          llm_model?: string | null
          llm_cost_usd?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          user_id?: string
          plan_id?: string | null
          angle?: string
          topic?: string
          hook?: string | null
          detail?: string | null
          cta?: string | null
          format?: "carrossel" | "reel" | "story" | "blog" | "email" | "post"
          pillar?: string | null
          rationale?: string | null
          contributes_to?: string | null
          scheduled_for?: string | null
          week_of?: string | null
          status?: "pending" | "approved" | "rejected" | "generated" | "posted" | "archived"
          post_id?: string | null
          generated_by?: string
          llm_model?: string | null
          llm_cost_usd?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_ideas_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_runs: {
        Row: {
          id: string
          agent_name: string
          brand_id: string | null
          user_id: string | null
          status: "running" | "success" | "failed" | "partial"
          input_payload: Json | null
          output_payload: Json | null
          error_message: string | null
          llm_provider: string | null
          llm_model: string | null
          input_tokens: number | null
          output_tokens: number | null
          cost_usd: number
          duration_ms: number | null
          started_at: string
          finished_at: string | null
        }
        Insert: {
          id?: string
          agent_name: string
          brand_id?: string | null
          user_id?: string | null
          status: "running" | "success" | "failed" | "partial"
          input_payload?: Json | null
          output_payload?: Json | null
          error_message?: string | null
          llm_provider?: string | null
          llm_model?: string | null
          input_tokens?: number | null
          output_tokens?: number | null
          cost_usd?: number
          duration_ms?: number | null
          started_at?: string
          finished_at?: string | null
        }
        Update: {
          id?: string
          agent_name?: string
          brand_id?: string | null
          user_id?: string | null
          status?: "running" | "success" | "failed" | "partial"
          input_payload?: Json | null
          output_payload?: Json | null
          error_message?: string | null
          llm_provider?: string | null
          llm_model?: string | null
          input_tokens?: number | null
          output_tokens?: number | null
          cost_usd?: number
          duration_ms?: number | null
          finished_at?: string | null
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
export type BrandPlan = Tables<"brand_plans">
export type ContentIdea = Tables<"content_ideas">
export type AgentRun = Tables<"agent_runs">
