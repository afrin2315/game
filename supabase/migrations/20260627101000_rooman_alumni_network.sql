create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid references auth.users primary key,
  name text not null,
  email text,
  phone text,
  batch_year int,
  course text,
  company text,
  role text,
  domain text,
  city text,
  bio text,
  avatar_url text,
  is_mentor boolean default false,
  is_open_to_work boolean default false,
  is_startup_varsity boolean default false,
  is_admin boolean default false,
  mentor_rate int,
  verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  content text not null,
  post_type text check (post_type in ('Update','Hiring','OpenToWork','Mentorship','StartupVarsity')),
  likes_count int default 0,
  comments_count int default 0,
  created_at timestamptz default now()
);

create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  unique(post_id, user_id)
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

create table if not exists connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references profiles(id) on delete cascade,
  receiver_id uuid references profiles(id) on delete cascade,
  status text check (status in ('pending','accepted','rejected')) default 'pending',
  created_at timestamptz default now(),
  unique(requester_id, receiver_id)
);

create table if not exists mentorship_sessions (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid references profiles(id),
  mentee_id uuid references profiles(id),
  topic text,
  scheduled_at timestamptz,
  duration_mins int default 60,
  amount int,
  status text check (status in ('pending','confirmed','completed','cancelled')) default 'pending',
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz default now()
);

create table if not exists invites (
  id uuid primary key default gen_random_uuid(),
  email text,
  phone text,
  name text,
  token text unique default gen_random_uuid()::text,
  status text check (status in ('pending','accepted')) default 'pending',
  sent_at timestamptz default now(),
  accepted_at timestamptz
);

create or replace function increment_post_like(post_uuid uuid)
returns void language sql security definer as $$
  update posts set likes_count = likes_count + 1 where id = post_uuid;
$$;

create or replace function decrement_post_like(post_uuid uuid)
returns void language sql security definer as $$
  update posts set likes_count = greatest(likes_count - 1, 0) where id = post_uuid;
$$;

create or replace function increment_post_comment(post_uuid uuid)
returns void language sql security definer as $$
  update posts set comments_count = comments_count + 1 where id = post_uuid;
$$;

alter table profiles enable row level security;
alter table posts enable row level security;
alter table likes enable row level security;
alter table comments enable row level security;
alter table connections enable row level security;
alter table mentorship_sessions enable row level security;
alter table invites enable row level security;

create policy "profiles are readable by authenticated users" on profiles
for select using (auth.role() = 'authenticated');

create policy "users update own profile" on profiles
for update using (auth.uid() = id)
with check (auth.uid() = id);

create policy "users insert own profile" on profiles
for insert with check (auth.uid() = id);

create policy "posts visible to authenticated users" on posts
for select using (auth.role() = 'authenticated');

create policy "users create own post" on posts
for insert with check (auth.uid() = user_id);

create policy "users update own post" on posts
for update using (auth.uid() = user_id);

create policy "likes readable by authenticated users" on likes
for select using (auth.role() = 'authenticated');

create policy "users manage own likes" on likes
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "comments readable by authenticated users" on comments
for select using (auth.role() = 'authenticated');

create policy "users create own comments" on comments
for insert with check (auth.uid() = user_id);

create policy "users update/delete own comments" on comments
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "connections visible to participants" on connections
for select using (auth.uid() = requester_id or auth.uid() = receiver_id);

create policy "users create own connection requests" on connections
for insert with check (auth.uid() = requester_id);

create policy "participants update connection status" on connections
for update using (auth.uid() = requester_id or auth.uid() = receiver_id);

create policy "sessions visible to participants" on mentorship_sessions
for select using (auth.uid() = mentor_id or auth.uid() = mentee_id);

create policy "mentees create sessions for themselves" on mentorship_sessions
for insert with check (auth.uid() = mentee_id);

create policy "participants update sessions" on mentorship_sessions
for update using (auth.uid() = mentor_id or auth.uid() = mentee_id);

create policy "only admins manage invites" on invites
for all using (
  exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
)
with check (
  exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
);
