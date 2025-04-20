
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
          category: string
          expiry_date: string
          created_at: string
          notes: string | null
          image: string | null
          storage_instructions: string | null
          opened: boolean
          opened_date: string | null
          dosage: string | null
          prescription_details: string | null
          frequency: string | null
          open_after_use: string | null
          deletion_reason: string | null
          deleted_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          expiry_date: string
          created_at?: string
          notes?: string | null
          image?: string | null
          storage_instructions?: string | null
          opened?: boolean
          opened_date?: string | null
          dosage?: string | null
          prescription_details?: string | null
          frequency?: string | null
          open_after_use?: string | null
          deletion_reason?: string | null
          deleted_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          expiry_date?: string
          created_at?: string
          notes?: string | null
          image?: string | null
          storage_instructions?: string | null
          opened?: boolean
          opened_date?: string | null
          dosage?: string | null
          prescription_details?: string | null
          frequency?: string | null
          open_after_use?: string | null
          deletion_reason?: string | null
          deleted_at?: string | null
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
