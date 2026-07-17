export const prerender = false;

import type { APIRoute } from 'astro';

interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  TEAM_NOTIFY_EMAIL: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;

  if (!env?.DB || !env?.RESEND_API_KEY) {
    return json({ error: 'Server configuration error.' }, 500);
  }

  let body: { email?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email) {
    return json({ error: 'Email is required.' }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }

  let isDuplicate = false;
  try {
    await env.DB.prepare('INSERT INTO subscribers (email) VALUES (?)')
      .bind(email)
      .run();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('UNIQUE constraint')) {
      isDuplicate = true;
      try {
        await env.DB.prepare(
          "INSERT INTO engagement_log (email, event_type) VALUES (?, 'duplicate')"
        ).bind(email).run();
      } catch { /* non-fatal */ }
    } else {
      console.error('D1 insert error:', message);
      return json({ error: 'Failed to save your signup. Please try again.' }, 500);
    }
  }

  if (!isDuplicate) {
    try {
      await env.DB.prepare(
        "INSERT INTO engagement_log (email, event_type) VALUES (?, 'subscribe')"
      ).bind(email).run();
    } catch { /* non-fatal */ }
  }

  if (!isDuplicate) {
    const userHtml = `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#f2f4f7;background:#0a0d12;border-radius:10px;overflow:hidden;">
  <div style="background:#ffa23c;padding:28px 32px;">
    <h1 style="color:#14100a;font-size:20px;margin:0;font-weight:700;">You're on the list.</h1>
  </div>
  <div style="padding:28px 32px;background:#12161d;">
    <p style="margin:0 0 16px;color:#9aa5b1;line-height:1.6;">
      We'll email you when RunBeacon is ready — no newsletters, no drip sequences,
      just the one launch email.
    </p>
    <p style="margin:0 0 16px;color:#9aa5b1;line-height:1.6;">
      In the meantime, you can follow the open-source agent at
      <a href="https://github.com/synertek-cloud-services/beacon" style="color:#ffa23c;">github.com/synertek-cloud-services/beacon</a>.
    </p>
    <p style="margin:0;color:#5b6470;font-size:13px;">— Built by Synertek Cloud Services</p>
  </div>
</div>`.trim();

    const teamHtml = `
<div style="font-family:sans-serif;max-width:480px;color:#14171c;">
  <h2 style="color:#ffa23c;margin:0 0 12px;">New RunBeacon signup</h2>
  <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
</div>`.trim();

    try {
      await Promise.all([
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: env.RESEND_FROM_EMAIL,
            to: [email],
            subject: "You're on the RunBeacon waitlist",
            html: userHtml,
          }),
        }),
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: env.RESEND_FROM_EMAIL,
            to: [env.TEAM_NOTIFY_EMAIL],
            subject: `RunBeacon signup — ${email}`,
            html: teamHtml,
          }),
        }),
      ]);
    } catch {
      console.error('Resend API error for', email);
      // Email failure is non-fatal — subscriber is already saved in D1
    }
  }

  return json({ success: true }, 200);
};

function json(data: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
