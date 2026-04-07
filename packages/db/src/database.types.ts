/**
 * Hand-authored database types.
 * Replace this file with the output of `supabase gen types typescript`
 * once the schema is live.
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'learner' | 'business_owner' | 'admin'
          status: 'active' | 'suspended' | 'pending_verification'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          role_id: string
          progress_pct: number
          enrolled_at: string
          completed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['enrollments']['Row'], 'enrolled_at'>
        Update: Partial<Database['public']['Tables']['enrollments']['Insert']>
      }
      test_attempts: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          status: 'passed' | 'failed' | 'in_progress'
          score: number
          started_at: string
          completed_at: string | null
          cooldown_until: string | null
        }
        Insert: Omit<Database['public']['Tables']['test_attempts']['Row'], 'started_at'>
        Update: Partial<Database['public']['Tables']['test_attempts']['Insert']>
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          role_id: string
          verification_code: string
          issued_at: string
        }
        Insert: Omit<Database['public']['Tables']['certificates']['Row'], 'issued_at'>
        Update: never
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
