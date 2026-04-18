# Backend Integration Guide

This document outlines the necessary backend integration points for the SwiftZA Driver App. The frontend is currently configured to use Supabase (PostgreSQL + Realtime + Edge Functions) but can be adapted to any REST/GraphQL API.

## 1. Authentication & User Profile
The app uses Supabase Auth. Ensure the following tables exist:

### `profiles` Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | References `auth.users.id` |
| `role` | text | 'driver' or 'creator' |
| `full_name` | text | User's display name |
| `phone` | text | Verified phone number |
| `vehicle_type` | text | 'Car', 'Bike', 'Van' |
| `wallet_balance` | numeric | Current earnings balance |
| `is_verified` | boolean | KYC status |

## 2. Ride Management API
The `RideService.ts` relies on the following RPCs and Edge Functions:

### `create-ride` (Edge Function)
- **Endpoint:** `POST /functions/v1/create-ride`
- **Body:** `{ type, pickup, dropoff, price, paymentMethod }`
- **Response:** `{ id, status, otp, ... }`
- **Logic:** Calculates price, assigns a ride ID, and broadcasts to nearby drivers.

### `accept_ride` (Postgres RPC)
- **Function:** `accept_ride(ride_id, driver_id)`
- **Logic:** 
  - Checks if ride is still 'SEARCHING'.
  - Updates status to 'ACCEPTED'.
  - Assigns `driver_id`.
  - Returns updated ride object.

### `complete_ride` (Postgres RPC)
- **Function:** `complete_ride(ride_id)`
- **Logic:**
  - Updates status to 'COMPLETED'.
  - Calculates platform fee (e.g., 20%).
  - Transfers 80% of fare to driver's `wallet_balance`.
  - Creates transaction ledger entries.

## 3. Realtime Subscriptions
The app listens for changes on the `rides` table:

- **Drivers:** Listen for `INSERT` where `status = 'SEARCHING'` (New Jobs).
- **Riders:** Listen for `UPDATE` on their specific `ride_id` (Driver Accepted, Arrived, etc.).

## 4. Location Tracking
Drivers broadcast their location via `LocationService.ts`:

### `driver_locations` Table
| Column | Type | Description |
|--------|------|-------------|
| `driver_id` | uuid | Primary Key |
| `lat` | float | Latitude |
| `lng` | float | Longitude |
| `heading` | float | Direction (0-360) |
| `last_updated` | timestamp | For stale check |
| `location` | geography | PostGIS Point for spatial queries |

## 5. Security & Compliance
- **RLS Policies:** Ensure Row Level Security is enabled.
  - Drivers can only see 'SEARCHING' rides or rides they accepted.
  - Riders can only see their own rides.
- **OTP Verification:** The backend should verify the OTP provided by the driver against the one stored in the ride record.

## 6. Deployment Checklist
- [ ] Set up Supabase Project & Database Schema.
- [ ] Deploy Edge Functions (`create-ride`).
- [ ] Create Postgres RPCs (`accept_ride`, `complete_ride`).
- [ ] Enable Realtime for `rides` and `driver_locations`.
- [ ] Configure RLS Policies.
- [ ] Update `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
