import "server-only";
import nodemailer from "nodemailer";

/**
 * Transactional email.
 *
 * Two transports, because the server already has a working Gmail SMTP account
 * in use by another product on the same box: SMTP if it is configured, Resend
 * if an API key is present, and neither otherwise.
 *
 * Deliberately honest about not being configured. A "we've sent you a link"
 * message when nothing was sent is worse than no feature at all — the parent
 * waits, the email never comes, and they conclude the product is broken
 * rather than that they should contact support.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

type Transport = "smtp" | "resend" | "none";

function transport(): Transport {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return "smtp";
  }
  if (process.env.RESEND_API_KEY) return "resend";
  return "none";
}

export function emailConfigured(): boolean {
  return transport() !== "none" && Boolean(process.env.EMAIL_FROM);
}

export interface SendResult {
  sent: boolean;
  /** Set when nothing was sent because no transport is configured. */
  previewOnly?: boolean;
  error?: string;
}

export async function sendEmail(message: EmailMessage): Promise<SendResult> {
  const from = process.env.EMAIL_FROM;
  const how = transport();

  if (how === "none" || !from) {
    // Logged so a developer can follow the link locally. Never presented to a
    // user as though it had been sent.
    console.warn(
      `[email] no transport configured; would have sent to ${message.to}: ${message.subject}\n${message.text}`,
    );
    return { sent: false, previewOnly: true };
  }

  try {
    if (how === "smtp") return await sendViaSmtp(message, from);
    return await sendViaResend(message, from);
  } catch (err) {
    console.error("[email] send failed", err);
    return { sent: false, error: "Could not reach the email service" };
  }
}

async function sendViaSmtp(
  message: EmailMessage,
  from: string,
): Promise<SendResult> {
  const port = Number(process.env.SMTP_PORT ?? 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 is implicit TLS; 587 upgrades with STARTTLS.
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
  return { sent: true };
}

async function sendViaResend(
  message: EmailMessage,
  from: string,
): Promise<SendResult> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [message.to],
      subject: message.subject,
      text: message.text,
      html: message.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[email] provider rejected the message: ${res.status} ${body}`);
    return { sent: false, error: `Provider returned ${res.status}` };
  }
  return { sent: true };
}

/** Plain, short, and free of anything that looks like marketing. */
export function passwordResetEmail(opts: {
  name: string | null;
  url: string;
  minutes: number;
}): Pick<EmailMessage, "subject" | "text" | "html"> {
  const greeting = opts.name ? `Hello ${opts.name},` : "Hello,";
  const text = `${greeting}

Someone asked to reset the password on your Sparkquill account. Open this link to choose a new one:

${opts.url}

The link works once and expires in ${opts.minutes} minutes.

If this wasn't you, ignore this email - your password has not changed.

Sparkquill`;

  const html = `<!doctype html><html><body style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;line-height:1.6;color:#16211e;max-width:520px;margin:0 auto;padding:24px">
<p>${greeting}</p>
<p>Someone asked to reset the password on your Sparkquill account.</p>
<p style="margin:28px 0">
  <a href="${opts.url}" style="background:#16786a;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:700;display:inline-block">Choose a new password</a>
</p>
<p style="color:#647a72;font-size:14px">The link works once and expires in ${opts.minutes} minutes.</p>
<p style="color:#647a72;font-size:14px">If this wasn't you, ignore this email &mdash; your password has not changed.</p>
<p style="color:#647a72;font-size:13px;margin-top:32px">Sparkquill</p>
</body></html>`;

  return { subject: "Reset your Sparkquill password", text, html };
}

/** Which transport is in use, for the admin/diagnostics view. */
export function emailTransport(): Transport {
  return transport();
}

/**
 * The email that confirms an address belongs to the person who typed it.
 *
 * Deliberately says what happens if it is ignored, because something does:
 * the account keeps working. A verification email that implies the account is
 * suspended until you click is a lie, and one that says nothing leaves the
 * parent unsure whether they have to act now or can finish their coffee.
 */
export function verifyEmailMessage(opts: {
  name: string | null;
  url: string;
  hours: number;
}): Pick<EmailMessage, "subject" | "text" | "html"> {
  const greeting = opts.name ? `Hello ${opts.name},` : "Hello,";
  const text = `${greeting}

Please confirm this is your email address:

${opts.url}

The link expires in ${opts.hours} hours.

This matters for one practical reason: if the address on the account is wrong, the "forgot password" link goes somewhere you cannot read, and there is no way back into your account.

Your account works either way in the meantime.

If you did not sign up for Sparkquill, ignore this email - no account can be used at this address without this link.

Sparkquill`;

  const html = `<!doctype html><html><body style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;line-height:1.6;color:#16211e;max-width:520px;margin:0 auto;padding:24px">
<p>${greeting}</p>
<p>Please confirm this is your email address.</p>
<p style="margin:28px 0">
  <a href="${opts.url}" style="background:#16786a;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:700;display:inline-block">Confirm my email</a>
</p>
<p style="color:#647a72;font-size:14px">The link expires in ${opts.hours} hours. Your account works either way in the meantime.</p>
<p style="color:#647a72;font-size:14px">This matters for one practical reason: if the address on the account is wrong, the &ldquo;forgot password&rdquo; link goes somewhere you cannot read, and there is no way back in.</p>
<p style="color:#647a72;font-size:14px">If you did not sign up for Sparkquill, ignore this email.</p>
<p style="color:#647a72;font-size:13px;margin-top:32px">Sparkquill</p>
</body></html>`;

  return { subject: "Confirm your email for Sparkquill", text, html };
}
