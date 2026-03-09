-- Add tracking/attribution columns to existing leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ga_client_id VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ga_session_id VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS fbc VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS fbp VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS fbclid VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_content VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_term VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS landing_page TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS referrer TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS clarity_session_url TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);

-- WhatsApp clicks tracking table
CREATE TABLE IF NOT EXISTS whatsapp_clicks (
  id SERIAL PRIMARY KEY,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ga_client_id VARCHAR(50),
  ga_session_id VARCHAR(50),
  fbc VARCHAR(255),
  fbp VARCHAR(100),
  fbclid VARCHAR(255),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(255),
  landing_page TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address VARCHAR(45),
  whatsapp_number VARCHAR(20),
  page_section VARCHAR(50)
);

-- Enable RLS on whatsapp_clicks
ALTER TABLE whatsapp_clicks ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (same pattern as leads)
CREATE POLICY "Allow anonymous inserts on whatsapp_clicks"
  ON whatsapp_clicks FOR INSERT
  TO anon
  WITH CHECK (true);
