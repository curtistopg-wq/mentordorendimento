-- Add follow-up email tracking columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS followup_stage INTEGER NOT NULL DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_followup_at TIMESTAMPTZ;

-- Index for cron job queries
CREATE INDEX IF NOT EXISTS idx_leads_followup_stage ON leads(followup_stage) WHERE followup_stage < 3;
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Function: get leads that need a follow-up email (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_followup_leads()
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  phone TEXT,
  followup_stage INTEGER,
  created_at TIMESTAMPTZ
) AS $$
  SELECT l.id, l.email, l.name, l.phone, l.followup_stage, l.created_at
  FROM leads l
  WHERE l.followup_stage < 3
    AND (
      -- Stage 0 → 1: send 1h after creation
      (l.followup_stage = 0 AND l.created_at < NOW() - INTERVAL '1 hour')
      OR
      -- Stage 1 → 2: send 24h after last follow-up
      (l.followup_stage = 1 AND l.last_followup_at < NOW() - INTERVAL '24 hours')
      OR
      -- Stage 2 → 3: send 72h after last follow-up
      (l.followup_stage = 2 AND l.last_followup_at < NOW() - INTERVAL '72 hours')
    )
  ORDER BY l.created_at ASC
  LIMIT 50;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Function: mark a lead's follow-up as sent
CREATE OR REPLACE FUNCTION public.mark_followup_sent(lead_id UUID, new_stage INTEGER)
RETURNS VOID AS $$
  UPDATE leads
  SET followup_stage = new_stage,
      last_followup_at = NOW()
  WHERE id = lead_id;
$$ LANGUAGE SQL SECURITY DEFINER;
