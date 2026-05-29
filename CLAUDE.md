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
