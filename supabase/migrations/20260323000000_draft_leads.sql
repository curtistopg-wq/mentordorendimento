-- Draft leads: captures partial form data on field blur (before submit)
-- Allows recovery of leads who filled fields but didn't click submit

CREATE TABLE public.draft_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  source TEXT NOT NULL DEFAULT 'hero-inline-mobile',
  page TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  converted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_draft_leads_session ON public.draft_leads(session_id);
CREATE INDEX idx_draft_leads_email ON public.draft_leads(email);
CREATE INDEX idx_draft_leads_created ON public.draft_leads(created_at);

ALTER TABLE public.draft_leads ENABLE ROW LEVEL SECURITY;

-- Anon can only insert (upsert uses INSERT on conflict, no UPDATE policy needed)
CREATE POLICY "draft_leads_anon_insert"
  ON public.draft_leads FOR INSERT
  TO anon
  WITH CHECK (true);

-- No anon update policy — upsert on session_id handles updates via INSERT conflict
