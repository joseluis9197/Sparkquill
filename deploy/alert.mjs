/**
 * Sends an operational alert by email.
 *
 * Invoked by systemd through OnFailure=, which means it runs precisely when
 * something else has already gone wrong. Two consequences shape it:
 *
 *   1. It must not depend on the application. Importing the app's mailer
 *      would mean a build that fails to compile also silences the alarm about
 *      the build failing. It talks to nodemailer directly.
 *   2. It must never throw. An alerter that crashes turns one failure into
 *      two log lines and no notification, so everything is caught and the
 *      reason is printed to the journal as a last resort.
 *
 *   node alert.mjs <unit-name> [subject-prefix]
 */
import nodemailer from "nodemailer";
import { execFileSync } from "node:child_process";

const unit = process.argv[2] ?? "unknown unit";
const prefix = process.argv[3] ?? "FAILED";

function journalTail(u) {
  try {
    return execFileSync("journalctl", ["-u", u, "-n", "25", "--no-pager", "-o", "cat"], {
      encoding: "utf8",
      timeout: 10_000,
    });
  } catch {
    return "(could not read the journal)";
  }
}

async function main() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, ALERT_TO } =
    process.env;

  const to = ALERT_TO || SMTP_USER;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !to) {
    console.error("alert: SMTP is not configured; cannot send");
    return;
  }

  const host = process.env.SPARKQUILL_HOSTNAME ?? "prosperollc-01";
  const body = [
    `${prefix}: ${unit}`,
    `Host: ${host}`,
    `Time: ${new Date().toISOString()}`,
    "",
    "Last 25 journal lines:",
    "",
    journalTail(unit),
  ].join("\n");

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT ?? 587) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: EMAIL_FROM ?? SMTP_USER,
    to,
    subject: `[Sparkquill] ${prefix}: ${unit}`,
    text: body,
  });
  console.log(`alert sent to ${to} for ${unit}`);
}

main().catch((err) => {
  // Deliberately exits 0. A failing alerter must not itself trip OnFailure=
  // and start a loop of units failing to report units failing.
  console.error("alert: could not send:", err?.message ?? err);
});
