import { createClient } from "@supabase/supabase-js";
import { env } from "./env"; // We import our validated keys from the "Guard"

/**
 * This is a TypeScript "interface". It's a "blueprint"
 * that defines the exact shape of our data in the 'subscribers' table.
 */
export interface Subscriber {
  id: number;
  email: string;
  token: string | null; // The token can be 'null' after we verify the user
  verified: boolean;
  unsubscribed: boolean;
  created_at: string; // Supabase gives us this as a string by default
}

/**
 * We create the Supabase client here, once.
 * We pass in our URL and our secret SERVICE_KEY from the `env` object.
 */
const supabase = createClient(
  env.PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      // We set `persistSession: false` to tell it:
      // "Act like a simple, stateless database."
      // This is the correct mode for a backend API.
      persistSession: false,
    },
  }
);

// We export the client as `db` for easy use in other files.
export const db = supabase;
