CREATE TABLE t_p38226403_ads_personal_website.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edit_token UUID NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Яндекс Директ',
  project_name TEXT NOT NULL DEFAULT '',
  date_from DATE,
  date_to DATE,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '5 hours'
);

CREATE TABLE t_p38226403_ads_personal_website.report_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES t_p38226403_ads_personal_website.reports(id),
  position INTEGER NOT NULL DEFAULT 0,
  block_type TEXT NOT NULL DEFAULT 'content',
  heading TEXT NOT NULL DEFAULT '',
  body_text TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_report_blocks_report_id ON t_p38226403_ads_personal_website.report_blocks(report_id);
CREATE INDEX idx_reports_expires_at ON t_p38226403_ads_personal_website.reports(expires_at);