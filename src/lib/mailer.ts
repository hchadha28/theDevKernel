// mail generator code template
import nodemailer from 'nodemailer';
import { env } from './env'; // Our validated environment variables

/**
 * This is our "Mailman" for testing.
 * It creates a "transporter" that knows how to connect to Mailtrap's
 * "flight simulator" inbox.
 */

const transporter = nodemailer.createTransport({
  host: env.MAILTRAP_HOST,
  port: Number(env.MAILTRAP_PORT), // Make sure to convert port to a number
  auth: {
    user: env.MAILTRAP_USER,
    pass: env.MAILTRAP_PASS,
  },
});

/**
 * This is the function our API will call.
 * It's the "worker" that builds and sends the verification email.
 *
[Immersive content redacted for brevity.]
 */
export async function sendVerificationEmail(email: string, token: string) {
  // We use our public site URL from env to build the verification link
  const verificationLink = `${env.PUBLIC_SITE_URL}/api/verify?token=${token}`;

  // Send the email using our Mailtrap transporter
  const info = await transporter.sendMail({
    from: `The Dev Kernel <${env.PUBLIC_MAIL_FROM}>`, // e.g., "Blog <test@my-blog.com>"
    to: email, // The user who just subscribed
    subject: 'Please verify your email to subscribe',
    // The email content, with the magic link
    html: `
      <h1>Welcome!</h1>
      <p>Thank you for subscribing. Please click the link below to verify your email address.</p>
      <a href="${verificationLink}">Verify My Email</a>
      <br>
      <p>If you did not sign up for this, please ignore this email.</p>
    `,
    // A plain-text version for email clients that don't support HTML
    text: `
      Welcome!
      Thank you for subscribing. Please copy and paste this link to verify your email:
      ${verificationLink}
    `,
  });

  console.log('✅ Email sent to Mailtrap! Message ID:', info.messageId);

  // In Mailtrap, you can now see this email and click the link!
  return info;
}

