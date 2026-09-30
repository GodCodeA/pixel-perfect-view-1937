import { createFileRoute } from "@tanstack/react-router";

// Called hourly by the database scheduler. Only sends reminders that are actually due,
// and the database claim step guarantees no booking is emailed twice.
export const Route = createFileRoute("/api/public/hooks/send-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = request.headers.get("apikey");
        const allowed = [process.env["SUPABASE_PUBLISHABLE_KEY"], process.env["SUPABASE_ANON_KEY"]].filter(Boolean);
        if (!key || !allowed.includes(key)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
        try {
          const { processReminders } = await import("@/lib/reminders.server");
          const results = await processReminders();
          return Response.json({
            processed: results.length,
            sent: results.filter((r) => r.status === "sent").length,
            failed: results.filter((r) => r.status === "failed").length,
          });
        } catch (e) {
          console.error(e);
          return Response.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
        }
      },
    },
  },
});
