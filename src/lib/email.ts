/**
 * Email Delivery Service for The Warden
 * Integrates with Resend API with safe simulation fallback for local development.
 * Codified according to Sovereign Architectural Standards and customer-emails skill.
 */

import { db } from "@/lib/db";

export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://thewarden.online";
}

export function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL || process.env.OWNER_EMAIL || "muheebkamran53@gmail.com";
}

export function getFromEmail(): string {
  return process.env.EMAIL_FROM || "The Warden <notifications@thewarden.online>";
}

/**
 * Resilient fetch wrapper with strict timeout to prevent serverless function hangs.
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 3500): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<{ success: boolean; error?: string }> {
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
    const res = await fetchWithTimeout("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getFromEmail(),
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

/**
 * Dispatches a high-aesthetic sovereign welcome/session confirmation email to the user upon login.
 */
export async function sendLoginWelcomeEmail(
  email: string,
  name?: string | null
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const appUrl = getAppUrl();
  const displayName = name ? name.trim() : "";
  const greeting = displayName ? `Hi ${displayName},` : "Hello Operative,";
  const timestamp = new Date().toUTCString();

  if (!apiKey) {
    console.warn(
      `\n=========================================\n[CUSTOMER LOGIN WELCOME SIMULATION]\nTo: ${email}\nGreeting: ${greeting}\nDashboard: ${appUrl}/dashboard\nTime: ${timestamp}\n=========================================\n`
    );
    return true;
  }

  try {
    const res = await fetchWithTimeout("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getFromEmail(),
        to: [email],
        subject: "Welcome to The Warden // Session Authenticated",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090a0c; color: #f4f4f5; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #222227;">
            <div style="text-align: center; margin-bottom: 28px; border-bottom: 1px solid #1a1a20; padding-bottom: 24px;">
              <div style="display: inline-block; background: #141418; border: 1px solid #2e2e38; border-radius: 9999px; padding: 4px 14px; margin-bottom: 12px;">
                <span style="color: #fffc00; font-size: 11px; letter-spacing: 2px; font-weight: 700; text-transform: uppercase;">The Warden OS</span>
              </div>
              <h1 style="color: #c8a96b; font-size: 22px; letter-spacing: 2px; text-transform: uppercase; margin: 0; font-weight: 800;">Sovereign Accountability</h1>
              <p style="color: #71717a; font-size: 12px; margin-top: 6px; letter-spacing: 1px; text-transform: uppercase; font-family: monospace;">Zero Vanity &bull; Mathematical Discipline</p>
            </div>

            <div style="padding: 0 10px;">
              <p style="font-size: 16px; line-height: 1.6; color: #ffffff; margin-bottom: 14px; font-weight: 600;">${greeting}</p>
              <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-bottom: 20px;">
                You have successfully authenticated into <strong style="color: #f4f4f5;">The Warden</strong>. Your personal accountability terminal, habits matrix, and financial telemetry are active and synchronized.
              </p>

              <!-- Session Telemetry Box -->
              <div style="background-color: #121316; border: 1px solid #222227; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
                <div style="font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-family: monospace;">Session Telemetry</div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #d4d4d8; margin-bottom: 6px; font-family: monospace;">
                  <span style="color: #71717a;">Status:</span>
                  <span style="color: #00d664; font-weight: 700;">● AUTHENTICATED</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #d4d4d8; margin-bottom: 6px; font-family: monospace;">
                  <span style="color: #71717a;">Account:</span>
                  <span style="color: #ffffff;">${email}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #d4d4d8; font-family: monospace;">
                  <span style="color: #71717a;">Time (UTC):</span>
                  <span>${timestamp}</span>
                </div>
              </div>

              <!-- Core Doctrine Reminder -->
              <div style="background-color: #161512; border-left: 3px solid #fffc00; border-radius: 4px; padding: 12px 16px; margin-bottom: 28px;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #e4e4e7;">
                  <strong style="color: #fffc00;">The 70% Rule in effect:</strong> Complete at least 70% of your daily commitments today to protect your streak. One day off activates grace; two consecutive misses breaks your streak.
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/dashboard" style="background-color: #fffc00; color: #000000; padding: 14px 34px; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 8px; display: inline-block; letter-spacing: 1.5px; text-transform: uppercase; box-shadow: 0 0 20px rgba(255, 252, 0, 0.25);">
                  Open Terminal &rarr;
                </a>
              </div>

              <p style="font-size: 12px; color: #52525b; line-height: 1.5; margin-top: 25px; border-top: 1px solid #1a1a20; padding-top: 20px;">
                If you did not initiate this login session, someone may have access to your account. We strongly recommend resetting your password immediately at <a href="${appUrl}/forgot-password" style="color: #c8a96b; text-decoration: underline;">${appUrl}/forgot-password</a>.
              </p>
            </div>

            <div style="margin-top: 30px; text-align: center; border-top: 1px solid #1a1a20; padding-top: 20px;">
              <p style="font-size: 11px; color: #52525b; margin: 0; font-family: monospace; letter-spacing: 1px;">
                &copy; 2026 THE WARDEN &bull; KEEP YOUR WORD &bull; ZERO EXCUSES
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error("Resend API login welcome error:", err);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to dispatch login welcome email:", err);
    return false;
  }
}

/**
 * Backward-compatible alias for sendLoginWelcomeEmail.
 */
export async function sendWelcomeEmail(email: string, name?: string | null): Promise<boolean> {
  return sendLoginWelcomeEmail(email, name);
}

export interface AdminLoginNotificationPayload {
  userEmail: string;
  userName?: string | null;
  authMethod: "credentials" | "google" | "signup" | string;
  timestamp?: Date;
}

/**
 * Compiles the complete database roster of registered customers and emails it to the site owner
 * immediately when any customer logs in.
 */
export async function sendAdminCustomerRosterNotification(
  payload: AdminLoginNotificationPayload
): Promise<boolean> {
  const adminEmail = getAdminEmail();
  const apiKey = process.env.RESEND_API_KEY;
  const appUrl = getAppUrl();
  const timestamp = (payload.timestamp || new Date()).toUTCString();
  const userEmail = payload.userEmail.toLowerCase().trim();
  const userName = payload.userName ? payload.userName.trim() : null;

  // Retrieve recent customer roster from database with total count
  let totalUsers = 0;
  let allUsers: Array<{
    id: string;
    email: string;
    name: string | null;
    googleId: string | null;
    createdAt: Date;
  }> = [];

  try {
    const [count, users] = await Promise.all([
      db.user.count(),
      db.user.findMany({
        take: 50,
        select: {
          id: true,
          email: true,
          name: true,
          googleId: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);
    totalUsers = count;
    allUsers = users;
  } catch (dbErr) {
    console.error("Failed to query user roster for admin alert:", dbErr);
    // If DB query encounters an issue, fallback with current user entry
    allUsers = [
      {
        id: "active",
        email: userEmail,
        name: userName,
        googleId: payload.authMethod === "google" ? "google" : null,
        createdAt: new Date(),
      },
    ];
    totalUsers = 1;
  }

  if (!apiKey) {
    console.warn(
      `\n=========================================\n[ADMIN CUSTOMER ROSTER SIMULATION]\nTo: ${adminEmail}\nSubject: [The Warden Alert] Customer Login: ${userEmail} (${totalUsers} Total Customers)\nActive Operative: ${userEmail} (${userName || "No name"}) | Provider: ${payload.authMethod.toUpperCase()}\nTimestamp: ${timestamp}\n-----------------------------------------\nCustomer Roster (${totalUsers} total):\n${allUsers
        .map(
          (u, idx) =>
            `  ${idx + 1}. ${u.email} (${u.name || "No name"}) [${
              u.googleId ? "Google" : "Password"
            }] - Joined: ${u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : "N/A"}${
              u.email.toLowerCase() === userEmail ? " [ACTIVE NOW]" : ""
            }`
        )
        .join("\n")}\n=========================================\n`
    );
    return true;
  }

  // Generate HTML roster table rows
  const tableRowsHtml = allUsers
    .map((user, index) => {
      const isActiveNow = user.email.toLowerCase() === userEmail;
      const rowBg = isActiveNow
        ? "background-color: rgba(0, 214, 100, 0.08);"
        : index % 2 === 0
        ? "background-color: #121316;"
        : "background-color: #0e0f12;";
      const borderStyle = isActiveNow ? "border-left: 3px solid #00d664;" : "border-left: 3px solid transparent;";
      const provider = user.googleId ? "Google OAuth" : "Password";
      const joinedDate = user.createdAt ? new Date(user.createdAt).toISOString().slice(0, 10) : "N/A";

      return `
        <tr style="${rowBg} ${borderStyle} border-bottom: 1px solid #1f2025; font-size: 12px; font-family: monospace;">
          <td style="padding: 10px 12px; color: #71717a; text-align: center;">${index + 1}</td>
          <td style="padding: 10px 12px; color: ${isActiveNow ? "#00d664" : "#ffffff"}; font-weight: ${isActiveNow ? "700" : "500"};">
            ${user.email}
            ${isActiveNow ? `<span style="background-color: #00d664; color: #000000; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; margin-left: 8px; letter-spacing: 0.5px;">ACTIVE NOW</span>` : ""}
          </td>
          <td style="padding: 10px 12px; color: #a1a1aa;">${user.name || "—"}</td>
          <td style="padding: 10px 12px; color: #a1a1aa;">
            <span style="background-color: #1c1d22; border: 1px solid #2a2b33; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${provider}</span>
          </td>
          <td style="padding: 10px 12px; color: #71717a; white-space: nowrap;">${joinedDate}</td>
        </tr>
      `;
    })
    .join("");

  try {
    const res = await fetchWithTimeout("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getFromEmail(),
        to: [adminEmail],
        subject: `[The Warden Alert] Customer Login: ${userEmail} (${totalUsers} Total Customers)`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090a0c; color: #f4f4f5; padding: 36px 18px; max-width: 720px; margin: 0 auto; border-radius: 12px; border: 1px solid #222227;">
            
            <!-- Top Header -->
            <div style="margin-bottom: 24px; border-bottom: 1px solid #1a1a20; padding-bottom: 20px;">
              <div style="margin-bottom: 10px;">
                <span style="background-color: #fffc00; color: #000000; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">ADMIN TELEMETRY DISPATCH</span>
                <span style="color: #71717a; font-size: 11px; font-family: monospace; float: right;">${timestamp}</span>
              </div>
              <h1 style="color: #ffffff; font-size: 22px; margin: 8px 0 4px 0; font-weight: 800; letter-spacing: -0.5px;">Customer Login Detected</h1>
              <p style="color: #a1a1aa; font-size: 13px; margin: 0;">Real-time authentication telemetry &amp; live registered customer roster.</p>
            </div>

            <!-- Active User KPI Bento Card -->
            <table style="width: 100%; border-collapse: separate; border-spacing: 10px 0; margin-bottom: 24px;">
              <tr>
                <td style="width: 50%; background-color: #121316; border: 1px solid #222227; border-radius: 8px; padding: 14px 16px; vertical-align: top;">
                  <div style="font-size: 10px; color: #71717a; text-transform: uppercase; letter-spacing: 1px; font-family: monospace; margin-bottom: 6px;">Active Operative</div>
                  <div style="font-size: 14px; color: #ffffff; font-weight: 700; word-break: break-all;">${userEmail}</div>
                  <div style="font-size: 12px; color: #a1a1aa; margin-top: 4px;">${userName || "No display name"}</div>
                </td>
                <td style="width: 50%; background-color: #121316; border: 1px solid #222227; border-radius: 8px; padding: 14px 16px; vertical-align: top;">
                  <div style="font-size: 10px; color: #71717a; text-transform: uppercase; letter-spacing: 1px; font-family: monospace; margin-bottom: 6px;">Authentication Telemetry</div>
                  <div style="font-size: 14px; color: #fffc00; font-weight: 700; text-transform: uppercase;">${payload.authMethod}</div>
                  <div style="font-size: 12px; color: #00d664; margin-top: 4px; font-family: monospace;">Total Customers: <strong>${totalUsers}</strong></div>
                </td>
              </tr>
            </table>

            <!-- Full Roster Section -->
            <div style="margin-bottom: 24px;">
              <div style="margin-bottom: 12px;">
                <span style="font-size: 14px; color: #c8a96b; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">
                  Live Customer Database Roster
                </span>
                <span style="font-size: 11px; color: #71717a; font-family: monospace; float: right;">${totalUsers} registered account(s)</span>
              </div>

              <!-- Roster Table -->
              <div style="border: 1px solid #222227; border-radius: 8px; background-color: #0e0f12;">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                  <thead>
                    <tr style="background-color: #16171b; border-bottom: 1px solid #222227; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #71717a; font-family: monospace;">
                      <th style="padding: 10px 12px; text-align: center; width: 40px;">#</th>
                      <th style="padding: 10px 12px;">Customer Email</th>
                      <th style="padding: 10px 12px;">Name</th>
                      <th style="padding: 10px 12px;">Provider</th>
                      <th style="padding: 10px 12px;">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableRowsHtml}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Footer / Quick Link -->
            <div style="text-align: center; border-top: 1px solid #1a1a20; padding-top: 20px;">
              <a href="${appUrl}/dashboard" style="color: #fffc00; font-size: 12px; font-family: monospace; text-decoration: none; font-weight: 600;">
                &rarr; Open The Warden Production Dashboard (${appUrl})
              </a>
              <p style="font-size: 11px; color: #52525b; margin: 12px 0 0 0; font-family: monospace;">
                Automated Founder Telemetry &bull; Confidential &bull; The Warden
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error("Resend API admin roster alert error:", err);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to dispatch admin roster email:", err);
    return false;
  }
}
