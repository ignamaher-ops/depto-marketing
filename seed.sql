-- Marketing Hub demo seed. PostgreSQL-ready structure for the next database phase.
CREATE TABLE IF NOT EXISTS workspaces (id SERIAL PRIMARY KEY, name TEXT NOT NULL, business_type TEXT NOT NULL, objective TEXT);
CREATE TABLE IF NOT EXISTS campaigns (id SERIAL PRIMARY KEY, workspace_id INT REFERENCES workspaces(id), name TEXT NOT NULL, spend NUMERIC(12,2) DEFAULT 0, leads INT DEFAULT 0, sales INT DEFAULT 0);
CREATE TABLE IF NOT EXISTS customers (id SERIAL PRIMARY KEY, workspace_id INT REFERENCES workspaces(id), name TEXT NOT NULL, segment TEXT NOT NULL, last_purchase DATE, orders INT DEFAULT 0);

INSERT INTO workspaces (name, business_type, objective)
VALUES ('La Esquina', 'Restaurante', 'Aumentar ventas')
ON CONFLICT DO NOTHING;

-- The first version also ships deterministic API demo data so it runs without a database.
