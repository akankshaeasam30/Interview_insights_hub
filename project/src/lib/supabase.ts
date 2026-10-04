import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  current_round: string;
  created_at: string;
  updated_at: string;
}

export interface RoundAttempt {
  id: string;
  user_id: string;
  round_type: string;
  category?: string;
  score: number;
  total_questions: number;
  time_taken: number;
  passed: boolean;
  answers: any[];
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  aptitude_completed: boolean;
  technical_completed: boolean;
  coding_completed: boolean;
  hr_completed: boolean;
  aptitude_score: number;
  technical_score: number;
  coding_score: number;
  hr_score: number;
  overall_status: string;
  updated_at: string;
}
