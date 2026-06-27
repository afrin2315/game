# Rooman Alumni Network

Full-stack alumni network scaffold for Rooman Institute using React + Supabase.

## Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Supabase Auth, Postgres, Storage, Realtime
- Payments: Razorpay via Supabase Edge Functions
- Invite delivery: MSG91 / Resend via Edge Function

## Project Structure

- `/src/components` reusable UI building blocks
- `/src/pages` Landing, Register, Feed, Members, Mentorship, Profile, Admin
- `/src/hooks` auth/posts/profile/connections data hooks
- `/src/lib` Supabase and Razorpay helpers
- `/supabase/migrations` SQL schema + RLS policies
- `/supabase/functions` edge functions for order creation, payment verify, and invite sending

## Run frontend

```bash
npm install
npm run dev
```

## Environment

Copy `.env.example` to `.env` and set values.

```bash
cp .env.example .env
```

Required vars:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET` (Edge Function secret)
- `MSG91_AUTH_KEY`
- `RESEND_API_KEY`

## Supabase setup

1. Apply migration from `/supabase/migrations`.
2. Create a storage bucket named `profiles` for avatars.
3. Deploy edge functions:
   - `create-razorpay-order`
   - `verify-payment`
   - `send-invite`
4. Add function secrets in Supabase.

## Features implemented

- Invite landing with live profile count
- 2-step registration with Supabase OTP verify flow
- Authenticated app shell with Feed, Members, Mentorship, and My Profile tabs
- Post create/like/comment with realtime refresh and lazy loading
- Directory search/filter + connect request action
- Mentor listing + Razorpay booking modal wired to edge functions
- Profile editing + avatar upload + shareable public profile route
- Admin CSV invite upload + edge function trigger
- Supabase SQL schema and baseline RLS policies
