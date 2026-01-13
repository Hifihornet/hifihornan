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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_activity_log: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      broadcast_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender_id: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender_id: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender_id?: string
          title?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          listing_id: string | null
          seller_id: string
          status: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          listing_id?: string | null
          seller_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          listing_id?: string | null
          seller_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_views: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          viewer_id: string | null
          viewer_ip_hash: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          viewer_id?: string | null
          viewer_ip_hash?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          viewer_id?: string | null
          viewer_ip_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_views_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          brand: string
          category: string
          condition: string
          created_at: string
          description: string
          id: string
          images: string[] | null
          location: string
          price: number
          status: string
          title: string
          updated_at: string
          user_id: string
          view_count: number
          year: string | null
        }
        Insert: {
          brand: string
          category: string
          condition: string
          created_at?: string
          description: string
          id?: string
          images?: string[] | null
          location: string
          price: number
          status?: string
          title: string
          updated_at?: string
          user_id: string
          view_count?: number
          year?: string | null
        }
        Update: {
          brand?: string
          category?: string
          condition?: string
          created_at?: string
          description?: string
          id?: string
          images?: string[] | null
          location?: string
          price?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number
          year?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_system_message: boolean | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_system_message?: boolean | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_system_message?: boolean | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allow_direct_messages: boolean
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          is_searchable: boolean
          is_verified_seller: boolean
          last_seen: string | null
          location: string | null
          phone: string | null
          setup_images: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_direct_messages?: boolean
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_searchable?: boolean
          is_verified_seller?: boolean
          last_seen?: string | null
          location?: string | null
          phone?: string | null
          setup_images?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_direct_messages?: boolean
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_searchable?: boolean
          is_verified_seller?: boolean
          last_seen?: string | null
          location?: string | null
          phone?: string | null
          setup_images?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promoted_listings: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          is_active: boolean
          listing_id: string
          starts_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          is_active?: boolean
          listing_id: string
          starts_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          is_active?: boolean
          listing_id?: string
          starts_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promoted_listings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      recently_viewed: {
        Row: {
          id: string
          listing_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recently_viewed_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          listing_id: string
          reason: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          listing_id: string
          reason: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          listing_id?: string
          reason?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          listing_id: string | null
          rating: number
          reviewer_id: string
          seller_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id?: string | null
          rating: number
          reviewer_id: string
          seller_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id?: string | null
          rating?: number
          reviewer_id?: string
          seller_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          category: string | null
          created_at: string
          id: string
          keywords: string | null
          last_notified_at: string | null
          location: string | null
          max_price: number | null
          min_price: number | null
          name: string
          notify_email: boolean
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          keywords?: string | null
          last_notified_at?: string | null
          location?: string | null
          max_price?: number | null
          min_price?: number | null
          name: string
          notify_email?: boolean
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          keywords?: string | null
          last_notified_at?: string | null
          location?: string | null
          max_price?: number | null
          min_price?: number | null
          name?: string
          notify_email?: boolean
          user_id?: string
        }
        Relationships: []
      }
      setup_showcases: {
        Row: {
          created_at: string
          description: string | null
          equipment: string[] | null
          id: string
          images: string[]
          likes_count: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          equipment?: string[] | null
          id?: string
          images: string[]
          likes_count?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          equipment?: string[] | null
          id?: string
          images?: string[]
          likes_count?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      showcase_likes: {
        Row: {
          created_at: string
          id: string
          showcase_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          showcase_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          showcase_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "showcase_likes_showcase_id_fkey"
            columns: ["showcase_id"]
            isOneToOne: false
            referencedRelation: "setup_showcases"
            referencedColumns: ["id"]
          },
        ]
      }
      site_visits: {
        Row: {
          id: string
          page_path: string | null
          visited_at: string
          visitor_id: string | null
          visitor_ip_hash: string | null
        }
        Insert: {
          id?: string
          page_path?: string | null
          visited_at?: string
          visitor_id?: string | null
          visitor_ip_hash?: string | null
        }
        Update: {
          id?: string
          page_path?: string | null
          visited_at?: string
          visitor_id?: string | null
          visitor_ip_hash?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_close_support_conversation: {
        Args: { _conversation_id: string }
        Returns: undefined
      }
      admin_create_store_account: {
        Args: { _email: string; _password: string; _store_name: string }
        Returns: string
      }
      admin_delete_listing: {
        Args: { _listing_id: string }
        Returns: undefined
      }
      admin_delete_support_conversation: {
        Args: { _conversation_id: string }
        Returns: undefined
      }
      admin_delete_user: { Args: { _user_id: string }; Returns: undefined }
      admin_get_all_listings: {
        Args: never
        Returns: {
          created_at: string
          id: string
          seller_name: string
          status: string
          title: string
          user_id: string
        }[]
      }
      admin_get_all_profiles: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          display_name: string
          id: string
          last_seen: string
          listing_count: number
          user_id: string
        }[]
      }
      admin_get_all_profiles_with_roles: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          display_name: string
          id: string
          is_verified_seller: boolean
          last_seen: string
          listing_count: number
          roles: string[]
          user_id: string
        }[]
      }
      admin_reopen_support_conversation: {
        Args: { _conversation_id: string }
        Returns: undefined
      }
      admin_send_broadcast: {
        Args: { _content: string; _title: string }
        Returns: string
      }
      admin_send_direct_message: {
        Args: {
          _content: string
          _listing_id: string
          _recipient_user_id: string
        }
        Returns: string
      }
      admin_send_message_to_user: {
        Args: { _content: string; _recipient_user_id: string }
        Returns: string
      }
      admin_set_seller_verified: {
        Args: { _user_id: string; _verified: boolean }
        Returns: undefined
      }
      cleanup_old_listing_views: { Args: never; Returns: undefined }
      cleanup_old_site_visits: { Args: never; Returns: undefined }
      delete_user_account: { Args: { _user_id: string }; Returns: undefined }
      get_listing_favorites_count: {
        Args: { _listing_id: string }
        Returns: number
      }
      get_profile_count: { Args: never; Returns: number }
      get_public_profile: {
        Args: { _user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          display_name: string
          id: string
          setup_images: string[]
          user_id: string
        }[]
      }
      get_public_profile_by_user_id: {
        Args: { _user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          display_name: string
          id: string
          is_verified_seller: boolean
          last_seen: string
          setup_images: string[]
          user_id: string
        }[]
      }
      get_seller_display_name: { Args: { _user_id: string }; Returns: string }
      get_seller_rating: {
        Args: { _seller_id: string }
        Returns: {
          average_rating: number
          review_count: number
        }[]
      }
      get_site_visit_stats: {
        Args: never
        Returns: {
          total_visits: number
          unique_visitors: number
          visits_this_month: number
          visits_this_week: number
          visits_today: number
        }[]
      }
      get_user_messaging_preferences: {
        Args: { _user_id: string }
        Returns: {
          allow_direct_messages: boolean
          is_admin: boolean
        }[]
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      get_user_roles_public: { Args: { _user_id: string }; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_listing_view:
        | { Args: { listing_id: string }; Returns: undefined }
        | { Args: { listing_id: string; viewer_ip?: string }; Returns: boolean }
      is_listing_favorited: {
        Args: { _listing_id: string; _user_id: string }
        Returns: boolean
      }
      is_store_account: { Args: { _user_id: string }; Returns: boolean }
      record_site_visit: {
        Args: { _page_path: string; _visitor_ip?: string }
        Returns: boolean
      }
      search_profiles: {
        Args: { _search_term: string }
        Returns: {
          avatar_url: string
          bio: string
          display_name: string
          id: string
          last_seen: string
          location: string
          user_id: string
        }[]
      }
      send_direct_message_to_user: {
        Args: { _content: string; _recipient_user_id: string }
        Returns: string
      }
      subscribe_to_newsletter: { Args: { _email: string }; Returns: boolean }
      update_user_last_seen: { Args: { _user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "creator" | "admin" | "moderator" | "store"
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
      app_role: ["creator", "admin", "moderator", "store"],
    },
  },
} as const
