import type { APIRoute } from 'astro';
import { db } from '../../lib/db';
import { hashToken } from '../../lib/tokens';
import { env } from '../../lib/env';

/**
 * This is the API endpoint that the user "clicks" in their verification email.
 * It's a GET endpoint, meaning it expects the data (the token) in the URL.
 */
export const GET: APIRoute = async ({ request }) => {
  // Parse the URL properly from the request
  const requestUrl = new URL(request.url);
  
  // Extract ONLY the token parameter value
  const token = requestUrl.searchParams.get('token');
  
  console.log('=== DEBUG INFO ===');
  console.log('Full request URL:', request.url);
  console.log('Token extracted:', token);
  console.log('==================');

  // We define a fallback URL in case anything goes wrong
  const errorRedirectUrl = `${env.PUBLIC_SITE_URL}/?error=verification_failed`;

  if (!token) {
    // No token was provided in the URL.
    console.warn('No token provided in URL');
    return new Response(null, {
      status: 302, // 302 Found (Redirect)
      headers: { Location: errorRedirectUrl },
    });
  }

  try {
    // 1. Hash the plain-text token from the email
    // We do this so we can find the matching "fingerprint" in our database.
    const hashedToken = hashToken(token);
    console.log('Token from URL:', token);
    console.log('Hashed token to compare:', hashedToken);

    // 2. Find the user with this token
    const { data: subscriber, error: selectError } = await db
      .from('subscribers')
      .select('*')
      .eq('token', hashedToken) // Find the user whose 'token' matches our hash
      .single(); // We only expect one

    if (selectError || !subscriber) {
      // No user was found with this token.
      // This means the token is invalid, expired, or has already been used.
      console.warn('No subscriber found with hashed token:', hashedToken);
      if (selectError) {
        console.error('Database select error:', selectError);
      }
      return new Response(null, {
        status: 302,
        headers: { Location: errorRedirectUrl },
      });
    }

    console.log('✅ Subscriber found:', subscriber.email);

    // 3. We found the user! Mark them as verified.
    const { error: updateError } = await db
      .from('subscribers')
      .update({
        verified: true,
        token: null, // CRITICAL: We set the token to 'null' so it can't be used again.
      })
      .eq('id', subscriber.id); // Update *only* this user

    if (updateError) {
      // The database failed to update for some reason.
      console.error('Supabase update error:', updateError);
      return new Response(null, {
        status: 302,
        headers: { Location: errorRedirectUrl },
      });
    }

    console.log('✅ Subscriber verified successfully:', subscriber.email);

    // 4. Success!
    // Redirect the user back to the homepage with a success flag
    const successRedirectUrl = `${env.PUBLIC_SITE_URL}/?verified=true`;

    return new Response(null, {
      status: 302,
      headers: { Location: successRedirectUrl },
    });
  } catch (e: any) {
    // This is a catch-all for any other unexpected errors
    console.error('Unexpected error during verification:', e);
    return new Response(null, {
      status: 302,
      headers: { Location: errorRedirectUrl },
    });
  }
};