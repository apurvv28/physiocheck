-- Add google_refresh_token column to doctors table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'google_refresh_token') THEN
        ALTER TABLE public.doctors ADD COLUMN google_refresh_token TEXT;
    END IF;
END $$;
