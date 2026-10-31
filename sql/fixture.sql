INSERT INTO tenants VALUES ('aurora', 'Aurora Papelaria'), ('brisa', 'Brisa Escritório');
INSERT INTO products VALUES
  ('prod-aurora', 'aurora', 'Caderno', 1500),
  ('prod-aurora-2', 'aurora', 'Caneta', 500),
  ('prod-brisa', 'brisa', 'Agenda', 2400),
  ('prod-brisa-2', 'brisa', 'Lápis', 300);
INSERT INTO stock SELECT id, 10 FROM products;
INSERT INTO orders VALUES
  ('hist-aurora-1', 'aurora', 'confirmed', 2000, '2026-01-01T10:00:00Z'),
  ('hist-aurora-2', 'aurora', 'confirmed', 1000, '2026-01-01T11:00:00Z'),
  ('hist-brisa-1', 'brisa', 'confirmed', 2400, '2026-01-01T10:00:00Z');
INSERT INTO order_items VALUES
  ('hist-aurora-1', 'prod-aurora', 1, 1500),
  ('hist-aurora-1', 'prod-aurora-2', 1, 500),
  ('hist-aurora-2', 'prod-aurora-2', 2, 500),
  ('hist-brisa-1', 'prod-brisa', 1, 2400);
