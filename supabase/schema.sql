
-- Enable PostGIS for Geolocation
create extension if not exists postgis;
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Supabase Auth)
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  phone text,
  role text check (role in ('RIDER', 'DRIVER', 'ADMIN')),
  vehicle_type text, -- 'Motorbike', 'Car', 'Bakkie'
  wallet_balance numeric default 0.00,
  is_verified boolean default false,
  fcm_token text,
  rating numeric default 5.0,
  
  -- NEW: Compliance & Onboarding Data (Stored as JSONB for flexibility)
  address_data jsonb,
  banking_data jsonb,
  compliance_data jsonb,
  documents_data jsonb,
  
  -- SA COMPLIANCE FIELDS
  prdp_expiry date,
  compliance_status text default 'PENDING' check (compliance_status in ('PENDING', 'APPROVED', 'EXPIRING_SOON', 'SUSPENDED', 'REJECTED')),
  operating_license_no text,
  virtual_card_id text, -- For JIT Funding (e.g., Root or Stripe Issuing Card ID)
  
  -- CREATOR SUBSCRIPTION FIELDS
  subscription_tier text default 'NONE' check (subscription_tier in ('NONE', 'CREATOR_6')),
  errand_credits_remaining integer default 0,
  subscription_renewal_date timestamptz,
  
  created_at timestamptz default now()
);

-- 1.1 VEHICLES (Mandatory for E-hailing Operating Licences)
create table if not exists vehicles (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id) not null,
  make text not null,
  model text not null,
  year text,
  plate text not null unique,
  type text check (type in ('Car', 'Motorbike', 'Truck')),
  status text default 'PENDING',
  disc_expiry date,
  license_disk_url text,
  operating_license_no text, -- The vehicle-specific permit
  created_at timestamptz default now()
);

-- MIGRATION: Add KYC columns if they don't exist
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'kyc_session_id') then
    alter table profiles add column kyc_session_id text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'kyc_status') then
    alter table profiles add column kyc_status text DEFAULT 'PENDING';
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'kyc_rejection_reason') then
    alter table profiles add column kyc_rejection_reason text;
  end if;

  -- SA Compliance Migrations
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'prdp_expiry') then
    alter table profiles add column prdp_expiry date;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'compliance_status') then
    alter table profiles add column compliance_status text DEFAULT 'PENDING';
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'operating_license_no') then
    alter table profiles add column operating_license_no text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'virtual_card_id') then
    alter table profiles add column virtual_card_id text;
  end if;

  -- Creator Subscription Migrations
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'subscription_tier') then
    alter table profiles add column subscription_tier text DEFAULT 'NONE';
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'errand_credits_remaining') then
    alter table profiles add column errand_credits_remaining integer DEFAULT 0;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'subscription_renewal_date') then
    alter table profiles add column subscription_renewal_date timestamptz;
  end if;
end $$;

-- 1b. VIRTUAL CARDS (For Shopping Errands)
create table if not exists virtual_cards (
  id uuid default uuid_generate_v4() primary key,
  driver_id uuid references profiles(id) not null,
  ride_id uuid references rides(id), -- The specific errand this card is active for
  card_pan_encrypted text not null, -- Store only encrypted PAN or token
  card_cvv_encrypted text,
  expiry_date text,
  balance_limit numeric default 0,
  status text default 'INACTIVE', -- 'ACTIVE', 'INACTIVE', 'BLOCKED'
  merchant_category_lock text, -- e.g., 'GROCERY', 'PHARMACY'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS for virtual_cards
alter table virtual_cards enable row level security;

drop policy if exists "Drivers view own cards" on virtual_cards;
create policy "Drivers view own cards" on virtual_cards for select using (auth.uid() = driver_id);

-- 2. DRIVER LOCATIONS (Real-time Tracking)
create table if not exists driver_locations (
  driver_id uuid references profiles(id) primary key,
  lat float,
  lng float,
  heading float,
  last_updated timestamptz default now(),
  location geography(POINT) -- For geospatial queries
);

-- Create a spatial index for faster queries
create index if not exists driver_locations_geo_index on driver_locations using GIST (location);

-- POSTGIS DISPATCH FUNCTION
create or replace function find_nearby_drivers(
  pickup_lat float,
  pickup_lng float,
  search_radius_meters float,
  required_vehicle_type text default null
)
returns table (
  driver_id uuid,
  distance_meters float,
  vehicle_type text,
  rating numeric
)
language plpgsql
security definer
as $$
begin
  return query
  select
    dl.driver_id,
    ST_Distance(dl.location, ST_SetSRID(ST_MakePoint(pickup_lng, pickup_lat), 4326)::geography) as distance_meters,
    p.vehicle_type,
    p.rating
  from
    driver_locations dl
  join
    profiles p on dl.driver_id = p.id
  where
    -- 1. Must be within the radius
    ST_DWithin(dl.location, ST_SetSRID(ST_MakePoint(pickup_lng, pickup_lat), 4326)::geography, search_radius_meters)
    -- 2. Must be a DRIVER
    and p.role = 'DRIVER'
    -- 3. Must match vehicle type (if specified)
    and (required_vehicle_type is null or p.vehicle_type = required_vehicle_type)
    -- 4. Must be active (location updated in last 15 mins)
    and dl.last_updated > now() - interval '15 minutes'
  order by
    distance_meters asc
  limit 10;
end;
$$;

-- 3. RIDES
create table if not exists rides (
  id uuid default uuid_generate_v4() primary key,
  rider_id uuid references profiles(id),
  driver_id uuid references profiles(id),
  pickup_address text,
  pickup_lat float,
  pickup_lng float,
  dropoff_address text,
  dropoff_lat float,
  dropoff_lng float,
  type text, -- 'ride' or 'errand'
  status text, -- 'SEARCHING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
  price numeric,
  payment_method text,
  payment_status text default 'PENDING',
  errand_details jsonb,
  created_at timestamptz default now()
);

-- MIGRATION: Add OTP if missing
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'rides' and column_name = 'otp') then
    alter table rides add column otp text;
  end if;
end $$;

-- 4. LEDGER (Financial Truth)
create table if not exists ledger (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id),
  ride_id uuid references rides(id),
  amount numeric not null, -- Negative for debits, Positive for credits
  type text, -- 'TRIP_EARNING', 'COMMISSION_OWED', 'PAYOUT', 'TOPUP'
  description text,
  created_at timestamptz default now()
);

-- RLS POLICIES (Security)
-- We drop existing policies first to avoid "policy already exists" errors during updates
alter table profiles enable row level security;
alter table driver_locations enable row level security;
alter table rides enable row level security;
alter table ledger enable row level security;

drop policy if exists "Public profiles" on profiles;
create policy "Public profiles" on profiles for select using (true);

drop policy if exists "Users update own profile" on profiles;
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

drop policy if exists "Users insert own profile" on profiles;
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);

drop policy if exists "Read locations" on driver_locations;
create policy "Read locations" on driver_locations for select using (true);

drop policy if exists "Update own location" on driver_locations;
create policy "Update own location" on driver_locations for all using (auth.uid() = driver_id);

drop policy if exists "Ride visibility" on rides;
create policy "Ride visibility" on rides for all using (
  auth.uid() = rider_id or auth.uid() = driver_id or status = 'SEARCHING'
);

drop policy if exists "View own ledger" on ledger;
create policy "View own ledger" on ledger for select using (auth.uid() = profile_id);


-- 5. DRIVER DOCUMENTS (Compliance)
create table if not exists driver_documents (
  id uuid default uuid_generate_v4() primary key,
  driver_id uuid references profiles(id) not null,
  type text not null, -- 'LICENSE', 'PRDP', 'VEHICLE_COF', 'INSURANCE', 'CRIMINAL_CHECK'
  status text default 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'
  document_url text,
  expiry_date date,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. EMERGENCY CONTACTS
create table if not exists emergency_contacts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  name text not null,
  phone text not null,
  relationship text,
  created_at timestamptz default now()
);

-- 7. INCIDENTS (Panic Button Logs)
create table if not exists incidents (
  id uuid default uuid_generate_v4() primary key,
  ride_id uuid references rides(id),
  reporter_id uuid references profiles(id),
  type text not null, -- 'PANIC', 'ACCIDENT', 'HARASSMENT', 'OTHER'
  lat float,
  lng float,
  description text,
  resolved boolean default false,
  created_at timestamptz default now()
);

-- 8. DISPUTES
create table if not exists disputes (
  id uuid default uuid_generate_v4() primary key,
  ride_id uuid references rides(id),
  reporter_id uuid references profiles(id),
  reason text not null,
  description text,
  evidence_url text,
  status text default 'PENDING' check (status in ('PENDING', 'RESOLVED', 'REJECTED')),
  resolution_type text check (resolution_type in ('REFUND', 'CREDIT', 'NONE')),
  admin_notes text,
  created_at timestamptz default now()
);

-- RLS POLICIES FOR NEW TABLES

alter table driver_documents enable row level security;
alter table emergency_contacts enable row level security;
alter table incidents enable row level security;
alter table disputes enable row level security;

-- Documents
drop policy if exists "Drivers view own docs" on driver_documents;
create policy "Drivers view own docs" on driver_documents for select using (auth.uid() = driver_id);

drop policy if exists "Drivers upload own docs" on driver_documents;
create policy "Drivers upload own docs" on driver_documents for insert with check (auth.uid() = driver_id);

-- Emergency Contacts
drop policy if exists "Users view own contacts" on emergency_contacts;
create policy "Users view own contacts" on emergency_contacts for select using (auth.uid() = user_id);

drop policy if exists "Users manage own contacts" on emergency_contacts;
create policy "Users manage own contacts" on emergency_contacts for all using (auth.uid() = user_id);

-- Incidents
drop policy if exists "Users can report incidents" on incidents;
create policy "Users can report incidents" on incidents for insert with check (auth.uid() = reporter_id);

drop policy if exists "Admins view all incidents" on incidents;
create policy "Admins view all incidents" on incidents for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
);

-- Disputes
drop policy if exists "Users can report disputes" on disputes;
create policy "Users can report disputes" on disputes for insert with check (auth.uid() = reporter_id);

drop policy if exists "Users view own disputes" on disputes;
create policy "Users view own disputes" on disputes for select using (auth.uid() = reporter_id);

drop policy if exists "Admins manage disputes" on disputes;
create policy "Admins manage disputes" on disputes for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
);


-- A. Complete Ride & Financial Settlement
create or replace function complete_ride(ride_id_input uuid)
returns void as $$
declare
  v_ride record;
  v_commission numeric;
  v_earnings numeric;
begin
  -- 1. Get Ride Data
  select * into v_ride from rides where id = ride_id_input;
  
  if v_ride.status = 'COMPLETED' then
    raise exception 'Ride already completed';
  end if;

  -- 2. Calculate 80/20 Split
  v_commission := v_ride.price * 0.20;
  v_earnings := v_ride.price * 0.80;

  -- 3. Update Ride Status
  update rides set status = 'COMPLETED' where id = ride_id_input;

  -- 4. Financial Logic
  if v_ride.payment_method = 'CASH' then
    -- Driver has Cash (100%). We debit 20% from wallet.
    insert into ledger (profile_id, ride_id, amount, description, type)
    values (v_ride.driver_id, ride_id_input, -v_commission, 'Commission Fee (Cash Trip)', 'COMMISSION_OWED');

    update profiles set wallet_balance = wallet_balance - v_commission where id = v_ride.driver_id;

  else -- CARD / PAYSTACK
    -- We hold funds (100%). We credit 80% to driver.
    insert into ledger (profile_id, ride_id, amount, description, type)
    values (v_ride.driver_id, ride_id_input, v_earnings, 'Trip Earnings (Card)', 'TRIP_EARNING');

    update profiles set wallet_balance = wallet_balance + v_earnings where id = v_ride.driver_id;
  end if;

end;
$$ language plpgsql security definer;

-- C. Resolve Dispute & Refund Logic
create or replace function resolve_dispute(dispute_id_input uuid, resolution text, notes text)
returns void as $$
declare
  v_dispute record;
  v_ride record;
  v_earnings numeric;
begin
  -- 1. Get Dispute & Ride Data
  select * into v_dispute from disputes where id = dispute_id_input;
  select * into v_ride from rides where id = v_dispute.ride_id;
  
  if v_dispute.status = 'RESOLVED' then
    raise exception 'Dispute already resolved';
  end if;

  -- 2. Update Dispute
  update disputes set 
    status = 'RESOLVED', 
    resolution_type = resolution,
    admin_notes = notes
  where id = dispute_id_input;

  -- 3. Financial Reversal if REFUND
  if resolution = 'REFUND' then
    v_earnings := v_ride.price * 0.80;

    -- Debit Driver (Reverse the earnings)
    insert into ledger (profile_id, ride_id, amount, description, type)
    values (v_ride.driver_id, v_ride.id, -v_earnings, 'Dispute Refund (Earnings Reversal)', 'ADJUSTMENT');

    update profiles set wallet_balance = wallet_balance - v_earnings where id = v_ride.driver_id;

    -- Note: Paystack refund would be triggered via Edge Function, 
    -- but we log the intent here.
  end if;

end;
$$ language plpgsql security definer;
-- FIX: Drop old function signatures to allow parameter renaming
DROP FUNCTION IF EXISTS get_nearby_drivers(float, float, float);
DROP FUNCTION IF EXISTS get_nearby_drivers(double precision, double precision, double precision);

create or replace function get_nearby_drivers(input_lat float, input_lng float, radius_meters float)
returns table (id uuid, lat float, lng float, dist_meters float) as $$
begin
  return query
  select 
    dl.driver_id as id,
    dl.lat,
    dl.lng,
    st_distance(dl.location, st_point(input_lng, input_lat)::geography) as dist_meters
  from driver_locations dl
  where st_dwithin(dl.location, st_point(input_lng, input_lat)::geography, radius_meters);
end;
$$ language plpgsql;
