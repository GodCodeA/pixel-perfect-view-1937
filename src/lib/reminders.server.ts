// Server-only: sends booking reminder emails through Resend.
// The database (claim_due_reminders) is the source of truth for duplicate prevention.

type SendResult = { id: string; status: "sent" | "failed"; error?: string };

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function emailHtml(b: {
  name: string; tour: string; date: string; time: string; guests: number; meeting: string; ref: string;
}) {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:6px 0;color:#6b7280;width:140px">${k}</td><td style="padding:6px 0;color:#111827;font-weight:600">${esc(v)}</td></tr>`;
  return `<!doctype html><html><body style="margin:0;background:#ffffff;font-family:Manrope,Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
<p style="letter-spacing:3px;font-size:12px;color:#0f766e;font-weight:700;margin:0">ALA-TOO ADVENTURES</p>
<h1 style="font-size:28px;margin:12px 0 8px;color:#111827">Your trip is tomorrow</h1>
<p style="color:#374151;line-height:1.6">Hi ${esc(b.name)}, just a reminder that your mountain day is almost here.</p>
<table style="width:100%;border-collapse:collapse;margin:20px 0;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb">
${row("Tour", b.tour)}${row("Date", b.date)}${row("Departure time", b.time)}${row("Guests", String(b.guests))}${row("Meeting point", b.meeting)}${row("Booking ID", b.ref)}
</table>
<p style="color:#374151;line-height:1.6">Please arrive at the meeting point <strong>15 minutes early</strong> — we leave on time to make the most of the mountain weather.</p>
<p style="color:#374151;line-height:1.6">See you tomorrow,<br/>Azamat · Ala-Too Adventures, Bishkek</p>
</div></body></html>`;
}

async function adminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Claims due bookings (or one specific booking) and emails each. Safe to call repeatedly. */
export async function processReminders(bookingId?: string): Promise<SendResult[]> {
  const db = await adminClient();
  const { data: claimed, error } = await db.rpc("claim_due_reminders", bookingId ? { _booking_id: bookingId } : {});
  if (error) throw new Error(`Claim failed: ${error.message}`);
  const ids = (claimed ?? []).map((r: { id: string }) => r.id);
  const results: SendResult[] = [];

  for (const id of ids) {
    const { data: b } = await db
      .from("bookings")
      .select("id, reference, customer_name, customer_email, guests, tours(name, meeting_point), departures(departure_date, departure_time)")
      .eq("id", id)
      .single();
    let status: "sent" | "failed" = "failed";
    let err: string | undefined;
    try {
      const apiKey = process.env["RESEND_API_KEY"];
      if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
      if (!b) throw new Error("Booking not found");
      const t = b.tours as unknown as { name: string; meeting_point: string };
      const d = b.departures as unknown as { departure_date: string; departure_time: string };
      const date = new Date(`${d.departure_date}T00:00:00Z`).toLocaleDateString("en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
      });
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `reminder-${b.id}-${d.departure_date}` },
        body: JSON.stringify({
          from: process.env["RESEND_FROM"] || "Ala-Too Adventures <onboarding@resend.dev>",
          to: [b.customer_email],
          subject: "Your Ala-Too Adventures trip is tomorrow",
          html: emailHtml({
            name: b.customer_name, tour: t.name, date, time: `${d.departure_time.slice(0, 5)} (Bishkek time)`,
            guests: b.guests, meeting: t.meeting_point, ref: b.reference,
          }),
        }),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
      status = "sent";
    } catch (e) {
      err = e instanceof Error ? e.message : String(e);
      console.error(`Reminder ${id} failed:`, err);
    }
    await db
      .from("bookings")
      .update(
        status === "sent"
          ? { reminder_status: "sent", reminder_sent_at: new Date().toISOString(), reminder_error: null }
          : { reminder_status: "failed", reminder_error: err?.slice(0, 500) ?? "Unknown error" },
      )
      .eq("id", id);
    results.push({ id, status, error: err });
  }
  return results;
}
