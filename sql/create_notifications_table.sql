-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'info', 'success', 'warning', 'error'
  link VARCHAR(255), -- Optional link to navigate to
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Add comment to table
COMMENT ON TABLE notifications IS 'Stores user notifications for the application';

-- Add comments to columns
COMMENT ON COLUMN notifications.id IS 'Unique identifier for the notification';
COMMENT ON COLUMN notifications.user_id IS 'ID of the user this notification is for';
COMMENT ON COLUMN notifications.title IS 'Short title of the notification';
COMMENT ON COLUMN notifications.message IS 'Detailed message of the notification';
COMMENT ON COLUMN notifications.type IS 'Type of notification: info, success, warning, error';
COMMENT ON COLUMN notifications.link IS 'Optional URL to navigate to when clicking the notification';
COMMENT ON COLUMN notifications.is_read IS 'Whether the notification has been read';
COMMENT ON COLUMN notifications.created_at IS 'When the notification was created';
COMMENT ON COLUMN notifications.read_at IS 'When the notification was read';
