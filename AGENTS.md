<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Ala-Too Adventures — technical rules

- Data access goes through `src/lib/bookings.ts` (query option objects + mutations) using the browser Supabase client; keeps route components free of query plumbing.
- Tour photos are bundled assets mapped by `image_key` in `src/lib/tour-images.ts`; the database stores only the key so images stay out of the DB.
- Pages are flat TanStack routes (`index`, `tours.index`, `tours.$slug`, `book.$slug`, `booking.$reference`, `dashboard`); shared chrome lives in `__root.tsx`.
- Prototype has no authentication: booking tables use permissive demo RLS policies. Add real auth before this handles live customer data.
- Tour itineraries, packing lists and the cancellation text live in `src/lib/tour-content.ts` (keyed by slug); home-page guides, reviews and FAQ live in `src/lib/site-content.ts` and are flagged `isSample`. Core tour facts stay in the database so prices and capacity have one source.
