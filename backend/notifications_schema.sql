-- Create notifications table if not exists
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL, -- auth_user_id
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications" ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id);
    
-- Allow service role or system to insert (handled by backend usually with service role)
-- But for user-triggered inserts (if any), we need policy. 
-- Creating notification usually via backend function which bypasses RLS if using service key, 
-- or uses authenticated user if triggered by them. 
-- For now, let's allow insert if user=user_id
CREATE POLICY "Users can insert their own notifications" ON public.notifications
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
