CREATE TABLE tenants (id text PRIMARY KEY, name text NOT NULL);
CREATE TABLE products (
  id text PRIMARY KEY, tenant_id text NOT NULL REFERENCES tenants(id),
  name text NOT NULL, price_cents integer NOT NULL CHECK (price_cents BETWEEN 1 AND 1000000)
);
CREATE TABLE stock (product_id text PRIMARY KEY REFERENCES products(id), available integer NOT NULL);
-- A ausência de CHECK available >= 0 permite observar a corrida do exercício.
-- A referência usa uma atualização condicional atômica; o gabarito discute defesa no banco.
CREATE TABLE orders (
  id text PRIMARY KEY, tenant_id text NOT NULL REFERENCES tenants(id),
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  total_cents integer NOT NULL CHECK (total_cents >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE order_items (
  order_id text NOT NULL REFERENCES orders(id), product_id text NOT NULL REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 20),
  unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0),
  PRIMARY KEY (order_id, product_id)
);
CREATE TABLE idempotency (
  tenant_id text NOT NULL REFERENCES tenants(id), key text NOT NULL,
  fingerprint text NOT NULL, response jsonb NOT NULL,
  PRIMARY KEY (tenant_id, key)
);
