-- Add new columns to the inventory_items table
ALTER TABLE inventory_items
ADD COLUMN category TEXT,
ADD COLUMN location TEXT,
ADD COLUMN min_stock INTEGER,
ADD COLUMN cost_per_unit NUMERIC(10, 2),
ADD COLUMN purchase_date DATE,
ADD COLUMN calories INTEGER,
ADD COLUMN supplier TEXT,
ADD COLUMN upc TEXT,
ADD COLUMN image TEXT;
