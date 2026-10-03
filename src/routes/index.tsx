import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, MessageSquareOff, ShieldCheck, Mountain } from "lucide-react";

import heroImage from "@/assets/hero-mountains.jpg";
import { TourCard } from "@/components/tour-card";
import { Skeleton } from "@/components/ui/skeleton";
import { toursQuery } from "@/lib/bookings";

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

const steps = [
  {
    icon: CalendarCheck,
    title: "See real dates",
    body: "Every trip shows the departures that still have space, with the number of spots left.",
  },
  {
    icon: MessageSquareOff,
    title: "No message ping-pong",
    body: "Price, inclusions and group size are on the page. Pick a date and you are done.",
  },
  {
    icon: ShieldCheck,
    title: "Confirmed instantly",
    body: "You get a booking reference straight away, and Azamat sees it on his dashboard.",
  },
];

function Home() {
  const { data: tours, isLoading, isError } = useQuery(toursQuery);

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
          <p className="text-eyebrow">Bishkek · Kyrgyzstan</p>
          <h1 className="mt-4 max-w-3xl font-display text-6xl sm:text-8xl">
            The mountains are two hours away. Booking takes two minutes.
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Small-group day hikes, yurt nights and multi-day treks across the Tian Shan, run by a
            local guide who knows every valley on this list.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/tours"
              className="rounded-md bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition-opacity hover:opacity-90"
            >
              Browse tours &amp; dates
            </Link>
            <Link
              to="/dashboard"
              className="rounded-md border border-border bg-background/60 px-6 py-3 text-sm font-bold backdrop-blur transition-colors hover:bg-secondary"
            >
              Owner dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="surface-panel p-6">
              <step.icon className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-lg font-bold">{step.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-eyebrow">Our trips</p>
            <h2 className="mt-2 font-display text-5xl">Where we go</h2>
          </div>
          <Link to="/tours" className="text-sm font-bold text-primary hover:underline">
            See all {tours?.length ?? 6} tours →
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

      <section className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-4">
            <Mountain className="mt-1 h-8 w-8 shrink-0 text-primary" />
            <div>
              <h2 className="font-display text-4xl">Not sure which trip fits?</h2>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                Every tour page lists difficulty, what is included and the exact dates still open.
                Start there — most people book without sending a single message.
              </p>
            </div>
          </div>
          <Link
            to="/tours"
            className="rounded-md bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            Check availability
          </Link>
        </div>
      </section>
    </div>
  );
}
