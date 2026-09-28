import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarDays, Check, ChevronLeft, Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createBooking,
  departuresQuery,
  formatDate,
  spotsLeft,
  tourQuery,
  type Departure,
} from "@/lib/bookings";
import { tourImage } from "@/lib/tour-images";

type Search = { departure?: string };

export const Route = createFileRoute("/book/$slug")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    departure: typeof search["departure"] === "string" ? search["departure"] : undefined,
  }),
  head: ({ params }) => {
    const name = params.slug
      .split("-")
      .map((w) => w[0]!.toUpperCase() + w.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `Book ${name} — Ala-Too Adventures` },
        {
          name: "description",
          content: `Pick a date, choose your group size and confirm your place on the ${name} trip.`,
        },
        { property: "og:title", content: `Book ${name} — Ala-Too Adventures` },
        {
          property: "og:description",
          content: `Reserve your spot on the ${name} trip in a couple of minutes.`,
        },
      ],
    };
  },
  component: BookingFlow,
});

const stepLabels = ["Date", "Guests", "Details", "Review"];

function BookingFlow() {
  const { slug } = Route.useParams();
  const { departure: presetDeparture } = Route.useSearch();
  const navigate = useNavigate();

  const { data: tour, isLoading } = useQuery(tourQuery(slug));
  const { data: departures, isLoading: loadingDates } = useQuery(departuresQuery(tour?.id));

  const [step, setStep] = useState(presetDeparture ? 1 : 0);
  const [departureId, setDepartureId] = useState<string | undefined>(presetDeparture);
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const open = departures?.filter((d) => spotsLeft(d) > 0) ?? [];
  const departure: Departure | undefined = open.find((d) => d.id === departureId);
  const maxGuests = departure ? spotsLeft(departure) : 1;
  const total = tour ? guests * tour.price_per_person : 0;

  const contactValid = name.trim().length > 1 && /\S+@\S+\.\S+/.test(email) && phone.trim().length > 5;

  if (isLoading || !tour) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-16 sm:px-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  async function confirm() {
    if (!tour || !departure) return;
    setSubmitting(true);
    try {
      const reference = await createBooking({
        tour,
        departure,
        name,
        email,
        phone,
        guests,
        notes,
      });
      navigate({ to: "/booking/$reference", params: { reference } });
    } catch {
      toast.error("We couldn't save that booking. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        to="/tours/$slug"
        params={{ slug }}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back to {tour.name}
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <img
          src={tourImage(tour.image_key)}
          alt={tour.name}
          loading="lazy"
          width={1280}
          height={864}
          className="h-16 w-16 rounded-lg object-cover"
        />
        <div>
          <p className="text-eyebrow">Booking</p>
          <h1 className="font-display text-4xl">{tour.name}</h1>
        </div>
      </div>

      <ol className="mt-8 flex gap-2">
        {stepLabels.map((label, i) => (
          <li key={label} className="flex-1">
            <div
              className={
                i <= step ? "h-1 rounded-full bg-primary" : "h-1 rounded-full bg-secondary"
              }
            />
            <p
              className={
                i <= step
                  ? "mt-2 text-xs font-bold"
                  : "mt-2 text-xs font-semibold text-muted-foreground"
              }
            >
              {label}
            </p>
          </li>
        ))}
      </ol>

      <div className="surface-panel mt-6 p-6">
        {step === 0 ? (
          <div>
            <h2 className="font-display text-3xl">Pick a date</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Demo availability for the next few weeks.
            </p>
            <div className="mt-4 space-y-2">
              {loadingDates
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))
                : null}
              {!loadingDates && open.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No open dates for this trip at the moment.
                </p>
              ) : null}
              {open.map((d) => {
                const selected = d.id === departureId;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setDepartureId(d.id);
                      setGuests(Math.min(2, spotsLeft(d)));
                    }}
                    className={
                      selected
                        ? "flex w-full items-center justify-between rounded-lg border border-primary bg-primary/10 p-4 text-left"
                        : "flex w-full items-center justify-between rounded-lg border border-border p-4 text-left transition-colors hover:border-primary/50"
                    }
                  >
                    <span className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      <span>
                        <span className="block font-semibold">{formatDate(d.departure_date)}</span>
                        <span className="block text-xs text-muted-foreground">
                          {spotsLeft(d)} spots left
                        </span>
                      </span>
                    </span>
                    {selected ? <Check className="h-5 w-5 text-primary" /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 1 && departure ? (
          <div>
            <h2 className="font-display text-3xl">How many guests?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDate(departure.departure_date)} · {spotsLeft(departure)} spots available
            </p>
            <div className="mt-6 flex items-center gap-6">
              <button
                type="button"
                aria-label="Fewer guests"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="font-display text-6xl">{guests}</span>
              <button
                type="button"
                aria-label="More guests"
                onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              {guests} × ${tour.price_per_person} ={" "}
              <span className="font-bold text-foreground">${total}</span> total
            </p>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <h2 className="font-display text-3xl">Your details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Marta Kowalski"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone / WhatsApp</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+996 555 000 000"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="notes">Anything we should know? (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Dietary needs, pickup address, experience level…"
                className="mt-1.5"
              />
            </div>
            {!contactValid ? (
              <p className="text-xs text-muted-foreground">
                Name, a valid email and a phone number are needed to continue.
              </p>
            ) : null}
          </div>
        ) : null}

        {step === 3 && departure ? (
          <div>
            <h2 className="font-display text-3xl">Review your booking</h2>
            <dl className="mt-5 divide-y divide-border text-sm">
              {[
                ["Tour", tour.name],
                ["Date", formatDate(departure.departure_date)],
                ["Guests", String(guests)],
                ["Meeting point", tour.meeting_point],
                ["Name", name],
                ["Email", email],
                ["Phone", phone],
                ...(notes ? ([["Notes", notes]] as [string, string][]) : []),
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-6 py-3">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
              <div className="flex justify-between py-4">
                <dt className="font-bold">Total</dt>
                <dd className="font-display text-3xl">${total}</dd>
              </div>
            </dl>
            <p className="text-xs text-muted-foreground">
              No payment is taken here. Azamat confirms and you settle on the day.
            </p>
          </div>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
          >
            Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={(step === 0 && !departure) || (step === 2 && !contactValid)}
              className="rounded-md bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={confirm}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
