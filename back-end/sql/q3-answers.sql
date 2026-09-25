-- 1) Insert Fajar (Basic, activated 24 January 2024)
INSERT INTO subscribers (id, name, plan, activation_date)
VALUES ('SUB07', 'Fajar', 'Basic', '2024-01-24');

-- 2) Update Fajar's plan to Premium
UPDATE subscribers
SET plan = 'Premium'
WHERE id = 'SUB07';

-- 3) Total data usage for all Premium-plan subscribers
SELECT SUM(u.data_usage_mb) AS total_premium_data_mb
FROM usage AS u
JOIN subscribers AS s ON s.id = u.subscriber_id
WHERE s.plan = 'Premium';

-- 4) Top 3 subscribers by total data usage across all snapshots
SELECT
  u.subscriber_id,
  s.name,
  SUM(u.data_usage_mb) AS total_data_mb
FROM usage AS u
JOIN subscribers AS s ON s.id = u.subscriber_id
GROUP BY u.subscriber_id, s.name
ORDER BY total_data_mb DESC
LIMIT 3;

-- 5) Subquery: subscribers whose average call minutes per snapshot <= 30
SELECT s.id, s.name
FROM subscribers AS s
WHERE s.id IN (
  SELECT subscriber_id
  FROM usage
  GROUP BY subscriber_id
  HAVING AVG(call_minutes) <= 30
);
