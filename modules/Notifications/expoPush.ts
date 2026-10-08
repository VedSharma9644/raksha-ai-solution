type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: "default" | null;
  channelId?: string;
  priority?: "default" | "normal" | "high";
};

type ExpoTicket = {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
};

/**
 * Send via Expo Push API (works with Expo Go on iOS + EAS builds on Android/iOS).
 */
export async function sendExpoPushMessages(
  messages: ExpoPushMessage[]
): Promise<{ tickets: ExpoTicket[]; invalidTokens: string[] }> {
  if (messages.length === 0) {
    return { tickets: [], invalidTokens: [] };
  }

  const invalidTokens: string[] = [];
  const tickets: ExpoTicket[] = [];

  // Expo accepts batches of up to 100
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chunk),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        data?: ExpoTicket[];
        errors?: unknown;
      };

      const chunkTickets = Array.isArray(payload.data) ? payload.data : [];
      tickets.push(...chunkTickets);

      chunkTickets.forEach((ticket, index) => {
        if (ticket.status !== "error") {
          return;
        }
        const errorCode = ticket.details?.error;
        if (
          errorCode === "DeviceNotRegistered" ||
          errorCode === "InvalidCredentials"
        ) {
          const token = chunk[index]?.to;
          if (token) {
            invalidTokens.push(token);
          }
        }
      });
    } catch {
      // Network failures should not break leave approve flows
    }
  }

  return { tickets, invalidTokens };
}
