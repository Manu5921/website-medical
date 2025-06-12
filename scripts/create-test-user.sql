-- Script pour créer un utilisateur test directement dans Supabase
-- À exécuter dans SQL Editor de Supabase

-- 1. D'abord, créer l'utilisateur dans auth.users (remplacez l'email et le mot de passe)
-- Note: Vous devrez créer l'utilisateur via l'interface Supabase ou l'API

-- 2. Une fois l'utilisateur créé, récupérez son ID et créez le profil professionnel
-- Remplacez 'USER_ID_HERE' par l'ID réel de l'utilisateur créé

INSERT INTO professionals (
  id,
  email,
  first_name,
  last_name,
  profession,
  rpps_number,
  phone,
  address,
  city,
  postal_code,
  latitude,
  longitude,
  bio
) VALUES (
  'USER_ID_HERE', -- Remplacez par l'ID de l'utilisateur
  'test@example.com', -- Même email que l'utilisateur auth
  'Test',
  'Utilisateur',
  'medecin',
  '99999999999',
  '0600000000',
  '123 Rue Test',
  'Paris',
  '75001',
  48.8566,
  2.3522,
  'Compte de test pour vérifier le fonctionnement'
);

-- 3. Ajouter des disponibilités pour ce professionnel
INSERT INTO availabilities (professional_id, day_of_week, start_time, end_time) VALUES
  ('USER_ID_HERE', 1, '09:00', '17:00'),
  ('USER_ID_HERE', 2, '09:00', '17:00'),
  ('USER_ID_HERE', 3, '09:00', '17:00'),
  ('USER_ID_HERE', 4, '09:00', '17:00'),
  ('USER_ID_HERE', 5, '09:00', '12:00');