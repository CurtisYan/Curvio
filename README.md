# Curvio

Curvio is a quiet public-good archive for recording donations, acts of kindness, and open-source contributions.

It is built with Next.js, React, Supabase, Cloudflare R2, and Turnstile.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the required Supabase, Turnstile, and R2 values.

For production, set `NEXT_PUBLIC_SITE_URL` to the final domain and update Supabase Auth redirect URLs accordingly.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
