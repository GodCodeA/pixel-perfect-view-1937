import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Manual "Send reminder" from the owner dashboard. Uses the same claim + send logic as the hourly job.
// Note: prototype has no owner login yet, so this is callable without auth.
export const sendReminderNow = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ bookingId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { processReminders } = await import("./reminders.server");
    const results = await processReminders(data.bookingId);
    if (results.length === 0) {
      return { status: "skipped" as const, error: "Already sent, cancelled, or no valid email." };
    }
    const r = results[0]!;
    return { status: r.status, error: r.error ?? null };
  });
