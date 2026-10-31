DELETE FROM idempotency;
DELETE FROM order_items;
DELETE FROM orders;
UPDATE stock SET available=10;
INSERT INTO orders (id,tenant_id,status,total_cents,created_at)
  SELECT 'bench-' || t.id || '-' || lpad(g::text,5,'0'),t.id,
    CASE WHEN g%5=0 THEN 'cancelled' ELSE 'confirmed' END,
    CASE WHEN t.id='aurora' THEN 1500 ELSE 2400 END,
    TIMESTAMPTZ '2026-01-01 00:00:00+00' + g * INTERVAL '1 second'
  FROM tenants t CROSS JOIN generate_series(1,10000) g;
INSERT INTO order_items SELECT id,'prod-'||tenant_id,1,
  CASE WHEN tenant_id='aurora' THEN 1500 ELSE 2400 END FROM orders;
ANALYZE orders;
ANALYZE order_items;
