-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL, 
    recipient_id UUID NOT NULL,
    content TEXT,
    attachment_url TEXT,
    attachment_type TEXT, -- 'image', 'file', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sender_role TEXT NOT NULL, -- 'doctor' or 'patient'
    recipient_role TEXT NOT NULL -- 'doctor' or 'patient'
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see messages sent by them or sent to them
CREATE POLICY "Users can view their own messages" ON public.messages
    FOR SELECT
    USING (
        auth.uid() IN (sender_id, recipient_id)
    );

-- Policy: Users can insert messages where they are the sender
CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
    );

-- Create storage bucket for chat attachments if it doesn't exist (conceptual, usually done via UI or specialized API)
-- insert into storage.buckets (id, name) values ('chat-attachments', 'chat-attachments');
