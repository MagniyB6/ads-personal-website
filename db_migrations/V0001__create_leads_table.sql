CREATE TABLE IF NOT EXISTS t_p38226403_ads_personal_website.leads (
  id SERIAL PRIMARY KEY,
  niche TEXT,
  company_info TEXT,
  ads_exp TEXT,
  platform TEXT,
  budget TEXT,
  name TEXT,
  phone TEXT,
  messenger TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);