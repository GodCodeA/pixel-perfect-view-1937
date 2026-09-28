import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Users } from "lucide-react";

import type { Tour } from "@/lib/bookings";
import { tourImage } from "@/lib/tour-images";

export function TourCard({ tour }: { tour: Tour }) {
  return (
    <Link
      to="/tours/$slug"
      params={{ slug: tour.slug }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/60"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={tourImage(tour.image_key)}
          alt={tour.name}
          loading="lazy"
          width={1280}
          height={864}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 image-veil" />
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent">
          {tour.difficulty}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-2xl">{tour.name}</h3>
        <p className="flex-1 text-sm text-muted-foreground">{tour.summary}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> {tour.region}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {tour.duration_days} {tour.duration_days === 1 ? "day" : "days"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> max {tour.max_group_size}
          </span>
        </div>
        <div className="flex items-baseline justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">
            from <span className="text-lg font-bold text-foreground">${tour.price_per_person}</span>{" "}
            / person
          </span>
          <span className="text-sm font-bold text-primary">View trip →</span>
        </div>
      </div>
    </Link>
  );
}
