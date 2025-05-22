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
      payments: {
        Row: {
          id: string
          created_at: string
          amount: string
          payment_method: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          amount: string
          payment_method: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          amount?: string
          payment_method?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          user_id?: string
        }
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          read: boolean
          type: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          read?: boolean
          type: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          read?: boolean
          type?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'super_admin' | 'registered_user' | 'subscriber' | 'free_user'
      payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
    }
  }
} 