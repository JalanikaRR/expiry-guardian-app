
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
      products: {
        Row: {
          id: string
          name: string
          category: 'food' | 'medicine' | 'cosmetics' | 'other'
          expiry_date: string
          created_at: string
          notes?: string
          image?: string
          storage_instructions?: string
          opened?: boolean
          opened_date?: string
          dosage?: string
          prescription_details?: string
          frequency?: string
          open_after_use?: string
          deletion_reason?: 'consumed' | 'expired' | 'discarded' | 'other'
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          category: 'food' | 'medicine' | 'cosmetics' | 'other'
          expiry_date: string
          created_at?: string
          notes?: string
          image?: string
          storage_instructions?: string
          opened?: boolean
          opened_date?: string
          dosage?: string
          prescription_details?: string
          frequency?: string
          open_after_use?: string
          deletion_reason?: 'consumed' | 'expired' | 'discarded' | 'other'
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          category?: 'food' | 'medicine' | 'cosmetics' | 'other'
          expiry_date?: string
          created_at?: string
          notes?: string
          image?: string
          storage_instructions?: string
          opened?: boolean
          opened_date?: string
          dosage?: string
          prescription_details?: string
          frequency?: string
          open_after_use?: string
          deletion_reason?: 'consumed' | 'expired' | 'discarded' | 'other'
          user_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          created_at?: string
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
      [_ in never]: never
    }
  }
}
