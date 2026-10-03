import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { TourCard } from "@/components/tour-card";
import { Skeleton } from "@/components/ui/skeleton";
import { toursQuery } from "@/lib/bookings";

export const Route = createFileRoute("/tours/")({
  head: () => ({
    meta: [
      { title: "All tours — Ala-Too Adventures" },
      {
        name: "description",
        content:
          "Day hikes, yurt stays and multi-day treks across Kyrgyzstan, with prices, difficulty and open departure dates.",
      },
      { property: "og:title", content: "All tours — Ala-Too Adventures" },
      {
        property: "og:description",
        content: "Compare Kyrgyz mountain trips by region, difficulty and length.",
      },
    ],
  }),
  component: ToursPage,
});

const filters = ["All", "Easy", "Moderate", "Challenging"] as const;

function ToursPage() {
  const { data: tours, isLoading, isError } = useQuery(toursQuery);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const visible = tours?.filter((t) => filter === "All" || t.difficulty === filter) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-eyebrow">Six trips, one guide</p>
      <h1 className="mt-3 font-display text-6xl sm:text-7xl">Choose your mountains</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Prices are per person and include transport from the meeting point, guiding and the meals
        listed on each trip.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={
              f === filter
                ? "rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                : "rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[430px] rounded-xl" />
            ))
          : null}
        {visible.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>

      {isError ? (
        <p className="mt-8 text-sm text-destructive">
          We couldn&apos;t load the tours. Please refresh the page and try again.
        </p>
      ) : null}
      {!isLoading && !isError && visible.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No trips match that difficulty yet. Try another filter.
        </p>
      ) : null}
    </div>
  );
}
