ALTER TABLE t_p38226403_ads_personal_website.reports
  ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'dark';

ALTER TABLE t_p38226403_ads_personal_website.report_blocks
  ADD COLUMN IF NOT EXISTS image_position TEXT NOT NULL DEFAULT 'right',
  ADD COLUMN IF NOT EXISTS image_crop JSONB;