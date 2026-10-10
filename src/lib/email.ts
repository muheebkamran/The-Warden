/**
 * Email Delivery Service for The Warden
 * Integrates with Resend API with safe simulation fallback for local development.
 */

function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<{ success: boolean; error?: string }> {
  const appUrl = getAppUrl();
  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(
      `\n=========================================\n[AUTH EMAIL SIMULATION]\nTo: ${email}\nPassword Reset URL:\n${resetUrl}\nExpires in: 1 hour\n=========================================\n`
    );
    return { success: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "The Warden <accountability@thewarden.app>",
        to: [email],
        subject: "Reset your password for The Warden",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c0e; color: #f2f0ea; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 8px; border: 1px solid #3a3244;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #c8a96b; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; margin: 0;">The Warden</h1>
              <p style="color: #9a9a96; font-size: 12px; margin-top: 5px;">PERSONAL ACCOUNTABILITY OS</p>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #f2f0ea;">Hello,</p>
            <p style="font-size: 15px; line-height: 1.6; color: #9a9a96;">We received a request to reset your password. Click the button below to choose a new password. This link will expire in <strong>1 hour</strong>.</p>
            <div style="text-align: center; margin: 35px 0;">
              <a href="${resetUrl}" style="background-color: #c8a96b; color: #0b0c0e; padding: 12px 28px; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 4px; display: inline-block; letter-spacing: 1px; text-transform: uppercase;">Reset Password</a>
            </div>
            <p style="font-size: 12px; color: #62646a; line-height: 1.5;">If you did not request this password reset, you can safely ignore this email. Your account remains protected.</p>
            <hr style="border: none; border-top: 1px solid #292c32; margin: 30px 0;" />
            <p style="font-size: 11px; color: #62646a; text-align: center;">© 2026 The Warden. Keep your word.</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("Resend API error:", errData);
      return { success: false, error: "Failed to send reset email" };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to send reset email:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to send reset email" };
  }
}

export async function sendWelcomeEmail(email: string, name?: string | null): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return true;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "The Warden <accountability@thewarden.app>",
        to: [email],
        subject: "Welcome to The Warden",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0c0e; color: #f2f0ea; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 8px; border: 1px solid #3a3244;">
            <h1 style="color: #c8a96b; font-size: 24px; text-transform: uppercase;">Welcome to The Warden</h1>
            <p style="color: #9a9a96; font-size: 15px; line-height: 1.6;">${name ? `Hi ${name},` : "Hello,"}</p>
            <p style="color: #9a9a96; font-size: 15px; line-height: 1.6;">Your accountability system is ready. Set your daily habits, follow the 70% rule, and keep your streak alive.</p>
          </div>
        `,
      }),
    });
    return true;
  } catch {
    return false;
  }
}
