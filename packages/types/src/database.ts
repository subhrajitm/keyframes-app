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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          credits?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          credits?: number;
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
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          graph_state?: Json | null;
          status?: "draft" | "generating" | "complete";
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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
