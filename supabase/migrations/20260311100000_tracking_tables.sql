-- ============================================================================
-- PeopleDown: Cross-site tracking system
-- Tables: pd_sessions, pd_pageviews, pd_leads
-- Functions: pd_track_pageview, pd_track_lead
-- ============================================================================

-- Sessions table
CREATE TABLE public.pd_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL UNIQUE,
  site TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  fbclid TEXT,
  gclid TEXT,
  referrer TEXT,
  landing_page TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pd_sessions_site ON public.pd_sessions(site);
CREATE INDEX idx_pd_sessions_created_at ON public.pd_sessions(created_at);
CREATE INDEX idx_pd_sessions_site_created ON public.pd_sessions(site, created_at);

-- Pageviews table
CREATE TABLE public.pd_pageviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  site TEXT NOT NULL,
  page_url TEXT NOT NULL,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pd_pageviews_session_id ON public.pd_pageviews(session_id);
CREATE INDEX idx_pd_pageviews_site ON public.pd_pageviews(site);
CREATE INDEX idx_pd_pageviews_site_created ON public.pd_pageviews(site, created_at);

-- Leads table (with denormalized UTM from session)
CREATE TABLE public.pd_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT,
  site TEXT NOT NULL,
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  fbclid TEXT,
  gclid TEXT,
  referrer TEXT,
  landing_page TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pd_leads_site ON public.pd_leads(site);
CREATE INDEX idx_pd_leads_email ON public.pd_leads(email);
CREATE INDEX idx_pd_leads_site_created ON public.pd_leads(site, created_at);
CREATE INDEX idx_pd_leads_session_id ON public.pd_leads(session_id);

-- RLS: enable but allow anon inserts only (no reads)
ALTER TABLE public.pd_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pd_pageviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pd_leads ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECURITY DEFINER functions (bypass RLS, called from API routes)
-- ============================================================================

-- Track pageview: upserts session + inserts pageview
CREATE OR REPLACE FUNCTION public.pd_track_pageview(
  p_session_id TEXT,
  p_site TEXT,
  p_page_url TEXT,
  p_referrer TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_utm_source TEXT DEFAULT NULL,
  p_utm_medium TEXT DEFAULT NULL,
  p_utm_campaign TEXT DEFAULT NULL,
  p_utm_content TEXT DEFAULT NULL,
  p_utm_term TEXT DEFAULT NULL,
  p_fbclid TEXT DEFAULT NULL,
  p_gclid TEXT DEFAULT NULL,
  p_landing_page TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Upsert session (create if new, refresh if existing)
  INSERT INTO public.pd_sessions (
    session_id, site, utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    fbclid, gclid, referrer, landing_page, user_agent
  ) VALUES (
    p_session_id, p_site, p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content, p_utm_term,
    p_fbclid, p_gclid, p_referrer, p_landing_page, p_user_agent
  )
  ON CONFLICT (session_id) DO UPDATE SET
    updated_at = NOW(),
    -- Only update UTM if new values are non-null (don't overwrite with null)
    utm_source = COALESCE(EXCLUDED.utm_source, pd_sessions.utm_source),
    utm_medium = COALESCE(EXCLUDED.utm_medium, pd_sessions.utm_medium),
    utm_campaign = COALESCE(EXCLUDED.utm_campaign, pd_sessions.utm_campaign),
    utm_content = COALESCE(EXCLUDED.utm_content, pd_sessions.utm_content),
    utm_term = COALESCE(EXCLUDED.utm_term, pd_sessions.utm_term),
    fbclid = COALESCE(EXCLUDED.fbclid, pd_sessions.fbclid),
    gclid = COALESCE(EXCLUDED.gclid, pd_sessions.gclid);

  -- Insert pageview
  INSERT INTO public.pd_pageviews (session_id, site, page_url, referrer)
  VALUES (p_session_id, p_site, p_page_url, p_referrer);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Track lead: inserts lead with denormalized UTM from session
CREATE OR REPLACE FUNCTION public.pd_track_lead(
  p_session_id TEXT,
  p_site TEXT,
  p_name TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_lead_id UUID;
  v_utm RECORD;
BEGIN
  -- Get UTM data from session (if exists)
  SELECT utm_source, utm_medium, utm_campaign, utm_content, utm_term,
         fbclid, gclid, referrer, landing_page
  INTO v_utm
  FROM public.pd_sessions WHERE session_id = p_session_id;

  -- Insert lead with denormalized attribution
  INSERT INTO public.pd_leads (
    session_id, site, name, email, phone,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    fbclid, gclid, referrer, landing_page
  ) VALUES (
    p_session_id, p_site, p_name, p_email, p_phone,
    v_utm.utm_source, v_utm.utm_medium, v_utm.utm_campaign, v_utm.utm_content, v_utm.utm_term,
    v_utm.fbclid, v_utm.gclid, v_utm.referrer, v_utm.landing_page
  )
  RETURNING id INTO v_lead_id;

  RETURN json_build_object('id', v_lead_id, 'status', 'ok');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
