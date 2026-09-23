export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          credits: number;
          fal_api_key: string | null;
          explabs_api_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          credits?: number;
          fal_api_key?: string | null;
          explabs_api_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          credits?: number;
          fal_api_key?: string | null;
          explabs_api_key?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          thumbnail_url: string | null;
          graph_state: Json | null;
          status: "draft" | "generating" | "complete";
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          graph_state?: Json | null;
          status?: "draft" | "generating" | "complete";
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          graph_state?: Json | null;
          status?: "draft" | "generating" | "complete";
          is_public?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      assets: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          type: "character" | "location" | "image" | "video" | "audio";
          name: string;
          url: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          type: "character" | "location" | "image" | "video" | "audio";
          name: string;
          url: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          project_id?: string | null;
          type?: "character" | "location" | "image" | "video" | "audio";
          name?: string;
          url?: string;
          metadata?: Json | null;
        };
        Relationships: [];
      };
      generations: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          node_id: string;
          type: "image" | "video";
          status: "pending" | "processing" | "completed" | "failed";
          prompt: string;
          input_asset_ids: string[];
          output_url: string | null;
          error: string | null;
          credits_used: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          node_id: string;
          type: "image" | "video";
          status?: "pending" | "processing" | "completed" | "failed";
          prompt: string;
          input_asset_ids?: string[];
          output_url?: string | null;
          error?: string | null;
          credits_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "pending" | "processing" | "completed" | "failed";
          output_url?: string | null;
          error?: string | null;
          credits_used?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      scenes: {
        Row: {
          id: string;
          project_id: string;
          order_index: number;
          title: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          order_index?: number;
          title?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          order_index?: number;
          title?: string;
          description?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      shots: {
        Row: {
          id: string;
          scene_id: string;
          project_id: string;
          order_index: number;
          title: string;
          shot_spec: Json;
          node_id: string | null;
          status: "idle" | "image_pending" | "image_processing" | "video_pending" | "video_processing" | "completed" | "failed";
          image_url: string | null;
          video_url: string | null;
          variation_urls: string[];
          error: string | null;
          trigger_run_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          scene_id: string;
          project_id: string;
          order_index?: number;
          title?: string;
          shot_spec?: Json;
          node_id?: string | null;
          status?: "idle" | "image_pending" | "image_processing" | "video_pending" | "video_processing" | "completed" | "failed";
          image_url?: string | null;
          video_url?: string | null;
          variation_urls?: string[];
          error?: string | null;
          trigger_run_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          order_index?: number;
          title?: string;
          shot_spec?: Json;
          node_id?: string | null;
          status?: "idle" | "image_pending" | "image_processing" | "video_pending" | "video_processing" | "completed" | "failed";
          image_url?: string | null;
          video_url?: string | null;
          variation_urls?: string[];
          error?: string | null;
          trigger_run_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      templates: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string;
          thumbnail_url: string | null;
          graph_snapshot: Json;
          is_featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category: string;
          thumbnail_url?: string | null;
          graph_snapshot: Json;
          is_featured?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          category?: string;
          thumbnail_url?: string | null;
          graph_snapshot?: Json;
          is_featured?: boolean;
        };
        Relationships: [];
      };
      rate_limits: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          created_at?: string;
        };
        Update: {
          action?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_credits: {
        Args: { uid: string; amount: number };
        Returns: undefined;
      };
      deduct_credits: {
        Args: { amount: number };
        Returns: boolean;
      };
      check_rate_limit: {
        Args: { p_action: string; p_max_calls: number; p_window_seconds: number };
        Returns: boolean;
      };
      cleanup_rate_limits: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
