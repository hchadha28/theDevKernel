import type { APIRoute } from 'astro';
import { db, type Subscriber } from '../../lib/db';
import { env } from '../../lib/env';
import { generateToken, hashToken } from '../../lib/tokens';
import { sendVerificationEmail } from '../../lib/mailer';

// A simple email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * This is the API endpoint for handling new newsletter subscriptions.
 * It's a POST endpoint, meaning it expects to receive data (the email).
 */
export const POST: APIRoute = async ({ request }) => {
  let email: string;

  // --- 1. Get and Validate Email ---
  try {
    const formData = await request.formData();
    const emailValue = formData.get('email');
    
    // Check if email is a string and passes our regex test
    if (typeof emailValue !== 'string' || !EMAIL_REGEX.test(emailValue)) {
      return new Response(
        JSON.stringify({ message: 'Please provide a valid email.' }), 
        { status: 400 } // 400 Bad Request
      );
    }
    email = emailValue;
  } catch (e) {
    // This catches errors in getting formData, e.g., if it wasn't a form
    return new Response(JSON.stringify({ message: 'Invalid form data.' }), { status: 400 });
  }

  try {
    // --- 2. Check if user already exists ---
    const { data: existingSub, error: selectError } = await db
      .from('subscribers')
      .select('*')
      .eq('email', email) // Find a user with this email
      .single(); // We only expect one, or zero

    if (selectError && selectError.code !== 'PGRST116') {
      // 'PGRST116' is the code for "No rows found", which is NOT an error for us.
      // Any other error is a real database problem.
      console.error('Supabase select error:', selectError);
      throw new Error('Database error checking for user.');
    }

    if (existingSub) {
      // User *does* exist.
      if (existingSub.verified) {
        // They are already subscribed and verified.
        return new Response(
          JSON.stringify({ message: 'This email is already subscribed.' }),
          { status: 409 } // 409 Conflict (prevents re-subscribing)
        );
      }
      // If they exist but aren't verified, we can just resend the email.
      // Our code below will 'upsert' them, which is fine.
    }
    
    // --- 3. Create Token and Save User ---
    const token = generateToken(); // Generate random token
    const hashedToken = hashToken(token); // Hash it for storage
    
    const newSubscriber: Omit<Subscriber, 'id' | 'created_at'> = {
      email,
      token: hashedToken, // The "fingerprint" we save
      verified: false,
      unsubscribed: false,
    };
    
    console.log("Plain token generated:", token);
    console.log("Hashed token stored in DB:", hashedToken);
    
    // 'upsert' means: "try to INSERT this user. If a user with this
    // email already exists, UPDATE them with this new data instead."
    // This handily overwrites their old, unverified token with a fresh one.
    const { error: insertError } = await db.from('subscribers').upsert(newSubscriber, {
      onConflict: 'email' // This tells Supabase to use 'email' to check for conflicts
    });

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      throw new Error('Database error saving user.');
    }

    // --- 4. Send Verification Email (to Mailtrap) ---
    // IMPORTANT: Pass only the TOKEN, not the full URL
    // The sendVerificationEmail function will build the URL itself
    await sendVerificationEmail(email, token);
    
    console.log("✅ Verification email sent with token:", token);
    
    // --- 5. Send Success Response ---
    // We tell the frontend form "It worked!"
    return new Response(
      JSON.stringify({ message: 'Success! Please check your email to verify.' }),
      { status: 200 } // 200 OK
    );

  } catch (e: any) {
    // This is a catch-all for any other errors (e.g., mailer fails)
    console.error(e);
    return new Response(
      JSON.stringify({ message: 'An internal server error occurred.' }),
      { status: 500 } // 500 Internal Server Error
    );
  }
};