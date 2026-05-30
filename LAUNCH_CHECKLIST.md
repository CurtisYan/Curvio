# Curvio Launch Checklist

This document lists the required actions when moving from local development to production.

## 1. Replace Localhost With Production Domain

- Set `NEXT_PUBLIC_SITE_URL` to your production URL.
  - Example: `https://curvio.org`
- Remove all localhost values from production environment variables.

Recommended production environment values:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<turnstile-site-key>
TURNSTILE_SECRET_KEY=<turnstile-secret-key>

R2_ACCOUNT_ID=<r2-account-id>
R2_ACCESS_KEY_ID=<r2-access-key-id>
R2_SECRET_ACCESS_KEY=<r2-secret-access-key>
R2_BUCKET_NAME=<r2-bucket>
R2_PUBLIC_BASE_URL=https://cdn.your-domain.com
```

## 2. Supabase Auth URL Configuration

In Supabase Dashboard:

- Go to `Authentication -> URL Configuration`.
- Set `Site URL` to your production domain.
  - Example: `https://your-domain.com`
- Add exact redirect URLs used by this app.

Required redirect URLs:

- `https://your-domain.com/en/dashboard`
- `https://your-domain.com/zh/dashboard`
- `https://your-domain.com/en/register/verify`
- `https://your-domain.com/zh/register/verify`
- `https://your-domain.com/en/reset`
- `https://your-domain.com/zh/reset`

## 3. Password Reset Flow Verification

- Trigger reset from `/en/forgot` and `/zh/forgot`.
- Confirm email button points to your production domain, not localhost.
- Confirm reset page opens and allows password update.

Expected user-facing behavior:

- Always show a generic success message after submitting email.
- Do not reveal whether an email exists.

## 4. Email Template Checks

- In Supabase `Authentication -> Email Templates`, verify:
  - Recovery template uses `{{ .ConfirmationURL }}`.
  - No hardcoded localhost links.
- If using custom SMTP, disable link tracking/rewriting when possible.

## 5. Security Checklist

- Rotate any leaked keys before release.
- Store secrets only in deployment platform env vars.
- Never commit real secrets to repo files.

## 6. Smoke Test Before Going Live

- Register a new account (EN + ZH).
- Verify OTP flow works (send + verify).
- Login/logout works.
- Forgot password and reset flow works end-to-end.
- Upload avatar and record images works against R2.

## 7. Post-Launch Monitoring

- Monitor auth errors in logs for 24-48 hours.
- Watch reset email delivery and bounce rates.
- Confirm no redirects still point to localhost.
