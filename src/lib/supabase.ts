import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ClinicRow = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  times: string[];
  created_at: string;
};

export type AvailabilityRow = {
  id: string;
  clinic_id: string;
  available_date: string;
  created_at: string;
};
