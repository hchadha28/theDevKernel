import type { APIRoute } from "astro";
import { db } from "../../lib/db";
import { hashToken } from "../../lib/tokens";
import { env } from "../../lib/env";

/**
 * This is the API endpoint that the user "clicks" in their verification email.
 * It's a GET endpoint, meaning it expects the data (the token) in the URL.
 */
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token"); // Get the token from "?token=..."

  // We define a fallback URL in case anything goes wrong
  const errorRedirectUrl = `${env.PUBLIC_SITE_URL}/?error=verification_failed`;

  if (!token) {
    // No token was provided in the URL.
    // This is suspicious, so we redirect to the homepage with an error.
    return new Response(null, {
      status: 302, // 302 Found (Redirect)
      headers: { Location: errorRedirectUrl },
    });
  }

  try {
    // 1. Hash the plain-text token from the email
    // We do this so we can find the matching "fingerprint" in our database.
    const hashedToken = hashToken(token);

    // 2. Find the user with this token
    const { data: subscriber, error: selectError } = await db
      .from("subscribers")
      .select("*")
      .eq("token", hashedToken) // Find the user whose 'token' matches our hash
      .single(); // We only expect one

    if (selectError || !subscriber) {
      // No user was found with this token.
      // This means the token is invalid, expired, or has already been used.
      console.warn("Invalid or expired token used:", token);
      return new Response(null, {
        status: 302,
        headers: { Location: errorRedirectUrl },
      });
    }

    // 3. We found the user! Mark them as verified.
    const { error: updateError } = await db
      .from("subscribers")
      .update({
        verified: true,
        token: null, // CRITICAL: We set the token to 'null' so it can't be used again.
      })
      .eq("id", subscriber.id); // Update *only* this user

    if (updateError) {
      // The database failed to update for some reason.
      console.error("Supabase update error:", updateError);
      return new Response(null, {
        status: 302,
        headers: { Location: errorRedirectUrl },
      });
    }

    // 4. Success!
    // This is the key to our SPA plan. We redirect the user
    // back to the homepage, but with a "flag" in the URL.
    const successRedirectUrl = `${env.PUBLIC_SITE_URL}/?verified=true`;

    return new Response(null, {
      status: 302,
      headers: { Location: successRedirectUrl },
    });
  } catch (e: any) {
    // This is a catch-all for any other unexpected errors
    console.error(e);
    return new Response(null, {
      status: 302,
      headers: { Location: errorRedirectUrl },
    });
  }
};
