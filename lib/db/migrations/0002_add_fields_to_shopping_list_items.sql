-- Add new columns to the shopping_list_items table
ALTER TABLE shopping_list_items
ADD COLUMN inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
ADD COLUMN category TEXT,
ADD COLUMN estimated_cost NUMERIC(10, 2),
ADD COLUMN preferred_store TEXT;
