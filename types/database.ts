export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  brand_id: string;
  user_id: string;
  content: string | null;
  media_urls: string[];
  status: "draft" | "scheduled" | "published" | "failed";
  scheduled_at: string | null;
  published_at: string | null;
  platform: "instagram" | "tiktok" | "facebook" | "twitter";
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      brands: {
        Row: Brand;
        Insert: Omit<Brand, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Brand, "id" | "user_id" | "created_at">>;
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Post, "id" | "user_id" | "created_at">>;
      };
    };
  };
}
