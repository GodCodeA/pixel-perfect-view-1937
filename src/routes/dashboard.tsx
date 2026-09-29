import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Bell, CalendarDays, Mail, Phone, Users, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  dashboardBookingsQuery,
  departuresQuery,
  formatDate,
  spotsLeft,
  type Booking,
  type Departure,
  type Tour,
} from "@/lib/bookings";

type Row = Booking & { tours: Tour; departures: Departure };

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Owner dashboard — Ala-Too Adventures" },
      {
        name: "description",
        content:
          "Today's departures, upcoming bookings, guest counts and one-tap reminders, rescheduling and cancellations.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Owner dashboard — Ala-Too Adventures" },
      {
        property: "og:description",
        content: "Manage bookings, reminders and reschedules in one place.",
      },
    ],
  }),
  component: Dashboard,
});

const tabs = ["Today", "Upcoming", "All"] as const;

function Dashboard() {
  const queryClient = useQueryClient();
  const { data: bookings, isLoading, isError } = useQuery(dashboardBookingsQuery);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Upcoming");
  const [rescheduling, setRescheduling] = useState<Row | null>(null);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["dashboard-bookings"] });
    void queryClient.invalidateQueries({ queryKey: ["departures"] });
  };

  useEffect(() => {
    const channel = supabase
      .channel("dashboard-bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => invalidate())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remind = useMutation({
    mutationFn: async (row: Row) => {
      const { error } = await supabase
        .from("bookings")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: (_d, row) => {
      toast.success(`Reminder sent to ${row.customer_name}`);
      invalidate();
    },
    onError: () => toast.error("Couldn't send that reminder."),
  });

  const cancel = useMutation({
    mutationFn: async (row: Row) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Booking cancelled");
      invalidate();
    },
    onError: () => toast.error("Couldn't cancel that booking."),
  });

  const today = new Date().toISOString().slice(0, 10);
  const active = bookings?.filter((b) => b.status !== "cancelled") ?? [];
  const todays = active.filter((b) => b.departures.departure_date === today);
  const upcoming = active.filter((b) => b.departures.departure_date >= today);
  const guestsUpcoming = upcoming.reduce((sum, b) => sum + b.guests, 0);

  const visible =
    tab === "Today"
      ? todays
      : tab === "Upcoming"
        ? upcoming
        : (bookings ?? []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-eyebrow">Owner view · Azamat</p>
      <h1 className="mt-3 font-display text-6xl">Today at a glance</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Demo data — bookings, guests and dates here are sample records.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Departures today" value={todays.length} />
        <Stat label="Upcoming bookings" value={upcoming.length} />
        <Stat label="Guests booked ahead" value={guestsUpcoming} />
      </div>

      <div className="mt-10 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={
              t === tab
                ? "rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                : "rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
            }
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
          : null}

        {isError ? (
          <p className="text-sm text-destructive">Couldn&apos;t load bookings. Please refresh.</p>
        ) : null}

        {!isLoading && visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <p className="font-semibold">Nothing here yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {tab === "Today"
                ? "No departures today — enjoy the morning."
                : "New bookings will appear here as soon as they come in."}
            </p>
          </div>
        ) : null}

        {visible.map((row) => (
          <article key={row.id} className="surface-panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-3xl">{row.tours.name}</h2>
                  <StatusBadge status={row.status} />
                  <span className="rounded bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">
                    {row.reference}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    {formatDate(row.departures.departure_date)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary" /> {row.guests} guests
                  </span>
                  <span className="font-semibold text-foreground">${row.total_price}</span>
                </div>
              </div>
              <div className="text-sm">
                <p className="font-semibold">{row.customer_name}</p>
                <p className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {row.customer_email}
                </p>
                <p className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> {row.customer_phone}
                </p>
                {row.customer_whatsapp ? (
                  <p className="text-muted-foreground">WhatsApp: {row.customer_whatsapp}</p>
                ) : null}
              </div>
            </div>

            {row.notes ? (
              <p className="mt-3 rounded-md bg-secondary p-3 text-sm text-secondary-foreground">
                {row.notes}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <button
                type="button"
                disabled={row.status === "cancelled" || remind.isPending}
                onClick={() => remind.mutate(row)}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-40"
              >
                <Bell className="h-4 w-4" /> Send reminder
              </button>
              <button
                type="button"
                disabled={row.status === "cancelled"}
                onClick={() => setRescheduling(row)}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold disabled:opacity-40"
              >
                <RefreshCw className="h-4 w-4" /> Reschedule
              </button>
              <button
                type="button"
                disabled={row.status === "cancelled" || cancel.isPending}
                onClick={() => cancel.mutate(row)}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-destructive disabled:opacity-40"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
              {row.reminder_sent_at ? (
                <span className="text-xs text-muted-foreground">
                  Reminder sent {new Date(row.reminder_sent_at).toLocaleString("en-GB")}
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <RescheduleDialog
        row={rescheduling}
        onClose={() => setRescheduling(null)}
        onDone={invalidate}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-panel p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-6xl">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "cancelled"
      ? "bg-destructive/15 text-destructive"
      : status === "pending"
        ? "bg-warning/15 text-warning"
        : "bg-success/15 text-success";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${tone}`}>
      {status}
    </span>
  );
}

function RescheduleDialog({
  row,
  onClose,
  onDone,
}: {
  row: Row | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const { data: departures, isLoading } = useQuery(departuresQuery(row?.tour_id));
  const [saving, setSaving] = useState(false);

  async function move(target: Departure) {
    if (!row) return;
    setSaving(true);
    const { error } = await supabase
      .from("bookings")
      .update({ departure_id: target.id })
      .eq("id", row.id);
    if (error) {
      toast.error(
        error.message.includes("NOT_ENOUGH_SPOTS")
          ? "That date no longer has enough spots."
          : "Couldn't move that booking.",
      );
    } else {
      toast.success(`Moved to ${formatDate(target.departure_date)}`);
      onDone();
      onClose();
    }
    setSaving(false);
  }

  return (
    <Dialog open={Boolean(row)} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">Reschedule booking</DialogTitle>
          <DialogDescription>
            {row ? `${row.customer_name} · ${row.guests} guests · ${row.tours.name}` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {isLoading ? <Skeleton className="h-16 w-full rounded-lg" /> : null}
          {departures
            ?.filter((d) => d.id !== row?.departure_id && spotsLeft(d) >= (row?.guests ?? 1))
            .map((d) => (
              <button
                key={d.id}
                type="button"
                disabled={saving}
                onClick={() => move(d)}
                className="flex w-full items-center justify-between rounded-lg border border-border p-4 text-left hover:border-primary/60 disabled:opacity-50"
              >
                <span className="font-semibold">{formatDate(d.departure_date)}</span>
                <span className="text-xs text-muted-foreground">{spotsLeft(d)} spots left</span>
              </button>
            ))}
          {!isLoading && departures?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No other dates available for this trip.</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
