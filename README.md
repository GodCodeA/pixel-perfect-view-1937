# Ala-Too Adventures

A guided mountain adventure booking platform for discovering tours, checking real availability and booking trips online.

## Purpose
Ala-Too Adventures is a small mountain tour business in Bishkek, Kyrgyzstan, run by one owner. The app turns "Can I book this tour?" into "You're booked" with minimal manual work.

## Main features
- Six guided tours with details, inclusions and pricing
- Live availability per departure (fully booked or past dates can't be selected)
- Four-step booking flow with inline validation
- Booking confirmation page with a booking reference
- Owner dashboard: today / upcoming / all bookings, reschedule, cancel, reminder status

## Tech stack
React 19, TypeScript, TanStack Start/Router, Vite, Tailwind CSS v4, shadcn/ui, Lucide icons, zod.

## Data (Lovable Cloud / Supabase)
- `tours`, `departures`, `bookings` tables
- A database trigger keeps `departures.spots_taken` in sync and blocks overbooking
- The dashboard updates in real time when bookings change
- Only the publishable (client-safe) key is used in the browser

## Booking flow
Home → Tours → Tour details → Date → Guests → Contact details → Review → Confirm → Confirmation.
No payment is taken online; guests pay on the day.

## Owner dashboard
`/dashboard` lists bookings with customer contact details, guest counts and status, and supports reschedule and cancel. Email reminders are not configured yet — the button reports this honestly.

> Prototype: there is no owner login yet. Add authentication before handling real customer data.

## Development
```sh
bun install
bun run dev
bun run build
bun run lint
```
