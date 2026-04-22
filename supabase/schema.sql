-- ============================================================
-- COACHCONNECT DATABASE SCHEMA
-- Run this once in your Supabase SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  email         text not null,
  full_name     text,
  avatar_url    text,
  role          text not null default 'user' check (role in ('user','trainer','admin')),
  saved_trainers uuid[] default '{}',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- TRAINER PROFILES
-- ============================================================
create table public.trainer_profiles (
  id                    uuid default uuid_generate_v4() primary key,
  user_id               uuid references public.profiles(id) on delete cascade not null unique,

  -- Identity
  display_name          text not null,
  slug                  text not null unique,
  tagline               text,
  bio                   text,
  years_experience      integer default 0,
  gender                text check (gender in ('male','female','non_binary','prefer_not_to_say')),

  -- Location
  city                  text,
  state                 text,
  country               text default 'US',
  remote_available      boolean default true,

  -- Contact (minimum one required)
  contact_email         text,
  contact_phone         text,
  website_url           text,
  instagram_handle      text,
  tiktok_handle         text,
  youtube_url           text,
  facebook_url          text,

  -- Session info
  session_rate_min      integer,
  session_rate_max      integer,
  rate_currency         text default 'USD',
  availability_notes    text,

  -- Languages
  languages             text[] default '{"English"}',

  -- Media
  profile_image_url     text,
  cover_image_url       text,
  gallery_urls          text[] default '{}',
  intro_video_url       text,

  -- Specialties
  sports                text[] default '{}',
  goals                 text[] default '{}',
  certifications        text[] default '{}',
  is_certified          boolean default false,

  -- Listing status
  is_active             boolean default false,
  is_premium            boolean default false,
  subscription_status   text default 'inactive' check (
    subscription_status in ('inactive','trialing','active','past_due','canceled')
  ),
  subscription_tier     text default 'none' check (
    subscription_tier in ('none','standard','premium')
  ),
  subscription_interval text default 'monthly' check (
    subscription_interval in ('monthly','yearly')
  ),
  stripe_customer_id    text,
  stripe_subscription_id text,
  trial_ends_at         timestamptz,

  -- Stats
  average_rating        numeric(3,2) default 0,
  review_count          integer default 0,
  profile_views         integer default 0,

  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index trainer_slug_idx     on public.trainer_profiles(slug);
create index trainer_active_idx   on public.trainer_profiles(is_active, is_premium);
create index trainer_city_idx     on public.trainer_profiles(city, state);
create index trainer_sports_idx   on public.trainer_profiles using gin(sports);
create index trainer_goals_idx    on public.trainer_profiles using gin(goals);
create index trainer_langs_idx    on public.trainer_profiles using gin(languages);

-- ============================================================
-- PROFILE VIEW TRACKING (monthly)
-- ============================================================
create table public.profile_views (
  id         uuid default uuid_generate_v4() primary key,
  trainer_id uuid references public.trainer_profiles(id) on delete cascade not null,
  viewed_at  timestamptz default now(),
  viewer_ip  text
);
create index profile_views_trainer_idx on public.profile_views(trainer_id, viewed_at desc);

-- ============================================================
-- REVIEWS
-- ============================================================
create table public.reviews (
  id             uuid default uuid_generate_v4() primary key,
  trainer_id     uuid references public.trainer_profiles(id) on delete cascade not null,
  reviewer_id    uuid references public.profiles(id) on delete set null,
  inquiry_id     uuid,
  rating         integer not null check (rating >= 1 and rating <= 5),
  title          text,
  body           text,
  reviewer_name  text not null,
  trainer_response text,
  trainer_response_at timestamptz,
  is_verified    boolean default false,
  is_flagged     boolean default false,
  flag_reason    text,
  created_at     timestamptz default now()
);

create index reviews_trainer_idx on public.reviews(trainer_id, created_at desc);

-- ============================================================
-- INQUIRIES
-- ============================================================
create table public.inquiries (
  id            uuid default uuid_generate_v4() primary key,
  trainer_id    uuid references public.trainer_profiles(id) on delete cascade not null,
  sender_id     uuid references public.profiles(id) on delete set null,
  sender_name   text not null,
  sender_email  text not null,
  sender_phone  text,
  message       text not null,
  goal          text,
  is_read       boolean default false,
  created_at    timestamptz default now()
);

create index inquiries_trainer_idx on public.inquiries(trainer_id, created_at desc);

-- ============================================================
-- CATEGORY SUGGESTIONS
-- ============================================================
create table public.category_suggestions (
  id           uuid default uuid_generate_v4() primary key,
  suggested_by uuid references public.profiles(id) on delete set null,
  submitter_type text check (submitter_type in ('user','trainer')),
  category_name text not null,
  reason       text,
  status       text default 'pending' check (status in ('pending','approved','rejected')),
  created_at   timestamptz default now()
);

-- ============================================================
-- REPORTS
-- ============================================================
create table public.reports (
  id          uuid default uuid_generate_v4() primary key,
  reporter_id uuid references public.profiles(id) on delete set null,
  trainer_id  uuid references public.trainer_profiles(id) on delete cascade,
  review_id   uuid references public.reviews(id) on delete cascade,
  reason      text not null,
  details     text,
  status      text default 'pending' check (status in ('pending','reviewed','resolved')),
  created_at  timestamptz default now()
);

-- ============================================================
-- SUBSCRIPTION EVENTS (audit log)
-- ============================================================
create table public.subscription_events (
  id              uuid default uuid_generate_v4() primary key,
  trainer_id      uuid references public.trainer_profiles(id) on delete cascade,
  stripe_event_id text unique,
  event_type      text not null,
  data            jsonb,
  created_at      timestamptz default now()
);

-- ============================================================
-- EMAIL SUBSCRIBERS (users who want city notifications)
-- ============================================================
create table public.email_subscribers (
  id         uuid default uuid_generate_v4() primary key,
  email      text not null unique,
  city       text,
  state      text,
  created_at timestamptz default now()
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trainer_profiles_updated_at
  before update on public.trainer_profiles
  for each row execute function public.handle_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update trainer rating when review changes
create or replace function public.update_trainer_rating()
returns trigger as $$
begin
  update public.trainer_profiles
  set
    average_rating = (select coalesce(avg(rating::numeric),0) from public.reviews where trainer_id = coalesce(new.trainer_id, old.trainer_id)),
    review_count   = (select count(*) from public.reviews where trainer_id = coalesce(new.trainer_id, old.trainer_id))
  where id = coalesce(new.trainer_id, old.trainer_id);
  return coalesce(new, old);
end;
$$ language plpgsql;

create trigger on_review_change
  after insert or update or delete on public.reviews
  for each row execute function public.update_trainer_rating();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles              enable row level security;
alter table public.trainer_profiles      enable row level security;
alter table public.reviews               enable row level security;
alter table public.inquiries             enable row level security;
alter table public.reports               enable row level security;
alter table public.category_suggestions  enable row level security;
alter table public.profile_views         enable row level security;
alter table public.email_subscribers     enable row level security;
alter table public.subscription_events   enable row level security;

-- Profiles
create policy "Profiles viewable by all"       on public.profiles for select using (true);
create policy "Users update own profile"       on public.profiles for update using (auth.uid() = id);

-- Trainer profiles
create policy "Active trainers viewable by all" on public.trainer_profiles for select
  using (is_active = true or auth.uid() = user_id);
create policy "Trainers insert own profile"    on public.trainer_profiles for insert
  with check (auth.uid() = user_id);
create policy "Trainers update own profile"    on public.trainer_profiles for update
  using (auth.uid() = user_id);

-- Reviews
create policy "Reviews viewable by all"        on public.reviews for select using (true);
create policy "Auth users write reviews"       on public.reviews for insert with check (auth.uid() is not null);
create policy "Trainers respond to reviews"    on public.reviews for update
  using (auth.uid() = (select user_id from public.trainer_profiles where id = trainer_id));
create policy "Users delete own reviews"       on public.reviews for delete using (auth.uid() = reviewer_id);

-- Inquiries
create policy "Trainers view own inquiries"    on public.inquiries for select
  using (auth.uid() = (select user_id from public.trainer_profiles where id = trainer_id));
create policy "Anyone can send inquiries"      on public.inquiries for insert with check (true);

-- Reports
create policy "Anyone can report"              on public.reports for insert with check (true);

-- Suggestions
create policy "Anyone can suggest"             on public.category_suggestions for insert with check (true);

-- Profile views
create policy "Anyone can log view"            on public.profile_views for insert with check (true);
create policy "Trainers see own views"         on public.profile_views for select
  using (auth.uid() = (select user_id from public.trainer_profiles where id = trainer_id));

-- Email subscribers
create policy "Anyone can subscribe"           on public.email_subscribers for insert with check (true);

-- Subscription events (admin only via service role)
create policy "Service role only"              on public.subscription_events for all using (false);

-- ============================================================
-- STORAGE
-- ============================================================
insert into storage.buckets (id, name, public) values ('coach-images','coach-images',true) on conflict do nothing;

create policy "Anyone views coach images"      on storage.objects for select using (bucket_id = 'coach-images');
create policy "Auth users upload coach images" on storage.objects for insert with check (bucket_id = 'coach-images' and auth.uid() is not null);
create policy "Users update own coach images"  on storage.objects for update using (bucket_id = 'coach-images' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users delete own coach images"  on storage.objects for delete using (bucket_id = 'coach-images' and auth.uid()::text = (storage.foldername(name))[1]);
