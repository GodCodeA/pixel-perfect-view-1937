import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Backpack,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Mountain,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CANCELLATION_POLICY, tourExtras } from "@/lib/tour-content";
import { faqs } from "@/lib/site-content";

import { Skeleton } from "@/components/ui/skeleton";
import {
  availabilityLabel,
  availabilityOf,
  departuresQuery,
  formatDate,
  formatTime,
  tourQuery,
  type AvailabilityState,
} from "@/lib/bookings";
import { tourGallery } from "@/lib/tour-images";

export const Route = createFileRoute("/tours/$slug")({
  head: ({ params }) => {
    const name = params.slug
      .split("-")
      .map((w) => w[0]!.toUpperCase() + w.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `${name} — Ala-Too Adventures` },
        {
          name: "description",
          content: `Dates, price, inclusions and availability for the ${name} trip with Ala-Too Adventures in Kyrgyzstan.`,
        },
        { property: "og:title", content: `${name} — Ala-Too Adventures` },
        {
          property: "og:description",
          content: `Check open departure dates and book the ${name} trip online.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: TourDetail,
});

function TourDetail() {
  const { slug } = Route.useParams();
  const { data: tour, isLoading, isError } = useQuery(tourQuery(slug));
  const { data: departures, isLoading: loadingDates } = useQuery(departuresQuery(tour?.id));

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-12 sm:px-6">
        <Skeleton className="h-[320px] w-full rounded-xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !tour) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-5xl">Trip not found</h1>
        <p className="mt-3 text-muted-foreground">
          That tour doesn&apos;t exist or is no longer offered.
        </p>
        <Link
          to="/tours"
          className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          See all tours
        </Link>
      </div>
    );
  }

  return <TourBody tour={tour} departures={departures} loadingDates={loadingDates} />;
}

const SECTIONS = [
  ["overview", "Overview"],
  ["itinerary", "Itinerary"],
  ["included", "Included"],
  ["bring", "What to bring"],
  ["meeting", "Meeting point"],
  ["availability", "Dates"],
  ["faq", "FAQ"],
] as const;

const stateStyles: Record<AvailabilityState, string> = {
  available: "bg-success/15 text-success",
  few: "bg-accent/15 text-accent",
  full: "bg-muted text-muted-foreground",
};

function TourBody({
  tour,
  departures,
  loadingDates,
}: {
  tour: NonNullable<Awaited<ReturnType<ReturnType<typeof tourQuery>["queryFn"]>>>;
  departures: Awaited<ReturnType<ReturnType<typeof departuresQuery>["queryFn"]>> | undefined;
  loadingDates: boolean;
}) {
  const extras = tourExtras(tour.slug);
  const photos = tourGallery(tour.image_key);
  const [active, setActive] = useState(0);
  const list = departures ?? [];
  const openCount = list.filter((d) => availabilityOf(d) !== "full").length;
  const next = list.find((d) => availabilityOf(d) !== "full");

  const facts: [React.ReactNode, string, string][] = [
    [<Clock key="c" className="h-4 w-4 text-primary" />, "Duration", `${tour.duration_days} ${tour.duration_days === 1 ? "day" : "days"}`],
    [<Mountain key="m" className="h-4 w-4 text-primary" />, "Difficulty", tour.difficulty],
    [<Users key="u" className="h-4 w-4 text-primary" />, "Group size", `Max ${tour.max_group_size}`],
    [<MapPin key="p" className="h-4 w-4 text-primary" />, "Meeting point", tour.meeting_point],
    [
      <CalendarDays key="d" className="h-4 w-4 text-primary" />,
      "Next date",
      loadingDates ? "Loading…" : next ? `${formatDate(next.departure_date)}, ${formatTime(next.departure_time)}` : "No open dates",
    ],
  ];

  return (
    <div>
      {/* Hero */}
      <div className="relative isolate min-h-[60vh]">
        <img
          src={photos[0]}
          alt={tour.name}
          width={1280}
          height={864}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 image-veil" />
        <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-end px-4 pb-12 pt-24 sm:px-6 sm:pb-16">
          <p className="text-eyebrow">
            {tour.region} · {tour.difficulty}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-6xl sm:text-8xl">{tour.name}</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">{tour.summary}</p>
          <p className="mt-5 text-sm">
            From <span className="font-display text-3xl">${tour.price_per_person}</span>{" "}
            <span className="text-muted-foreground">per person</span>
          </p>
        </div>
      </div>

      {/* Section nav */}
      <nav className="sticky top-16 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-4 py-3 text-sm font-semibold sm:px-6">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="whitespace-nowrap text-muted-foreground hover:text-foreground">
              {label}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-12">
          {/* Quick facts */}
          <dl className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-3">
            {facts.map(([icon, label, value]) => (
              <div key={label}>
                <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                  {icon} {label}
                </dt>
                <dd className="mt-1 text-sm font-semibold">{value}</dd>
              </div>
            ))}
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Price</dt>
              <dd className="mt-1 text-sm font-semibold">${tour.price_per_person} / person</dd>
            </div>
          </dl>

          {/* Gallery */}
          <section aria-label="Photo gallery">
            <div className="overflow-hidden rounded-xl">
              <img
                src={photos[active]}
                alt={`${tour.name} — photo ${active + 1}`}
                loading="lazy"
                width={1280}
                height={864}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {photos.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show photo ${i + 1}`}
                  className={
                    i === active
                      ? "overflow-hidden rounded-lg ring-2 ring-primary"
                      : "overflow-hidden rounded-lg opacity-70 transition-opacity hover:opacity-100"
                  }
                >
                  <img src={src} alt="" loading="lazy" width={1280} height={864} className="aspect-[4/3] w-full object-cover" />
                </button>
              ))}
            </div>
          </section>

          <section id="overview" className="scroll-mt-32">
            <h2 className="font-display text-4xl">Overview</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{tour.description}</p>
            <h3 className="mt-8 font-display text-3xl">Highlights</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {tour.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {h}
                </li>
              ))}
            </ul>
          </section>

          {extras.itinerary.length > 0 ? (
            <section id="itinerary" className="scroll-mt-32">
              <h2 className="font-display text-4xl">Itinerary</h2>
              <ol className="mt-4 space-y-4 border-l border-border pl-5">
                {extras.itinerary.map((step) => (
                  <li key={step.time + step.title}>
                    <p className="text-eyebrow">{step.time}</p>
                    <p className="font-semibold">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.body}</p>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <section id="included" className="grid scroll-mt-32 gap-8 sm:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl">Included</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {tour.included.map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-3xl">Not included</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {tour.not_included.map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="bring" className="scroll-mt-32">
            <h2 className="font-display text-3xl">What to bring</h2>
            <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {extras.whatToBring.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <Backpack className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {i}
                </li>
              ))}
            </ul>
          </section>

          <section id="meeting" className="grid scroll-mt-32 gap-8 sm:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl">Meeting point</h2>
              <p className="mt-3 flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {tour.meeting_point}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Please arrive 15 minutes before the start time shown on your date.
              </p>
            </div>
            <div>
              <h2 className="font-display text-3xl">Cancellation policy</h2>
              <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {CANCELLATION_POLICY}
              </p>
            </div>
          </section>

          <section id="availability" className="scroll-mt-32">
            <h2 className="font-display text-4xl">Availability</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Demo availability — dates are sample data. Start times are Bishkek time.
            </p>
            <div className="mt-4 space-y-2">
              {loadingDates
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
                : null}
              {!loadingDates && openCount === 0 ? (
                <p className="rounded-lg border border-border p-5 text-sm text-muted-foreground">
                  No open dates right now. Message Azamat on WhatsApp and he&apos;ll add one.
                </p>
              ) : null}
              {list.map((d) => {
                const state = availabilityOf(d);
                return (
                  <div
                    key={d.id}
                    className={
                      state === "full"
                        ? "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4 opacity-60"
                        : "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"
                    }
                  >
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">{formatDate(d.departure_date)}</p>
                        <p className="text-xs text-muted-foreground">Starts {formatTime(d.departure_time)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${stateStyles[state]}`}>
                        {availabilityLabel(d)}
                      </span>
                      {state === "full" ? (
                        <span className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground">
                          Unavailable
                        </span>
                      ) : (
                        <Link
                          to="/book/$slug"
                          params={{ slug: tour.slug }}
                          search={{ departure: d.id }}
                          className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                        >
                          Select date
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="faq" className="scroll-mt-32">
            <h2 className="font-display text-4xl">FAQ</h2>
            <Accordion type="single" collapsible className="mt-4">
              {faqs.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>

        <aside className="h-fit lg:sticky lg:top-32">
          <div className="surface-panel p-6">
            <p className="text-sm text-muted-foreground">From</p>
            <p className="font-display text-6xl">${tour.price_per_person}</p>
            <p className="text-sm text-muted-foreground">per person</p>
            <p className="mt-4 text-sm">
              {loadingDates
                ? "Checking dates…"
                : openCount > 0
                  ? `${openCount} open ${openCount === 1 ? "date" : "dates"}${next ? ` · next ${formatDate(next.departure_date)}` : ""}`
                  : "No open dates right now"}
            </p>
            <Link
              to="/book/$slug"
              params={{ slug: tour.slug }}
              search={{}}
              className="mt-5 block rounded-md bg-primary px-5 py-3 text-center text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)]"
            >
              Check availability &amp; book
            </Link>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              No payment taken — you pay on the day.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
