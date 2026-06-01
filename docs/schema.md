# Curvio Schema Notes

This document records the current Supabase business schema based on the latest schema SQL export provided on 2026-06-01.

## Sync Rule

- Any Supabase schema change must be synchronized in the same change set with migration SQL under `supabase/migrations/` and this document.
- This document is a readable schema note for the team. It does not replace executable migration SQL.
- The current source of truth for this update is the provided SQL export. It contains table definitions, columns, primary keys, foreign keys, defaults, and check constraints.

## 1. profiles

Purpose: stores user profile, public page settings, and privacy/display preferences.

Columns:

- `id`: user ID. Primary key. References `auth.users(id)`.
- `username`: unique public username. Required. Must match `^[a-z0-9_]+$`.
- `display_name`: required display name. Length must be 2-40 characters.
- `avatar_url`: optional avatar URL.
- `bio`: optional profile bio.
- `location`: optional location text.
- `principle`: optional personal principle.
- `website_url`: optional personal website URL.
- `github_url`: optional GitHub URL.
- `blog_url`: optional blog URL.
- `preferred_language`: required preferred language. Defaults to `en`. Allowed values: `en`, `zh`.
- `is_public`: whether the profile is public. Defaults to `true`.
- `allow_follow`: whether other users can follow this profile. Defaults to `true`.
- `show_annual_summary`: whether to show the annual summary. Defaults to `true`.
- `hide_amounts_by_default`: whether amounts are hidden by default. Defaults to `true`.
- `created_at`: creation time. Defaults to `now()`.
- `updated_at`: update time. Defaults to `now()`.

Constraints:

- Primary key: `profiles_pkey` on `id`.
- Foreign key: `profiles_id_fkey`, `id` references `auth.users(id)`.
- Unique: `username`.
- Checks: username format, display name length, preferred language.

## 2. follows

Purpose: stores follow relationships between profiles.

Columns:

- `id`: follow relationship ID. Primary key. Defaults to `gen_random_uuid()`.
- `follower_id`: user who follows. Required. References `public.profiles(id)`.
- `following_id`: user being followed. Required. References `public.profiles(id)`.
- `created_at`: follow creation time. Defaults to `now()`.

Constraints:

- Primary key: `follows_pkey` on `id`.
- Foreign keys: `follower_id` and `following_id` reference `public.profiles(id)`.

## 3. records

Purpose: stores donation, kindness, and open-source public-good records.

Columns:

- `id`: record ID. Primary key. Defaults to `gen_random_uuid()`.
- `user_id`: owner profile ID. Required. References `public.profiles(id)`.
- `type`: record type. Required. Allowed values: `donation`, `kindness`, `open_source`.
- `title`: record title. Required.
- `organization_name`: optional organization name.
- `platform_name`: optional platform name.
- `project_url`: optional project or source URL.
- `amount`: optional amount.
- `currency`: optional currency.
- `show_amount`: whether to show the amount. Defaults to `false`.
- `content`: main record content. Required.
- `reflection`: optional reflection text.
- `date`: record date. Required.
- `tags`: tag array. Defaults to an empty text array.
- `language`: content language. Defaults to `en`. Allowed values: `en`, `zh`.
- `is_public`: whether the record is public. Defaults to `true`.
- `is_anonymous`: whether the record is published anonymously. Defaults to `false`.
- `created_at`: creation time. Defaults to `now()`.
- `updated_at`: update time. Defaults to `now()`.
- `public_record_id`: public record identifier. Required.

Constraints:

- Primary key: `records_pkey` on `id`.
- Foreign key: `records_user_id_fkey`, `user_id` references `public.profiles(id)`.
- Checks: record type and language.

## 4. record_images

Purpose: stores metadata for images attached to records. Image files are stored outside the database.

Columns:

- `id`: image record ID. Primary key. Defaults to `gen_random_uuid()`.
- `record_id`: owner record ID. Required. References `public.records(id)`.
- `user_id`: owner profile ID. Required. References `public.profiles(id)`.
- `r2_key`: R2 object key. Required.
- `r2_url`: R2 object URL. Required.
- `mime_type`: file MIME type. Required.
- `file_size`: optional file size in bytes.
- `sort_order`: image ordering value. Defaults to `0`.
- `created_at`: creation time. Defaults to `now()`.
- `is_cover`: whether this image is the cover image. Defaults to `false`.

Constraints:

- Primary key: `record_images_pkey` on `id`.
- Foreign keys: `record_id` references `public.records(id)`, `user_id` references `public.profiles(id)`.

## 5. profile_sections

Purpose: controls which sections appear on a public profile and their order.

Columns:

- `id`: section config ID. Primary key. Defaults to `gen_random_uuid()`.
- `user_id`: owner profile ID. Required. References `public.profiles(id)`.
- `section_type`: section type. Required. Allowed values: `donations`, `kindness`, `open_source`, `annual_summary`, `about`, `timeline`, `favorite_platforms`.
- `sort_order`: section sort order. Defaults to `0`.
- `is_visible`: whether the section is visible. Defaults to `true`.
- `created_at`: creation time. Defaults to `now()`.
- `updated_at`: update time. Defaults to `now()`.

Constraints:

- Primary key: `profile_sections_pkey` on `id`.
- Foreign key: `profile_sections_user_id_fkey`, `user_id` references `public.profiles(id)`.
- Check: section type.

## 6. open_source_projects

Purpose: stores user open-source project profiles.

Columns:

- `id`: project ID. Primary key. Defaults to `gen_random_uuid()`.
- `user_id`: owner profile ID. Required. References `public.profiles(id)`.
- `name`: project name. Required.
- `description`: project description. Required.
- `repo_url`: repository URL. Required.
- `demo_url`: optional demo URL.
- `screenshot_url`: optional screenshot URL.
- `license`: optional license.
- `tech_stack`: technology stack array. Defaults to an empty text array.
- `status`: project status. Defaults to `Building`. Allowed values: `Planning`, `Building`, `Active`, `Maintained`, `Paused`, `Archived`.
- `is_free`: whether the project is free. Defaults to `true`.
- `is_open_source`: whether the project is open source. Defaults to `true`.
- `is_public`: whether the project is public. Defaults to `true`.
- `language`: project language. Defaults to `en`. Allowed values: `en`, `zh`.
- `tags`: tag array. Defaults to an empty text array.
- `created_at`: creation time. Defaults to `now()`.
- `updated_at`: update time. Defaults to `now()`.

Constraints:

- Primary key: `open_source_projects_pkey` on `id`.
- Foreign key: `open_source_projects_user_id_fkey`, `user_id` references `public.profiles(id)`.
- Checks: project status and language.

## 7. donation_platforms

Purpose: stores the official donation platform directory shown by the product.

Columns:

- `id`: platform ID. Primary key. Defaults to `gen_random_uuid()`.
- `name`: platform name. Required.
- `description`: platform description. Required.
- `official_url`: official URL. Required.
- `official_url_zh`: optional Chinese official URL.
- `region`: optional region.
- `languages`: supported language array. Defaults to an empty text array.
- `category`: optional category.
- `is_verified`: whether the platform is verified. Defaults to `true`.
- `created_at`: creation time. Defaults to `now()`.
- `updated_at`: update time. Defaults to `now()`.

Constraints:

- Primary key: `donation_platforms_pkey` on `id`.

## 8. deletion_requests

Purpose: records user requests for data deletion or account cleanup.

Columns:

- `id`: deletion request ID. Primary key. Defaults to `gen_random_uuid()`.
- `user_id`: requesting profile ID. Required. References `public.profiles(id)`.
- `request_content`: request body. Required.
- `status`: processing status. Defaults to `pending`. Allowed values: `pending`, `processing`, `completed`, `rejected`.
- `processed_note`: optional processing note.
- `created_at`: creation time. Defaults to `now()`.
- `updated_at`: update time. Defaults to `now()`.
- `processed_at`: optional processed time.

Constraints:

- Primary key: `deletion_requests_pkey` on `id`.
- Foreign key: `deletion_requests_user_id_fkey`, `user_id` references `public.profiles(id)`.
- Check: deletion request status.

## Current Table List

- `deletion_requests`
- `donation_platforms`
- `follows`
- `open_source_projects`
- `profile_sections`
- `profiles`
- `record_images`
- `records`

## Notes Removed From Previous Local Record

The latest provided SQL does not include `reset_requests`, `login_failures`, or the `consume_reset_request_limit` RPC, so they are not listed in this schema note.
