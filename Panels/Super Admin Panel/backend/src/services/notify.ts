/**
 * Delivers OTP notifications.
 * Uses console + optional SMTP-less webhook URL if configured.
 * For production, set SUPER_ADMIN_NOTIFY_EMAIL and wire a real mailer later.
 */
export async function deliverOtp(params: {
  to: string;
  subject: string;
  body: string;
  otp: string;
}): Promise<{ delivered: boolean; channel: "log" | "webhook" }> {
  const webhook = process.env.SUPER_ADMIN_OTP_WEBHOOK_URL?.trim();

  if (webhook) {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: params.to,
        subject: params.subject,
        body: params.body,
        otp: params.otp,
      }),
    });

    if (!response.ok) {
      throw new Error(`OTP webhook failed with status ${response.status}`);
    }

    return { delivered: true, channel: "webhook" };
  }

  console.info(
    `[OTP] to=${params.to} subject="${params.subject}" otp=${params.otp}`
  );
  console.info(`[OTP] ${params.body}`);
  return { delivered: false, channel: "log" };
}
