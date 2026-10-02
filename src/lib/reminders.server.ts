// Server-only: booking reminder processing.
// Email sending is not configured in this project — reminders are tracked in the
// database (pending/sent/failed) but no email provider is connected, so every
// attempt is recorded as failed with a clear reason. No fake "sent" status.
// The database (claim_due_reminders) remains the source of truth for duplicate prevention.

type SendResult = { id: string; status: "sent" | "failed"; error?: string | undefined };

const NOT_CONFIGURED = "Email reminders are not configured";

async function adminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Claims due bookings (or one specific booking) and marks each. Safe to call repeatedly. */
export async function processReminders(bookingId?: string): Promise<SendResult[]> {
  const db = await adminClient();
  const { data: claimed, error } = await db.rpc("claim_due_reminders", bookingId ? { _booking_id: bookingId } : {});
  if (error) throw new Error(`Claim failed: ${error.message}`);
  const ids = (claimed ?? []).map((r: { id: string }) => r.id);
  const results: SendResult[] = [];

  for (const id of ids) {
    await db
      .from("bookings")
      .update({ reminder_status: "failed", reminder_error: NOT_CONFIGURED })
      .eq("id", id);
    results.push({ id, status: "failed", error: NOT_CONFIGURED });
  }
  return results;
}
