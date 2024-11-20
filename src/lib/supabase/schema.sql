-- Drop existing policies first
drop policy if exists "Users can manage their own platform connections" on platform_connections;
drop policy if exists "Users can manage their own scheduled posts" on scheduled_posts;
drop policy if exists "Users can manage their own post platforms" on post_platforms;

-- Create platform_connections table if not exists
create table if not exists platform_connections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  platform_id text not null,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  account_name text,
  account_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, platform_id)
);

-- Enable RLS
alter table platform_connections enable row level security;

-- Allow authenticated users to manage their own connections
create policy "Users can manage their own platform connections"
  on platform_connections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create scheduled_posts table if not exists
create table if not exists scheduled_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  content text,
  media_url text,
  link text,
  scheduled_date timestamptz not null,
  status text not null check (status in ('pending', 'publishing', 'published', 'failed', 'draft')),
  title text,
  description text,
  thumbnail text,
  post_type text not null default 'text',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table scheduled_posts enable row level security;

-- Allow authenticated users to manage their own posts
create policy "Users can manage their own scheduled posts"
  on scheduled_posts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create post_platforms table if not exists
create table if not exists post_platforms (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references scheduled_posts(id) on delete cascade not null,
  platform_id text not null,
  platform_post_id text,
  status text not null default 'pending' check (status in ('pending', 'published', 'failed')),
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table post_platforms enable row level security;

-- Allow authenticated users to manage their own post platforms
create policy "Users can manage their own post platforms"
  on post_platforms for all
  using (
    exists (
      select 1 from scheduled_posts
      where id = post_platforms.post_id
      and user_id = auth.uid()
    )
  );

-- Create or replace function for updating updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Drop existing triggers first
drop trigger if exists update_platform_connections_updated_at on platform_connections;
drop trigger if exists update_scheduled_posts_updated_at on scheduled_posts;
drop trigger if exists update_post_platforms_updated_at on post_platforms;

-- Add triggers for all tables
create trigger update_platform_connections_updated_at
  before update on platform_connections
  for each row
  execute function update_updated_at_column();

create trigger update_scheduled_posts_updated_at
  before update on scheduled_posts
  for each row
  execute function update_updated_at_column();

create trigger update_post_platforms_updated_at
  before update on post_platforms
  for each row
  execute function update_updated_at_column();

-- Refresh the schema cache
notify pgrst, 'reload schema';