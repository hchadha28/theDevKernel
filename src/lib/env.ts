// code for using zod for easier error handling
import { z } from 'zod';

// defining schema for env file 
const envSchema = z.object({
  // need a z string of min size 1 else safeParse will fail and give error 
  PUBLIC_SUPABASE_URL: z.string().min(1, 'PUBLIC_SUPABASE_URL is required in .env'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'SUPABASE_SERVICE_KEY is required in .env'),

  MAILTRAP_HOST: z.string().min(1, 'MAILTRAP_HOST is required in .env'),
  MAILTRAP_PORT: z.string().min(1, 'MAILTRAP_PORT is required in .env'),
  MAILTRAP_USER: z.string().min(1, 'MAILTRAP_USER is required in .env'),
  MAILTRAP_PASS: z.string().min(1, 'MAILTRAP_PASS is required in .env'),

  PUBLIC_SITE_URL: z.string().min(1, 'PUBLIC_SITE_URL is required in .env'),
  PUBLIC_MAIL_FROM: z.string().min(1, 'PUBLIC_MAIL_FROM is required in .env'),
});

/**
 * This is the "Bouncer" that enforces the rules.
 *
 * 1. `import.meta.env`: This is the object Astro/Vite gives us after
 * it reads our .env file. this is a javascript object 
 *
 * 2. `envSchema.safeParse(...)`: We ask Zod to "safely check"
 * this object against our rulebook. "Safely" means it
 * won't crash, it will just return a report.
 */
const parseResult = envSchema.safeParse(import.meta.env);

/**
 * This is the "Fail Fast" check.
 * If the `parseResult` report says `success: false`, it means
 * a key is missing or wrong. We will print a *clean* error
 * and *intentionally crash the app* to prevent a future bug.
 */
if (!parseResult.success) {
  console.error(
    '❌ Invalid environment variables:',
    // `.flatten().fieldErrors` gives us a clean object
    // e.g., { MAILTRAP_PASS: ["is required"] }
    parseResult.error.flatten().fieldErrors,
  );
  throw new Error('Invalid environment variables. Check .env file and restart the server.');
}

/**
 * If we get here, it means all our keys are valid!
 *
 * We now export `parseResult.data` as a clean, type-safe
 * object named `env`.
 *
 * Any other file in our "engine" can now import this `env`
 * object and safely use `env.MAILTRAP_HOST`, etc.
 */
export const env = parseResult.data;