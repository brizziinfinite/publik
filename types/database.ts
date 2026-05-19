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
      agent_runs: {
        Row: {
          agent_name: string
          brand_id: string | null
          cost_usd: number
          duration_ms: number | null
          error_message: string | null
          finished_at: string | null
          id: string
          input_payload: Json | null
          input_tokens: number | null
          llm_model: string | null
          llm_provider: string | null
          output_payload: Json | null
          output_tokens: number | null
          started_at: string
          status: string
          user_id: string | null
        }
        Insert: {
          agent_name: string
          brand_id?: string | null
          cost_usd?: number
          duration_ms?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input_payload?: Json | null
          input_tokens?: number | null
          llm_model?: string | null
          llm_provider?: string | null
          output_payload?: Json | null
          output_tokens?: number | null
          started_at?: string
          status: string
          user_id?: string | null
        }
        Update: {
          agent_name?: string
          brand_id?: string | null
          cost_usd?: number
          duration_ms?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input_payload?: Json | null
          input_tokens?: number | null
          llm_model?: string | null
          llm_provider?: string | null
          output_payload?: Json | null
          output_tokens?: number | null
          started_at?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_runs_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_photos: {
        Row: {
          alt_text: string | null
          brand_id: string
          created_at: string | null
          height: number | null
          id: string
          public_url: string
          size_bytes: number | null
          storage_path: string
          tags: string[] | null
          uploaded_by: string | null
          used_count: number | null
          user_id: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          brand_id: string
          created_at?: string | null
          height?: number | null
          id?: string
          public_url: string
          size_bytes?: number | null
          storage_path: string
          tags?: string[] | null
          uploaded_by?: string | null
          used_count?: number | null
          user_id: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          brand_id?: string
          created_at?: string | null
          height?: number | null
          id?: string
          public_url?: string
          size_bytes?: number | null
          storage_path?: string
          tags?: string[] | null
          uploaded_by?: string | null
          used_count?: number | null
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_photos_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_plans: {
        Row: {
          brand_assets: Json
          brand_id: string
          created_at: string
          current_blocker: string | null
          current_phase: string
          deadline: string | null
          goal_current_value: number
          goal_metric: string
          goal_primary: string
          goal_target_value: number
          id: string
          is_active: boolean
          main_cta: string | null
          main_offer: string | null
          pricing: Json
          started_at: string
          support_metrics: Json
          timeline_days: number
          updated_at: string
          user_id: string
          weekly_priorities: Json
        }
        Insert: {
          brand_assets?: Json
          brand_id: string
          created_at?: string
          current_blocker?: string | null
          current_phase: string
          deadline?: string | null
          goal_current_value?: number
          goal_metric: string
          goal_primary: string
          goal_target_value: number
          id?: string
          is_active?: boolean
          main_cta?: string | null
          main_offer?: string | null
          pricing?: Json
          started_at?: string
          support_metrics?: Json
          timeline_days: number
          updated_at?: string
          user_id: string
          weekly_priorities?: Json
        }
        Update: {
          brand_assets?: Json
          brand_id?: string
          created_at?: string
          current_blocker?: string | null
          current_phase?: string
          deadline?: string | null
          goal_current_value?: number
          goal_metric?: string
          goal_primary?: string
          goal_target_value?: number
          id?: string
          is_active?: boolean
          main_cta?: string | null
          main_offer?: string | null
          pricing?: Json
          started_at?: string
          support_metrics?: Json
          timeline_days?: number
          updated_at?: string
          user_id?: string
          weekly_priorities?: Json
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
      brands: {
        Row: {
          audience: string | null
          created_at: string
          forbidden_topics: string[]
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          niche: string | null
          pillars: Json
          primary_color: string | null
          segment: string | null
          slug: string
          target_persona: string | null
          tone: string | null
          updated_at: string
          user_id: string
          visual_identity_v2: Json | null
          visual_kit_id: string | null
          voice: string | null
        }
        Insert: {
          audience?: string | null
          created_at?: string
          forbidden_topics?: string[]
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          niche?: string | null
          pillars?: Json
          primary_color?: string | null
          segment?: string | null
          slug: string
          target_persona?: string | null
          tone?: string | null
          updated_at?: string
          user_id: string
          visual_identity_v2?: Json | null
          visual_kit_id?: string | null
          voice?: string | null
        }
        Update: {
          audience?: string | null
          created_at?: string
          forbidden_topics?: string[]
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          niche?: string | null
          pillars?: Json
          primary_color?: string | null
          segment?: string | null
          slug?: string
          target_persona?: string | null
          tone?: string | null
          updated_at?: string
          user_id?: string
          visual_identity_v2?: Json | null
          visual_kit_id?: string | null
          voice?: string | null
        }
        Relationships: []
      }
      content_assets: {
        Row: {
          brand_id: string
          content: Json | null
          created_at: string
          error_message: string | null
          id: string
          kind: Database["public"]["Enums"]["asset_kind"]
          package_id: string
          source_id: string
          status: Database["public"]["Enums"]["asset_status"]
          tokens_input: number | null
          tokens_output: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id: string
          content?: Json | null
          created_at?: string
          error_message?: string | null
          id?: string
          kind: Database["public"]["Enums"]["asset_kind"]
          package_id: string
          source_id: string
          status?: Database["public"]["Enums"]["asset_status"]
          tokens_input?: number | null
          tokens_output?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string
          content?: Json | null
          created_at?: string
          error_message?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["asset_kind"]
          package_id?: string
          source_id?: string
          status?: Database["public"]["Enums"]["asset_status"]
          tokens_input?: number | null
          tokens_output?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_assets_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_assets_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      content_ideas: {
        Row: {
          angle: string
          brand_id: string
          contributes_to: string | null
          created_at: string
          cta: string | null
          detail: string | null
          format: string
          generated_by: string
          hook: string | null
          id: string
          llm_cost_usd: number
          llm_model: string | null
          package_id: string | null
          pillar: string | null
          plan_id: string | null
          post_id: string | null
          rationale: string | null
          scheduled_for: string | null
          status: string
          topic: string
          updated_at: string
          user_id: string
          week_of: string | null
        }
        Insert: {
          angle: string
          brand_id: string
          contributes_to?: string | null
          created_at?: string
          cta?: string | null
          detail?: string | null
          format: string
          generated_by?: string
          hook?: string | null
          id?: string
          llm_cost_usd?: number
          llm_model?: string | null
          package_id?: string | null
          pillar?: string | null
          plan_id?: string | null
          post_id?: string | null
          rationale?: string | null
          scheduled_for?: string | null
          status?: string
          topic: string
          updated_at?: string
          user_id: string
          week_of?: string | null
        }
        Update: {
          angle?: string
          brand_id?: string
          contributes_to?: string | null
          created_at?: string
          cta?: string | null
          detail?: string | null
          format?: string
          generated_by?: string
          hook?: string | null
          id?: string
          llm_cost_usd?: number
          llm_model?: string | null
          package_id?: string | null
          pillar?: string | null
          plan_id?: string | null
          post_id?: string | null
          rationale?: string | null
          scheduled_for?: string | null
          status?: string
          topic?: string
          updated_at?: string
          user_id?: string
          week_of?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_ideas_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_ideas_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "content_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_ideas_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "brand_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_ideas_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      content_packages: {
        Row: {
          blog_content: Json | null
          brand_id: string
          carousel_slides: Json | null
          created_at: string
          email_content: Json | null
          error_message: string | null
          estimated_post_length: number | null
          format: string
          generated_by: string
          generation_attempts: number
          id: string
          idea_id: string
          layout_plan: Json | null
          llm_cost_usd: number
          llm_model: string | null
          llm_provider: string | null
          post_content: Json | null
          post_id: string | null
          reel_script: Json | null
          render_error: string | null
          rendered_at: string | null
          rendered_image_urls: string[] | null
          status: string
          story_frames: Json | null
          updated_at: string
          user_id: string
          visual_prompt: string | null
        }
        Insert: {
          blog_content?: Json | null
          brand_id: string
          carousel_slides?: Json | null
          created_at?: string
          email_content?: Json | null
          error_message?: string | null
          estimated_post_length?: number | null
          format: string
          generated_by?: string
          generation_attempts?: number
          id?: string
          idea_id: string
          layout_plan?: Json | null
          llm_cost_usd?: number
          llm_model?: string | null
          llm_provider?: string | null
          post_content?: Json | null
          post_id?: string | null
          reel_script?: Json | null
          render_error?: string | null
          rendered_at?: string | null
          rendered_image_urls?: string[] | null
          status?: string
          story_frames?: Json | null
          updated_at?: string
          user_id: string
          visual_prompt?: string | null
        }
        Update: {
          blog_content?: Json | null
          brand_id?: string
          carousel_slides?: Json | null
          created_at?: string
          email_content?: Json | null
          error_message?: string | null
          estimated_post_length?: number | null
          format?: string
          generated_by?: string
          generation_attempts?: number
          id?: string
          idea_id?: string
          layout_plan?: Json | null
          llm_cost_usd?: number
          llm_model?: string | null
          llm_provider?: string | null
          post_content?: Json | null
          post_id?: string | null
          reel_script?: Json | null
          render_error?: string | null
          rendered_at?: string | null
          rendered_image_urls?: string[] | null
          status?: string
          story_frames?: Json | null
          updated_at?: string
          user_id?: string
          visual_prompt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_packages_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_packages_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "content_ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_packages_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          asset_id: string | null
          brand_id: string
          content: string | null
          created_at: string
          id: string
          media_urls: string[]
          platform: Database["public"]["Enums"]["post_platform"]
          published_at: string | null
          scheduled_at: string | null
          source_id: string | null
          status: Database["public"]["Enums"]["post_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_id?: string | null
          brand_id: string
          content?: string | null
          created_at?: string
          id?: string
          media_urls?: string[]
          platform: Database["public"]["Enums"]["post_platform"]
          published_at?: string | null
          scheduled_at?: string | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_id?: string | null
          brand_id?: string
          content?: string | null
          created_at?: string
          id?: string
          media_urls?: string[]
          platform?: Database["public"]["Enums"]["post_platform"]
          published_at?: string | null
          scheduled_at?: string | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "content_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
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
      social_accounts: {
        Row: {
          access_token: string
          account_avatar: string | null
          account_id: string
          account_name: string | null
          brand_id: string
          created_at: string
          id: string
          is_active: boolean
          platform: string
          refresh_token: string | null
          scopes: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          account_avatar?: string | null
          account_id: string
          account_name?: string | null
          brand_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          platform: string
          refresh_token?: string | null
          scopes?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          account_avatar?: string | null
          account_id?: string
          account_name?: string | null
          brand_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          platform?: string
          refresh_token?: string | null
          scopes?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_accounts_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          brand_id: string
          created_at: string
          error_message: string | null
          extracted_metadata: Json | null
          extracted_text: string | null
          id: string
          raw_text: string | null
          raw_url: string | null
          status: Database["public"]["Enums"]["source_status"]
          storage_path: string | null
          type: Database["public"]["Enums"]["source_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          error_message?: string | null
          extracted_metadata?: Json | null
          extracted_text?: string | null
          id?: string
          raw_text?: string | null
          raw_url?: string | null
          status?: Database["public"]["Enums"]["source_status"]
          storage_path?: string | null
          type: Database["public"]["Enums"]["source_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          error_message?: string | null
          extracted_metadata?: Json | null
          extracted_text?: string | null
          id?: string
          raw_text?: string | null
          raw_url?: string | null
          status?: Database["public"]["Enums"]["source_status"]
          storage_path?: string | null
          type?: Database["public"]["Enums"]["source_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sources_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      visual_kits: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          layout_preferences: Json | null
          mood: string
          name: string
          palette: Json
          preview_image_url: string | null
          segments: string[] | null
          typography: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id: string
          is_active?: boolean | null
          layout_preferences?: Json | null
          mood: string
          name: string
          palette: Json
          preview_image_url?: string | null
          segments?: string[] | null
          typography: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          layout_preferences?: Json | null
          mood?: string
          name?: string
          palette?: Json
          preview_image_url?: string | null
          segments?: string[] | null
          typography?: Json
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
      asset_kind: "carousel" | "stories" | "reel_script" | "email" | "blog"
      asset_status: "pending" | "generating" | "ready" | "failed"
      post_platform: "instagram" | "tiktok" | "facebook" | "twitter"
      post_status: "draft" | "scheduled" | "published" | "failed"
      source_status:
        | "queued"
        | "extracting"
        | "extracted"
        | "generating"
        | "ready"
        | "partial"
        | "failed"
      source_type: "text" | "audio" | "url" | "pdf"
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
      asset_kind: ["carousel", "stories", "reel_script", "email", "blog"],
      asset_status: ["pending", "generating", "ready", "failed"],
      post_platform: ["instagram", "tiktok", "facebook", "twitter"],
      post_status: ["draft", "scheduled", "published", "failed"],
      source_status: [
        "queued",
        "extracting",
        "extracted",
        "generating",
        "ready",
        "partial",
        "failed",
      ],
      source_type: ["text", "audio", "url", "pdf"],
    },
  },
} as const

// ─── Convenience aliases ──────────────────────────────────────
export type Brand = Tables<"brands">
export type Post = Tables<"posts">
export type Profile = Tables<"profiles">
export type BrandPhoto = Tables<"brand_photos">
export type VisualKit = Tables<"visual_kits">
export type ContentPackage = Tables<"content_packages">
export type AgentRun = Tables<"agent_runs">
export type BrandPlan = Tables<"brand_plans">
export type SocialAccount = Tables<"social_accounts">

// ─── Enum aliases ─────────────────────────────────────────────
export type PostStatus = Enums<"post_status">
export type SocialPlatform = Enums<"post_platform">
