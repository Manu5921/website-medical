-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Professionals can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Professionals can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Professionals can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Create custom types
CREATE TYPE profession_type AS ENUM (
  'infirmier',
  'kinesitherapeute', 
  'medecin',
  'sage_femme',
  'psychologue',
  'orthophoniste',
  'ergotherapeute',
  'podologue',
  'dieteticien',
  'osteopathe'
);

CREATE TYPE appointment_status_type AS ENUM (
  'pending',
  'confirmed', 
  'cancelled',
  'completed'
);

-- Professionals table
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  profession profession_type NOT NULL,
  rpps_number TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  patient_first_name TEXT NOT NULL,
  patient_last_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  reason TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30,
  status appointment_status_type NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT different_professionals CHECK (requester_id != provider_id)
);

-- Availabilities table
CREATE TABLE availabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT valid_time_range CHECK (start_time < end_time),
  UNIQUE(professional_id, day_of_week, start_time, end_time)
);

-- Blocked slots table
CREATE TABLE blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT NOT NULL,
  CONSTRAINT valid_datetime_range CHECK (start_datetime < end_datetime)
);

-- Indexes for performance
CREATE INDEX idx_professionals_profession ON professionals(profession);
CREATE INDEX idx_professionals_city ON professionals(city);
CREATE INDEX idx_appointments_requester ON appointments(requester_id);
CREATE INDEX idx_appointments_provider ON appointments(provider_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_availabilities_professional ON availabilities(professional_id);
CREATE INDEX idx_blocked_slots_professional ON blocked_slots(professional_id);

-- Enable Row Level Security
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for professionals
CREATE POLICY "Professionals can view all professionals" ON professionals
  FOR SELECT USING (TRUE);

CREATE POLICY "Professionals can update their own profile" ON professionals
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Allow registration" ON professionals
  FOR INSERT WITH CHECK (TRUE);

-- RLS Policies for appointments
CREATE POLICY "Professionals can view their appointments" ON appointments
  FOR SELECT USING (
    auth.uid()::text = requester_id::text OR 
    auth.uid()::text = provider_id::text
  );

CREATE POLICY "Professionals can create appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid()::text = requester_id::text);

CREATE POLICY "Professionals can update their appointments" ON appointments
  FOR UPDATE USING (
    auth.uid()::text = requester_id::text OR 
    auth.uid()::text = provider_id::text
  );

-- RLS Policies for availabilities
CREATE POLICY "Anyone can view availabilities" ON availabilities
  FOR SELECT USING (TRUE);

CREATE POLICY "Professionals can manage their availabilities" ON availabilities
  FOR ALL USING (auth.uid()::text = professional_id::text);

-- RLS Policies for blocked_slots
CREATE POLICY "Anyone can view blocked slots" ON blocked_slots
  FOR SELECT USING (TRUE);

CREATE POLICY "Professionals can manage their blocked slots" ON blocked_slots
  FOR ALL USING (auth.uid()::text = professional_id::text);

-- Functions for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_professionals_updated_at 
  BEFORE UPDATE ON professionals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
  BEFORE UPDATE ON appointments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to sync auth.users with professionals table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be handled by the application
  -- when user completes registration
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data for testing
INSERT INTO professionals (
  id, email, first_name, last_name, profession, rpps_number, 
  phone, address, city, postal_code, latitude, longitude, bio
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'marie.martin@email.com',
    'Marie',
    'Martin', 
    'infirmier',
    '12345678901',
    '0123456789',
    '123 Rue de la Santé',
    'Paris',
    '75001',
    48.8566,
    2.3522,
    'Infirmière expérimentée spécialisée dans les soins à domicile.'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'pierre.durand@email.com',
    'Pierre',
    'Durand',
    'kinesitherapeute', 
    '12345678902',
    '0123456790',
    '456 Avenue du Sport',
    'Lyon',
    '69001',
    45.7640,
    4.8357,
    'Kinésithérapeute spécialisé dans la rééducation orthopédique.'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'sophie.bernard@email.com',
    'Sophie',
    'Bernard',
    'medecin',
    '12345678903', 
    '0123456791',
    '789 Boulevard de la Médecine',
    'Marseille',
    '13001',
    43.2965,
    5.3698,
    'Médecin généraliste avec 15 ans d''expérience.'
  );

-- Sample availabilities
INSERT INTO availabilities (professional_id, day_of_week, start_time, end_time) VALUES
  ('00000000-0000-0000-0000-000000000001', 1, '09:00', '17:00'), -- Lundi
  ('00000000-0000-0000-0000-000000000001', 2, '09:00', '17:00'), -- Mardi
  ('00000000-0000-0000-0000-000000000001', 3, '09:00', '17:00'), -- Mercredi
  ('00000000-0000-0000-0000-000000000001', 4, '09:00', '17:00'), -- Jeudi
  ('00000000-0000-0000-0000-000000000001', 5, '09:00', '12:00'), -- Vendredi matin
  ('00000000-0000-0000-0000-000000000002', 1, '08:00', '18:00'), -- Lundi
  ('00000000-0000-0000-0000-000000000002', 2, '08:00', '18:00'), -- Mardi
  ('00000000-0000-0000-0000-000000000002', 3, '08:00', '18:00'), -- Mercredi
  ('00000000-0000-0000-0000-000000000002', 4, '08:00', '18:00'), -- Jeudi
  ('00000000-0000-0000-0000-000000000002', 5, '08:00', '16:00'); -- Vendredi