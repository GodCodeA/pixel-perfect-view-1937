import { supabase } from "@/integrations/supabase/client";

export type Tour = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  region: string;
  difficulty: string;
  duration_days: number;
  price_per_person: number;
  max_group_size: number;
  highlights: string[];
  included: string[];
  not_included: string[];
  meeting_point: string;
  image_key: string;
  sort_order: number;
};

export type Departure = {
  id: string;
  tour_id: string;
  departure_date: string;
  total_spots: number;
  spots_taken: number;
  departure_time: string;
};

export type Booking = {
  id: string;
  reference: string;
  tour_id: string;
  departure_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_whatsapp: string | null;
  guests: number;
  total_price: number;
  notes: string | null;
  status: string;
  reminder_sent_at: string | null;
  reminder_status: "pending" | "sending" | "sent" | "failed";
  reminder_error: string | null;
  created_at: string;
};

export const toursQuery = {
  queryKey: ["tours"],
  queryFn: async (): Promise<Tour[]> => {
    const { data, error } = await supabase
      .from("tours")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Tour[];
  },
};

export const tourQuery = (slug: string) => ({
  queryKey: ["tour", slug],
  queryFn: async (): Promise<Tour | null> => {
    const { data, error } = await supabase.from("tours").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return (data as Tour) ?? null;
  },
});

export const departuresQuery = (tourId: string | undefined) => ({
  queryKey: ["departures", tourId],
  enabled: Boolean(tourId),
  queryFn: async (): Promise<Departure[]> => {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("departures")
      .select("*")
      .eq("tour_id", tourId!)
      .gte("departure_date", today)
      .order("departure_date", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Departure[];
  },
});

export const bookingQuery = (reference: string) => ({
  queryKey: ["booking", reference],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, tours(*), departures(*)")
      .eq("reference", reference)
      .maybeSingle();
    if (error) throw error;
    return data as (Booking & { tours: Tour; departures: Departure }) | null;
  },
});

export const dashboardBookingsQuery = {
  queryKey: ["dashboard-bookings"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, tours(*), departures(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as (Booking & { tours: Tour; departures: Departure })[];
  },
};

export class NotEnoughSpotsError extends Error {}

export async function createBooking(input: {
  tour: Tour;
  departure: Departure;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  guests: number;
  notes: string;
}) {
  // Remaining spots are updated (and overbooking blocked) by a database trigger.
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      tour_id: input.tour.id,
      departure_id: input.departure.id,
      customer_name: input.name.trim(),
      customer_email: input.email.trim(),
      customer_phone: input.phone.trim(),
      customer_whatsapp: input.whatsapp.trim() || null,
      guests: input.guests,
      total_price: input.guests * input.tour.price_per_person,
      notes: input.notes.trim() || null,
      status: "confirmed",
    })
    .select("reference")
    .single();
  if (error) {
    if (error.message.includes("NOT_ENOUGH_SPOTS")) throw new NotEnoughSpotsError(error.message);
    throw error;
  }
  return data.reference as string;
}

export function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function spotsLeft(departure: Departure) {
  return Math.max(0, departure.total_spots - departure.spots_taken);
}
