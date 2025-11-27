-- Migration to add notification support

-- 1. Create table for storing user notification settings
CREATE TABLE IF NOT EXISTS notification_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_alerts BOOLEAN DEFAULT FALSE,
    weather_alerts BOOLEAN DEFAULT FALSE,
    inventory_alerts TEXT DEFAULT 'none',
    plan_reminders BOOLEAN DEFAULT FALSE,
    shopping_updates BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create table for storing notification history (for the in-app bell)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create index for faster queries on notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- 4. Add link column to notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT;

-- 5. Add min_stock to inventory_items
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 0;

-- 6. Function to handle new user settings
-- (Deprecated version, see Step 9 for final version)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_settings (user_id, email_alerts, inventory_alerts, weather_alerts, plan_reminders, shopping_updates, created_at, updated_at)
  VALUES (NEW.id, false, 'none', false, false, false, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON public.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON public.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Convert remaining alert columns to TEXT for granular control
ALTER TABLE notification_settings ALTER COLUMN weather_alerts TYPE TEXT USING CASE WHEN weather_alerts = true THEN 'both' ELSE 'none' END;
ALTER TABLE notification_settings ALTER COLUMN plan_reminders TYPE TEXT USING CASE WHEN plan_reminders = true THEN 'both' ELSE 'none' END;
ALTER TABLE notification_settings ALTER COLUMN shopping_updates TYPE TEXT USING CASE WHEN shopping_updates = true THEN 'both' ELSE 'none' END;

-- 9. Update trigger again for full text support
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_settings (user_id, email_alerts, inventory_alerts, weather_alerts, plan_reminders, shopping_updates, created_at, updated_at)
  VALUES (NEW.id, false, 'none', 'none', 'none', 'none', NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Add inventory check frequency
ALTER TABLE notification_settings ADD COLUMN IF NOT EXISTS inventory_check_frequency TEXT DEFAULT 'weekly';

-- 11. Update trigger to include default frequency
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_settings (
    user_id, email_alerts, inventory_alerts, weather_alerts, plan_reminders, shopping_updates, inventory_check_frequency, created_at, updated_at
  )
  VALUES (NEW.id, false, 'none', 'none', 'none', 'none', 'weekly', NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
