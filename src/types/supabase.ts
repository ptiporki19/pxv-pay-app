export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          role: 'super_admin' | 'registered_user' | 'subscriber' | 'free_user'
          active: boolean
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          role?: 'super_admin' | 'registered_user' | 'subscriber' | 'free_user'
          active?: boolean
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          role?: 'super_admin' | 'registered_user' | 'subscriber' | 'free_user'
          active?: boolean
        }
      }
      // We will add more tables as we build the application
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'super_admin' | 'registered_user' | 'subscriber' | 'free_user'
    }
  }
} 