# Curvio

<p align="right">
  <a href="./README.zh-CN.md"><kbd>中文 README</kbd></a>
</p>

Curvio is an open-source public-good community for recording donations, acts of kindness, and open work.

It is intentionally quiet. It is not a fundraising platform, not a payment product, and not a place for donation rankings. Curvio exists for a simpler reason: to help people keep a long-term record of good things they have done, supported, or built, without turning kindness into performance.

The first version focuses on three kinds of records:

- Donations to public-good projects or organizations.
- Acts of kindness that are not necessarily financial.
- Free and open-source projects with public-good value.

Curvio keeps the product boundary narrow by design. It does not provide private payment links, does not take commission, does not rank people by amount, and does not use likes or badges as the center of the experience. A small donation, a quiet volunteer action, or a maintained open-source tool can all be recorded with the same dignity.

## Why This Exists

Curvio began with a personal need: I wanted a place to record the small donations I made as a student. The amounts were not large, but the habit mattered.

Most public-good tools emphasize campaigns, urgency, and fundraising conversion. Those are useful in the right context, but Curvio is trying to hold a different space: a calm public archive where long-term goodwill can accumulate, be revisited, and gently encourage others to participate.

## Product Principles

- Recording first, social features second.
- Truthfulness first, metrics second.
- Long-term consistency first, short-term attention second.
- Privacy and user control are part of the product, not an afterthought.
- Open source is the default posture, so the community can inspect, improve, and reuse the work.

## What Curvio Supports

Curvio currently includes public profiles, public and private records, amount visibility controls, anonymous publishing, record images with public/private visibility, bilingual English and Chinese pages, a searchable public archive, and a curated entry page for official charity platforms.

The privacy model is deliberately modest: Curvio only collects the account, profile, record, follow, and display-preference data needed to run the community. It does not collect payment card data because it does not process donations.

## Stack

Curvio is built with Next.js, React, Supabase, Cloudflare R2, Cloudflare Turnstile, and OpenNext for Cloudflare deployment.

For local development:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Copy `.env.example` to `.env.local` and fill in the required Supabase, R2, Turnstile, and site URL values.

I recognize and recommend this community: [Linux Do](https://linux.do/)
