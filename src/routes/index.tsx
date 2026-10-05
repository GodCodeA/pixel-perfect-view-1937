import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Compass, Map, Mountain, MousePointerClick, Users } from "lucide-react";

import heroImage from "@/assets/hero-mountains.jpg";
import { TourCard } from "@/components/tour-card";
import { Skeleton } from "@/components/ui/skeleton";
import { toursQuery, type Tour } from "@/lib/bookings";
import { faqs, guides, reviews } from "@/lib/site-content";
import { tourImage } from "@/lib/tour-images";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ala-Too Adventures — Mountain tours from Bishkek" },
      {
        name: "description",
        content:
          "Book small-group hikes, yurt stays and multi-day treks in the Kyrgyz mountains. Check real dates, pick your group size and get confirmed in minutes.",
      },
      { property: "og:title", content: "Ala-Too Adventures — Mountain tours from Bishkek" },
      {
        property: "og:description",
        content:
          "Check dates and book Kyrgyz mountain trips in minutes, without the back-and-forth.",
      },
    ],
  }),
  component: Home,
});

const benefits = [
  {
    icon: Users,
    title: "Small groups",
    body: "A handful of guests per trip, so the pace suits the group and everyone gets time with the guide.",
  },
  {
    icon: Map,
    title: "Clear itineraries",
    body: "Every tour lists the route, timings, what's included and what to bring before you book.",
  },
  {
    icon: CalendarCheck,
    title: "Real availability online",
    body: "See the open dates and exactly how many spots are left — no waiting for a reply.",
  },
  {
    icon: MousePointerClick,
    title: "Easy booking",
    body: "Book in a couple of minutes and pay on the day. No deposit, no card details.",
  },
  {
    icon: Compass,
    title: "Local mountain knowledge",
    body: "Routes planned from Bishkek by people who know these valleys, seasons and families.",
  },
];

const howItWorks = [
  { n: "01", title: "Choose a tour", body: "Compare difficulty, duration and price." },
  { n: "02", title: "Pick a date and guests", body: "Only dates with open spots can be selected." },
  {
    n: "03",
    title: "Confirm your booking",
    body: "Add your contact details and get your reference instantly.",
  },
];

function pickRecommended(tours: Tour[]) {
  const byDuration = [...tours].sort((a, b) => a.duration_days - b.duration_days);
  const picks: { label: string; tour: Tour | undefined }[] = [
    { label: "Short on time", tour: byDuration[0] },
    {
      label: "A weekend away",
      tour: byDuration.find((t) => t.duration_days >= 2 && t.duration_days <= 3),
    },
    { label: "The big adventure", tour: byDuration[byDuration.length - 1] },
  ];
  return picks.filter((p): p is { label: string; tour: Tour } => Boolean(p.tour));
}

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-eyebrow">{eyebrow}</p>
      <h2 className="mt-2 font-display text-5xl">{title}</h2>
      {children ? <p className="mt-3 text-muted-foreground">{children}</p> : null}
    </div>
  );
}

function Home() {
  const { data: tours, isLoading, isError } = useQuery(toursQuery);
  const recommended = tours ? pickRecommended(tours) : [];

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt="Snow-capped Tian Shan peaks above a valley at sunrise"
          width={1920}
          height={1088}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 image-veil" />
        <div className="mx-auto flex max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-44">
          <p className="text-eyebrow">Guided mountain tours from Bishkek</p>
          <h1 className="mt-4 max-w-3xl font-display text-6xl sm:text-8xl">
            Walk the Tian Shan with people who call it home.
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Small-group day hikes, yurt nights and multi-day treks across Kyrgyzstan. See real
            dates, book in minutes and pay on the day.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/tours"
              className="rounded-md bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition-opacity hover:opacity-90"
            >
              Explore tours
            </Link>
            <a
              href="#featured"
              className="rounded-md border border-border bg-background/60 px-6 py-3 text-sm font-bold backdrop-blur transition-colors hover:bg-secondary"
            >
              Check availability
            </a>
          </div>
        </div>
      </section>

      <section id="featured" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Featured tours" title="Where we go">
            Pick a trip to see open dates and remaining spots.
          </SectionHeading>
          <Link to="/tours" className="text-sm font-bold text-primary hover:underline">
            See all {tours?.length ?? ""} tours →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[430px] rounded-xl" />
              ))
            : null}
          {isError ? (
            <p className="text-sm text-destructive">
              We couldn&apos;t load the tours just now. Please refresh the page.
            </p>
          ) : null}
          {tours?.slice(0, 3).map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="Why Ala-Too Adventures" title="Simple, honest mountain trips" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {benefits.map((b) => (
              <div key={b.title} className="surface-panel p-6">
                <b.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-bold">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="How it works" title="Booked in three steps" />
        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {howItWorks.map((s) => (
            <li key={s.n} className="border-t-2 border-primary pt-5">
              <span className="font-display text-5xl text-primary">{s.n}</span>
              <h3 className="mt-2 text-lg font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {recommended.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <SectionHeading eyebrow="Recommended" title="Not sure where to start?" />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {recommended.map(({ label, tour }) => (
              <Link
                key={label}
                to="/tours/$slug"
                params={{ slug: tour.slug }}
                className="group flex gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary"
              >
                <img
                  src={tourImage(tour.image_key)}
                  alt={tour.name}
                  loading="lazy"
                  className="h-24 w-24 shrink-0 rounded-lg object-cover"
                />
                <div>
                  <p className="text-eyebrow">{label}</p>
                  <p className="mt-1 font-bold group-hover:text-primary">{tour.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {tour.duration_days} {tour.duration_days === 1 ? "day" : "days"} ·{" "}
                    {tour.difficulty} · from ${tour.price_per_person}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="The team" title="Your guides">
            A small local team — you&apos;ll know who is leading your trip before you arrive.
          </SectionHeading>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {guides.map((g) => (
              <div key={g.name} className="surface-panel p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 font-display text-2xl text-primary">
                  {g.name[0]}
                </div>
                <h3 className="mt-4 text-lg font-bold">{g.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {g.role}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{g.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="Guest stories" title="What travellers say">
          Sample reviews for this demo — not verified customers.
        </SectionHeading>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.name} className="rounded-xl border border-border bg-card p-6">
              <blockquote className="text-sm leading-relaxed">&ldquo;{r.text}&rdquo;</blockquote>
              <figcaption className="mt-4 text-xs text-muted-foreground">
                <span className="font-bold text-foreground">{r.name}</span> · {r.from} · {r.tour}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <SectionHeading eyebrow="FAQ" title="Good to know" />
        <Accordion type="single" collapsible className="mt-6">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-4">
            <Mountain className="mt-1 h-8 w-8 shrink-0 text-primary" />
            <div>
              <h2 className="font-display text-5xl">Ready for the mountains?</h2>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                Pick a tour, choose an open date and you&apos;re booked.
              </p>
            </div>
          </div>
          <Link
            to="/tours"
            className="rounded-md bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            Explore tours
          </Link>
        </div>
      </section>
    </div>
  );
}
