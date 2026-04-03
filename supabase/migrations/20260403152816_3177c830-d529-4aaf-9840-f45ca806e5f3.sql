
-- Table for uploaded states (SMS numbers or emails per state)
CREATE TABLE public.blaster_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'email')),
  state_name TEXT NOT NULL,
  numbers TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, channel, state_name)
);

-- Table for tracking which batches have been sent
CREATE TABLE public.blaster_sent_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'email')),
  state_name TEXT NOT NULL,
  batch_idx INTEGER NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, channel, state_name, batch_idx)
);

-- Table for user preferences
CREATE TABLE public.blaster_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  is_dark BOOLEAN NOT NULL DEFAULT true,
  last_channel TEXT NOT NULL DEFAULT 'sms' CHECK (last_channel IN ('sms', 'email')),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blaster_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blaster_sent_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blaster_settings ENABLE ROW LEVEL SECURITY;

-- RLS: users can only access their own data
CREATE POLICY "Users manage own states" ON public.blaster_states FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own sent batches" ON public.blaster_sent_batches FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own settings" ON public.blaster_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_blaster_states_updated_at BEFORE UPDATE ON public.blaster_states FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blaster_settings_updated_at BEFORE UPDATE ON public.blaster_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
