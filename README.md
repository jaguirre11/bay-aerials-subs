Bay Aerials Sub Scheduler
A live substitute coach scheduling app for Bay Aerials Gymnastics.
What It Does

Admin posts sub shifts — coaches get real SMS texts instantly
Coaches log in with a personal code and claim open shifts
Admin confirms subs — coach gets a confirmation text
Every confirmed sub gets an automatic 8 AM reminder text the day of their shift
Data persists in a real database — nothing resets on refresh

Tech Stack

Next.js — frontend + API routes
Supabase — database
Twilio — SMS notifications
Vercel — hosting + cron jobs

Environment Variables
Add these in Vercel → Settings → Environment Variables:
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_FROM_NUMBER
ADMIN_PHONE
CRON_SECRET
File Structure
pages/
  index.js          — Main app UI
  api/
    shifts.js       — Get / post / delete shifts
    notify.js       — SMS blast to eligible coaches
    claim.js        — Claim / confirm shifts + SMS
    cron.js         — Daily 8 AM reminder job
lib/
  supabase.js       — Database client
  twilio.js         — SMS client
  coachData.js      — Coach contacts
public/
  logo.png          — Bay Aerials logo
vercel.json         — Cron schedule (8 AM Pacific daily)
package.json
Database Setup (Supabase)
Run this SQL in the Supabase SQL Editor:
sqlcreate table shifts (
  id uuid primary key default gen_random_uuid(),
  instructor_name text not null,
  date date not null,
  day text not null,
  time text not null,
  cls text not null,
  notes text,
  status text default 'open',
  claimed_by_id integer,
  claimed_by_name text,
  reminder_sent boolean default false,
  created_at timestamptz default now()
);

create table sms_log (
  id uuid primary key default gen_random_uuid(),
  to_name text,
  to_phone text,
  to_email text,
  message text,
  shift_id uuid references shifts(id),
  sent_at timestamptz default now()
);

alter table shifts enable row level security;
alter table sms_log enable row level security;

create policy "Public can read shifts"
  on shifts for select using (true);
Cron Reminder Schedule
Runs daily at 8 AM Pacific (4 PM UTC):
json{
  "crons": [{ "path": "/api/cron", "schedule": "0 16 * * *" }]
}
SMS Flow
EventWho gets textedShift postedAll eligible coachesCoach claimsAdmin (Johnny)Admin confirmsSub coach8 AM day-ofSub coach reminder

Bay Aerials Gymnastics — Sub Ops v1.0
