-- Migration to add link to notifications and frequency to settings

-- Add link column to notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT;

-- Add plan_reminder_frequency to notification_settings
-- We use TEXT to store 'monthly', 'quarterly', 'yearly'
ALTER TABLE notification_settings ADD COLUMN IF NOT EXISTS plan_reminder_frequency TEXT DEFAULT 'monthly';

-- If existing plan_reminders is false, we can leave it as is or handle it in app logic.
-- If TRUE, it defaults to 'monthly'.
