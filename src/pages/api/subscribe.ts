export const prerender = false;

import type { APIRoute } from 'astro';
import { AwsClient } from 'aws4fetch';

interface Env {
  DB: D1Database;
  FROM_EMAIL: string;
  TEAM_NOTIFY_EMAIL: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;

  if (!env?.DB) {
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

  if (!isDuplicate && env.AWS_ACCESS_KEY_ID) {
    const userHtml = `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#faf9f6;border-radius:10px;overflow:hidden;border:1px solid #e4e2dc;">
  <div style="background:#d97a1f;padding:28px 32px;">
    <h1 style="color:#ffffff;font-size:20px;margin:0;font-weight:700;">You're on the list.</h1>
  </div>
  <div style="padding:28px 32px;background:#ffffff;">
    <p style="margin:0 0 16px;color:#5b6470;line-height:1.6;">
      We'll email you when Beacon is ready — no newsletters, no drip sequences,
      just the one launch email.
    </p>
    <p style="margin:0 0 16px;color:#5b6470;line-height:1.6;">
      In the meantime, you can follow the open-source agent at
      <a href="https://github.com/synertek-cloud-services/beacon" style="color:#d97a1f;">github.com/synertek-cloud-services/beacon</a>.
    </p>
    <p style="margin:0;color:#8b93a0;font-size:13px;">— Built by Synertek Cloud Services</p>
  </div>
</div>`.trim();

    const teamHtml = `
<div style="font-family:sans-serif;max-width:480px;color:#14171c;">
  <h2 style="color:#d97a1f;margin:0 0 12px;">New Beacon signup</h2>
  <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
</div>`.trim();

    try {
      const aws = new AwsClient({
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        service: 'ses',
        region: env.AWS_REGION,
      });
      const endpoint = `https://email.${env.AWS_REGION}.amazonaws.com/v2/email/outbound-emails`;

      await Promise.all([
        sesEmail(aws, endpoint, env.FROM_EMAIL, email, "You're on the Beacon waitlist", userHtml),
        sesEmail(aws, endpoint, env.FROM_EMAIL, env.TEAM_NOTIFY_EMAIL, `Beacon signup — ${email}`, teamHtml),
      ]);
    } catch {
      console.error('SES send error for', email);
      // Email failure is non-fatal — subscriber is already saved in D1
    }
  }

  return json({ success: true }, 200);
};

async function sesEmail(
  aws: AwsClient,
  endpoint: string,
  from: string,
  to: string,
  subject: string,
  html: string
) {
  const res = await aws.fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      FromEmailAddress: from,
      Destination: { ToAddresses: [to] },
      Content: {
        Simple: {
          Subject: { Data: subject },
          Body: { Html: { Data: html } },
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`SES error ${res.status}: ${await res.text()}`);
}

function json(data: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
