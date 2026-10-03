import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Clock, MapPin, Users, X, CalendarDays } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { departuresQuery, formatDate, spotsLeft, tourQuery } from "@/lib/bookings";
import { tourImage } from "@/lib/tour-images";

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

  const open = departures?.filter((d) => spotsLeft(d) > 0) ?? [];

  return (
    <div>
      <div className="relative isolate">
        <img
          src={tourImage(tour.image_key)}
          alt={tour.name}
          width={1280}
          height={864}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 image-veil" />
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-36">
          <p className="text-eyebrow">
            {tour.region} · {tour.difficulty}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-6xl sm:text-8xl">{tour.name}</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">{tour.summary}</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          <div className="flex flex-wrap gap-6 border-y border-border py-5 text-sm">
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              {tour.duration_days} {tour.duration_days === 1 ? "day" : "days"}
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> max {tour.max_group_size} guests
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> {tour.meeting_point}
            </span>
          </div>

          <section>
            <h2 className="font-display text-4xl">The trip</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{tour.description}</p>
          </section>

          <section>
            <h2 className="font-display text-4xl">Highlights</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {tour.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {h}
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-8 sm:grid-cols-2">
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

          <section id="availability">
            <h2 className="font-display text-4xl">Availability</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Demo availability — dates and remaining spots are sample data.
            </p>
            <div className="mt-4 space-y-2">
              {loadingDates
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))
                : null}
              {!loadingDates && open.length === 0 ? (
                <p className="rounded-lg border border-border p-5 text-sm text-muted-foreground">
                  No open dates right now. Message Azamat on WhatsApp and he&apos;ll add one.
                </p>
              ) : null}
              {open.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">{formatDate(d.departure_date)}</p>
                      <p className="text-xs text-muted-foreground">
                        {spotsLeft(d)} of {d.total_spots} spots left
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/book/$slug"
                    params={{ slug: tour.slug }}
                    search={{ departure: d.id }}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                  >
                    Select date
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="surface-panel p-6">
            <p className="text-sm text-muted-foreground">From</p>
            <p className="font-display text-6xl">${tour.price_per_person}</p>
            <p className="text-sm text-muted-foreground">per person</p>
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
