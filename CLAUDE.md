
# Curvio Development Notes (Compact)

Curvio is a restrained public-welfare archive, not a fundraising product.

## Non-Negotiable Product Rules

- No private collection links, payment processing, likes, comments, rankings, or gamified competition.
- Donation links must point to official organization/platform websites.
- Amounts are hidden by default and cannot be used for ranking.
- Anonymous records must not expose profile links.

## Data & Privacy Defaults

- Keep optional profile fields optional: `location`, `website_url`, `github_url`, `blog_url`, `bio`, `principle`.
- Keep anonymous toggle available.
- Keep amount visibility hidden by default.
- Avoid collecting unrelated personal data.

## Frontend Contracts

- Keep one coherent visual language across public/profile/dashboard flows.
- Public record URL format is fixed: `YYYYMMDD-{uuid}`.
- Type badges (Donation/Kindness/Open Work) must be clickable and route to filtered Explore.
- Canonical hover utilities live in `src/components/ui/interactive.ts`:
  - `surfaceHover`
  - `surfaceHoverLow`

## Schema Sync Rule (Required)

Any Supabase schema change must be synchronized in the same commit:

- migration SQL in `supabase/migrations/`
- schema notes in `docs/schema.md`

Applies to table/column add-remove-rename, constraints, indexes, triggers, RPC/functions, and defaults.

## Implementation Notes

- Framework: Next.js App Router + TypeScript + Tailwind CSS 4.
- Locale routes: `/en`, `/zh`.
- User-facing copy: `src/messages/en.json`, `src/messages/zh.json`.
- Reusable components: `src/components`.
- Supabase/R2 env vars: `.env.example` and `.env.local`.

## Verification

Run before commit:

```bash
npm run lint
npm run build
```

## Git Rule

- Keep commits focused and readable.
- Push to GitHub after each meaningful change.
