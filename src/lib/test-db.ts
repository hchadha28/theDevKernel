import { db } from "./db";
import { env } from "./env"; // We import this to make sure env is loaded first

/**
 * A temporary "smoke test" script.
 * We will run this *once* from the command line to verify
 * that our Supabase credentials in .env are correct.
 */
async function testSupabaseConnection() {
  console.log("Attempting to connect to Supabase...");
  console.log(`Using URL: ${env.PUBLIC_SUPABASE_URL}`);

  try {
    // This is the "test call".
    // We try to fetch the first 1 row from our 'subscribers' table.
    // We don't care about the data. We only care if this
    // command succeeds or fails.
    const { data, error } = await db
      .from("subscribers")
      .select("*") // Select all columns
      .limit(1); // Only get 1 row

    // This is the error check.
    if (error) {
      console.error("❌ CONNECTION FAILED:", error.message);
      console.log("\nCheck your .env file and Supabase Project API settings.");
    } else {
      // If there was no error, the connection worked!
      console.log("✅ SUCCESS! Connected to Supabase.");
      console.log("Test data received (will be empty, this is normal):", data);
    }
  } catch (e: any) {
    console.error("❌ AN UNEXPECTED ERROR OCCURRED:", e.message);
  }
}

// Run the test
testSupabaseConnection();
