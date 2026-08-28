import "server-only";

/**
 * Transactional email.
 *
 * Deliberately thin, and deliberately honest about not being configured. A
 * "we've sent you a link" message when nothing was sent is worse than no
 * feature at all: the parent waits, the email never comes, and they conclude
 * the product is broken rather than that they should contact support.
 *
 * `emailConfigured()` is what the reset flow checks before promising anything.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export interface SendResult {
  sent: boolean;
  /** Populated in development so the link is reachable without a provider. */
  previewOnly?: boolean;
  error?: string;
}

export async function sendEmail(message: EmailMessage): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!key || !from) {
    // Without a provider the message is logged so a developer can follow the
    // link locally. It is never presented to a user as if it had been sent.
    console.warn(
      `[email] not configured; would have sent to ${message.to}: ${message.subject}\n${message.text}`,
    );
    return { sent: false, previewOnly: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
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
  } catch (err) {
    console.error("[email] send failed", err);
    return { sent: false, error: "Could not reach the email provider" };
  }
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

If this wasn't you, ignore this email — your password has not changed.

Sparkquill`;

  const html = `<!doctype html><html><body style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;line-height:1.6;color:#16211e;max-width:520px;margin:0 auto;padding:24px">
<p>${greeting}</p>
<p>Someone asked to reset the password on your Sparkquill account.</p>
<p style="margin:28px 0">
  <a href="${opts.url}" style="background:#16786a;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:700;display:inline-block">Choose a new password</a>
</p>
<p style="color:#647a72;font-size:14px">The link works once and expires in ${opts.minutes} minutes.</p>
<p style="color:#647a72;font-size:14px">If this wasn't you, ignore this email — your password has not changed.</p>
<p style="color:#647a72;font-size:13px;margin-top:32px">Sparkquill</p>
</body></html>`;

  return { subject: "Reset your Sparkquill password", text, html };
}
