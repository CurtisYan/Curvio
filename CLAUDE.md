

# Curvio Development Notes

Curvio is a restrained public-welfare archive, not a donation collection or fundraising platform. Keep the product quiet, sincere, bilingual, and non-competitive.

## Current Phase

- This repository implements the phase-one front-end shell plus the first real Supabase account flow.
- Public browsing data is still mostly mock-driven in `src/lib/mock-data.ts`.
- Supabase Auth uses email OTP verification: register with `signUp()`, enter the mailed token, then complete with `verifyOtp({ type: "signup" })`.
- Dashboard settings read/write the authenticated user's profile and profile section order.
- Avatar uploads are designed for Cloudflare R2 using a stable object key: `avatars/{userId}/avatar`.

## Product Boundaries

- Do not add private payment links or personal collection flows.
- Do not add likes, comments, leaderboards, amount rankings, top-donor lists, or popularity sorting.
- Donation links must point to official organization/platform websites.
- Donation amounts should be hidden by default and never used for ranking.
- Anonymous public records should not link to a user profile.

## Frontend Constraints

- Keep a single visual language across public pages, profile pages, and record flows; avoid making dashboard-like pages feel like separate products.
- Public record URLs must use a date-prefixed format, `YYYYMMDD-{uuid}`, so links are human-readable while still remaining stable and unique.
- Treat that public record ID as part of the product contract: Supabase should store it, and every detail/edit/link surface should resolve it the same way.
- Record type badges such as Donation, Kindness, and Open Work should be clickable and route to the matching filtered Explore view.
- Public profile pages should reuse the same type badge and section styling patterns as the record detail pages and record lists.
- Profile tabs for Donations, Kindness, Open Work, Annual Summary, Following, and Followers should all feel like one coherent navigation system, not separate widgets.
- Do not introduce a second theme variant for dashboard or profile flows unless the product requirements explicitly change.

## Hover / Interaction

- Maintain a slightly stronger, still-subtle hover shadow across interactive surfaces (cards, buttons with surface background). Use the following Tailwind utility as canonical:

	- `transition-shadow hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]`

	This replaces lighter hover shadows and ensures hover state remains noticeable while keeping the overall UI restrained. Apply it to `Card` defaults and any surface elements that currently use weaker shadows.

## Technical Notes

- Framework: Next.js App Router, TypeScript, Tailwind CSS 4.
- Internationalization uses locale routes: `/en` and `/zh`.
- User-facing strings should live in `src/messages/en.json` and `src/messages/zh.json`.
- Reusable UI should stay in `src/components`.
- Mock types live in `src/lib/types.ts`; keep these close to the future Supabase schema.
- Supabase env vars are documented in `.env.example`; local values belong in `.env.local`.
- R2 server-side env vars are also documented in `.env.example`; never expose R2 secret keys to the browser.
- Next.js 16 session refresh should use `src/proxy.ts`, not the deprecated `middleware.ts` route entry.
- `next/font` is intentionally not used so production builds do not depend on fetching Google Fonts.

## Verification

Run these before committing:

```bash
npm run lint
npm run build
```

## Git Habit

After each meaningful implementation conversation, create a focused commit with a clear message. Keep unrelated generated artifacts out of the commit unless they are part of the app state.
At the end of each session, push the commit to GitHub.
