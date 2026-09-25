-- =============================================
-- Q3 SETUP: schema + sample data from PDF
-- =============================================

DROP TABLE IF EXISTS usage;
DROP TABLE IF EXISTS subscribers;

CREATE TABLE subscribers (
  id               TEXT PRIMARY KEY,   -- SUB01, SUB02, ...
  name             TEXT NOT NULL,
  plan             TEXT NOT NULL,      -- Basic / Premium / Family
  activation_date  TEXT NOT NULL       -- store as YYYY-MM-DD
);

CREATE TABLE usage (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  subscriber_id   TEXT NOT NULL,
  call_minutes    INTEGER NOT NULL,
  sms_count       INTEGER NOT NULL,
  data_usage_mb   INTEGER NOT NULL,
  timestamp       TEXT NOT NULL,
  FOREIGN KEY (subscriber_id) REFERENCES subscribers(id)
);

-- Subscribers reference table (from PDF)
INSERT INTO subscribers (id, name, plan, activation_date) VALUES
  ('SUB01', 'Amir',  'Basic',   '2023-01-12'),
  ('SUB02', 'Sari',  'Premium', '2022-05-03'),
  ('SUB03', 'Budi',  'Basic',   '2024-09-20'),
  ('SUB04', 'Dewi',  'Family',  '2021-02-15'),
  ('SUB05', 'Rian',  'Premium', '2023-08-08'),
  ('SUB06', 'Nia',   'Basic',   '2024-11-30');

-- Usage rows (from PDF sample snapshots)
INSERT INTO usage (subscriber_id, call_minutes, sms_count, data_usage_mb, timestamp) VALUES
  ('SUB01', 40, 10, 1500, '2025-08-01 08:00'),
  ('SUB01', 35,  8, 1200, '2025-08-01 12:00'),
  ('SUB02', 90, 20, 6000, '2025-08-01 08:00'),
  ('SUB02', 85, 18, 5800, '2025-08-01 12:00'),
  ('SUB03', 20,  5,  500, '2025-08-01 08:00'),
  ('SUB04',150, 30, 9000, '2025-08-01 08:00'),
  ('SUB05', 70, 15, 5000, '2025-08-01 08:00'),
  ('SUB06', 25,  6,  700, '2025-08-01 08:00');