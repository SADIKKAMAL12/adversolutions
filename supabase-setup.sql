-- ═══════════════════════════════════════════════════════════════
-- AdverSolutions Supabase Setup Script
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ┌─────────────────────────────────────────────────────────────┐
-- │  PAYMENT METHODS TABLE                                      │
-- └─────────────────────────────────────────────────────────────┘

DROP TABLE IF EXISTS payment_methods CASCADE;

CREATE TABLE payment_methods (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  bank_name   TEXT NOT NULL DEFAULT '',
  logo        TEXT DEFAULT '',
  account     TEXT DEFAULT '',
  active      BOOLEAN DEFAULT TRUE,
  fields      JSONB DEFAULT '[]'::jsonb,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default payment methods
INSERT INTO payment_methods (id, name, bank_name, logo, account, active, fields) VALUES
('pm-1', 'Payoneer', 'Payoneer', '💳', 'adver@solution.com', true, '[{"label":"Email","value":"adver@solution.com"}]'::jsonb),
('pm-2', 'Wise', 'Wise', '💳', 'adver@solution.com', true, '[{"label":"Email","value":"adver@solution.com"}]'::jsonb),
('pm-3', 'USDC (TRC20)', 'Tron', '₿', 'TY8c...b3fD', true, '[{"label":"Wallet Address","value":"TY8c...b3fD"}]'::jsonb),
('pm-4', 'Binance', 'Binance', '💰', '456789852', true, '[{"label":"User ID","value":"456789852"}]'::jsonb),
('pm-5', 'Bank Transfer', 'Bank of America', '🏦', 'XXXX XXXX XXXX 1234', true, '[{"label":"Account Number","value":"XXXX XXXX XXXX 1234"},{"label":"SWIFT","value":"BOFAUS3N"}]'::jsonb),
('pm-6', 'Local Moroccan Banks', 'Attijariwafa Bank', '🏦', 'Contact support', true, '[{"label":"RIB","value":"Contact support for details"}]'::jsonb),
('pm-7', 'Other', 'Other', '💳', 'Contact support', true, '[{"label":"Details","value":"Contact support"}]'::jsonb);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active payment methods
CREATE POLICY "Allow public read active" ON payment_methods
  FOR SELECT USING (active = TRUE);

-- Policy: Service role can do everything (bypassed by admin API)
CREATE POLICY "Allow service role full access" ON payment_methods
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ┌─────────────────────────────────────────────────────────────┐
-- │  BUSINESS TYPES TABLE                                       │
-- └─────────────────────────────────────────────────────────────┘

DROP TABLE IF EXISTS business_types CASCADE;

CREATE TABLE business_types (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  TEXT NOT NULL UNIQUE
);

-- Insert default business types
INSERT INTO business_types (name) VALUES
('Marketing Agency'),
('E-Commerce Brand'),
('Freelancer'),
('Startup'),
('Enterprise'),
('Other');

-- Enable RLS
ALTER TABLE business_types ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read business types
CREATE POLICY "Allow public read" ON business_types
  FOR SELECT USING (TRUE);

-- Policy: Service role can do everything
CREATE POLICY "Allow service role full access" ON business_types
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ┌─────────────────────────────────────────────────────────────┐
-- │  VERIFY SETUP                                               │
-- └─────────────────────────────────────────────────────────────┘

SELECT * FROM payment_methods;
SELECT * FROM business_types;
