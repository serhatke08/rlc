export interface Database {
  public: {
    Tables: {
      listings: {
        Row: {
          id: string;
          title: string;
          description: string;
          seller_id: string;
          category_id: string | null;
          subcategory_id: string | null;
          price: string;
          currency: string | null;
          condition: "new" | "like_new" | "used" | "for_parts";
          is_negotiable: boolean | null;
          city_id: string | null;
          district_id: string | null;
          city_name: string;
          district_name: string | null;
          neighborhood: string | null;
          latitude: string | null;
          longitude: string | null;
          images: string[];
          thumbnail_url: string | null;
          status: "active" | "sold" | "deleted" | "expired" | "pending";
          is_featured: boolean | null;
          is_premium: boolean | null;
          view_count: number | null;
          favorite_count: number | null;
          contact_count: number | null;
          comment_count: number | null;
          created_at: string | null;
          updated_at: string | null;
          expires_at: string | null;
          sold_at: string | null;
          featured_until: string | null;
          slug: string | null;
          metadata: Record<string, unknown> | null;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          seller_id: string;
          category_id?: string | null;
          subcategory_id?: string | null;
          price: string;
          currency?: string | null;
          condition: "new" | "like_new" | "used" | "for_parts";
          is_negotiable?: boolean | null;
          city_id?: string | null;
          district_id?: string | null;
          city_name: string;
          district_name?: string | null;
          neighborhood?: string | null;
          latitude?: string | null;
          longitude?: string | null;
          images?: string[];
          thumbnail_url?: string | null;
          status?: "active" | "sold" | "deleted" | "expired" | "pending";
          is_featured?: boolean | null;
          is_premium?: boolean | null;
          view_count?: number | null;
          favorite_count?: number | null;
          contact_count?: number | null;
          comment_count?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          expires_at?: string | null;
          sold_at?: string | null;
          featured_until?: string | null;
          slug?: string | null;
          metadata?: Record<string, unknown> | null;
        };
        Update: Partial<Database["public"]["Tables"]["listings"]["Row"]>;
      };
      product_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          image_url: string | null;
          parent_id: string | null;
          order_index: number | null;
          is_active: boolean | null;
          listing_count: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          order_index?: number | null;
          is_active?: boolean | null;
          listing_count?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["product_categories"]["Row"]>;
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          website: string | null;
          github: string | null;
          linkedin: string | null;
          twitter: string | null;
          avatar_url: string | null;
          header_media: string | null;
          avatar_bg_color: string | null;
          reputation: number | null;
          total_posts: number | null;
          total_comments: number | null;
          active_badge_icon: string | null;
          joined_at: string | null;
          updated_at: string | null;
          created_at: string | null;
          country_code: string | null;
          follower_count: number | null;
          following_count: number | null;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          username: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      user_follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["user_follows"]["Row"]>;
      };
      listing_favorites: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id: string;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["listing_favorites"]["Row"]>;
      };
      regions: {
        Row: {
          id: string;
          name: string;
          slug: string;
          country_code: string;
          order_index: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          country_code?: string;
          order_index?: number;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["regions"]["Row"]>;
      };
      cities: {
        Row: {
          id: string;
          name: string;
          slug: string;
          country_code: string | null;
          region_id: string | null;
          order_index: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          country_code?: string | null;
          region_id?: string | null;
          order_index?: number | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["cities"]["Row"]>;
      };
    };
  };
}

