# DEVBOOK - HealthConnect Pro

## 📋 Table des matières
1. [Vue d'ensemble du projet](#vue-densemble-du-projet)
2. [Prompt de base](#prompt-de-base)
3. [Spécifications techniques](#spécifications-techniques)
4. [État d'avancement détaillé](#état-davancement-détaillé)
5. [Guide pour les agents IA](#guide-pour-les-agents-ia)
6. [Conventions de code](#conventions-de-code)
7. [Architecture du projet](#architecture-du-projet)
8. [Prochaines étapes prioritaires](#prochaines-étapes-prioritaires)

## 🎯 Vue d'ensemble du projet

**HealthConnect Pro** est une plateforme web B2B permettant aux professionnels de santé de prendre des rendez-vous entre eux pour leurs patients. Par exemple, une infirmière peut rechercher et prendre rendez-vous avec un kinésithérapeute pour son patient.

### Points clés
- 🏥 Plateforme exclusivement B2B (entre professionnels)
- 🚫 Pas de patients particuliers
- 💻 Pas de téléconsultation
- 🎨 Design moderne et professionnel
- 📱 Interface responsive (PC et mobile)

## 📝 Prompt de base

```
Plateforme de RDV entre Professionnels de Santé

Contexte du projet
Je souhaite créer une plateforme web complète permettant aux professionnels de santé de prendre des rendez-vous entre eux pour leurs patients. Par exemple, une infirmière qui a besoin de soins de kinésithérapie pour son patient peut rechercher un kinésithérapeute disponible et prendre directement rendez-vous.

Points importants :
- Plateforme exclusivement B2B (entre professionnels)
- Pas de patients particuliers
- Pas de téléconsultation
- Design moderne et professionnel
- Interface responsive (PC et mobile)
```

## 🛠 Spécifications techniques

### Stack obligatoire
| Technologie | Version | Utilisation |
|------------|---------|-------------|
| **Next.js** | 15.3 | Framework React avec App Router |
| **TypeScript** | 5+ | Typage strict sur tout le projet |
| **Tailwind CSS** | 4 | Styling et design system |
| **Supabase** | - | PostgreSQL + Auth + Storage |
| **React Hook Form** | 7.57+ | Gestion des formulaires |
| **Zod** | 3.25+ | Validation des données |
| **Shadcn/ui** | - | Composants UI avec Radix UI |
| **Lucide React** | - | Icônes |
| **Vercel** | - | Déploiement |

### APIs prévues
- **Google Maps API** : Géolocalisation et cartes
- **API de validation RPPS** : Vérification des numéros RPPS (simulée en MVP)

### Structure de la base de données

#### Tables principales

1. **professionals**
   ```sql
   - id (UUID, PK)
   - email (TEXT, UNIQUE)
   - first_name, last_name (TEXT)
   - profession (ENUM)
   - rpps_number (TEXT, UNIQUE)
   - phone, address, city, postal_code (TEXT)
   - latitude, longitude (DECIMAL)
   - bio (TEXT)
   - avatar_url (TEXT)
   - created_at, updated_at (TIMESTAMP)
   ```

2. **appointments**
   ```sql
   - id (UUID, PK)
   - requester_id, provider_id (UUID, FK)
   - patient_first_name, patient_last_name, patient_phone (TEXT)
   - reason (TEXT)
   - appointment_date (DATE)
   - appointment_time (TIME)
   - duration (INTEGER)
   - status (ENUM: pending, confirmed, cancelled, completed)
   - notes (TEXT)
   - created_at, updated_at (TIMESTAMP)
   ```

3. **availabilities**
   ```sql
   - id (UUID, PK)
   - professional_id (UUID, FK)
   - day_of_week (INTEGER 0-6)
   - start_time, end_time (TIME)
   - is_active (BOOLEAN)
   ```

4. **blocked_slots**
   ```sql
   - id (UUID, PK)
   - professional_id (UUID, FK)
   - start_datetime, end_datetime (TIMESTAMP)
   - reason (TEXT)
   ```

## 📊 État d'avancement détaillé

### ✅ Fonctionnalités implémentées

#### 1. Infrastructure de base
- [x] Projet Next.js 15.3 avec App Router configuré
- [x] TypeScript avec configuration stricte
- [x] Tailwind CSS 4 installé et configuré
- [x] ESLint configuré
- [x] Structure de dossiers complète

#### 2. Base de données Supabase
- [x] Schéma SQL complet avec 4 tables
- [x] Types et énumérations PostgreSQL
- [x] Indexes pour optimisation
- [x] Triggers pour `updated_at` automatique
- [x] Row Level Security (RLS) sur toutes les tables
- [x] Politiques RLS définies
- [x] Données de test incluses
- [x] Configuration du bucket de storage pour avatars

#### 3. Authentification
- [x] Configuration Supabase Auth (client + serveur)
- [x] Page de connexion fonctionnelle (`/login`)
- [x] Page d'inscription avec validation RPPS (`/register`)
- [x] Middleware de protection des routes
- [x] Gestion des sessions avec refresh automatique
- [x] Déconnexion dans la navbar

#### 4. Interface utilisateur
- [x] Layout principal avec navbar et sidebar
- [x] Composants UI de base (Button, Input, Card, etc.)
- [x] Design system avec couleurs médicales
- [x] Navigation responsive
- [x] Pages d'accueil et dashboard

#### 5. Gestion du profil
- [x] Page de profil complète (`/profile`)
- [x] Formulaire de modification avec validation
- [x] Upload/suppression de photo de profil
- [x] Gestion des disponibilités hebdomadaires
- [x] Composant `AvatarUpload`
- [x] Composant `AvailabilitySettings`

#### 6. API REST complète
- [x] **`GET /api/professionals`** - Recherche avec filtres
  - [x] Filtres par profession, ville, code postal
  - [x] Recherche textuelle (nom, prénom, bio)
  - [x] Géolocalisation avec calcul de distance
  - [x] Pagination
- [x] **`GET /api/professionals/[id]`** - Détail professionnel
  - [x] Informations complètes + disponibilités
  - [x] Créneaux bloqués
  - [x] Statistiques de base
- [x] **`PUT /api/professionals/[id]`** - Mise à jour profil
- [x] **`DELETE /api/professionals/[id]`** - Suppression compte
- [x] **`GET/PUT /api/professionals/[id]/availabilities`** - Gestion disponibilités
- [x] **`GET/POST/DELETE /api/professionals/[id]/blocked-slots`** - Créneaux bloqués

#### 7. Hooks personnalisés
- [x] `useProfessionals` - Recherche et pagination
- [x] `useProfessional` - Détail d'un professionnel
- [x] `useAvailabilities` - Gestion des disponibilités
- [x] Gestion d'erreurs centralisée
- [x] Types TypeScript stricts

#### 8. Composants de test
- [x] `ProfessionalsTestCard` - Interface de test des APIs

#### 9. Pages annuaire
- [x] **Page annuaire** (`/professionals`)
  - [x] Interface de recherche avec filtres avancés
  - [x] Vue liste et grille responsive
  - [x] Pagination avec chargement progressif
  - [x] Filtres par profession, ville, recherche textuelle
  - [x] Navigation vers les profils détaillés
- [x] **Page détail professionnel** (`/professionals/[id]`)
  - [x] Profil complet avec avatar et informations
  - [x] Horaires de disponibilité
  - [x] Actions rapides (appel, email, carte)
  - [x] Design responsive et professionnel

#### 10. Données de test
- [x] 12 professionnels fictifs avec données réalistes
- [x] Fonction de filtrage avec simulation d'API
- [x] Labels des professions harmonisés

### 🔄 Fonctionnalités en cours
- [ ] Intégration Google Maps
- [ ] API des rendez-vous

### ❌ Fonctionnalités à implémenter

#### Phase 1 : Fonctionnalités essentielles
- [ ] **Récupération de mot de passe** (`/forgot-password`)
- [ ] **Vérification d'email** après inscription
- [ ] **API Routes**
  - [x] `/api/professionals` - CRUD des professionnels ✅
  - [ ] `/api/appointments` - Gestion des RDV
- [x] **Annuaire des professionnels** (`/professionals`) ✅
- [x] **Page détail professionnel** (`/professionals/[id]`) ✅
- [ ] **Système de prise de RDV**
  - [ ] Calendrier interactif
  - [ ] Sélection de créneaux
  - [ ] Formulaire patient
- [ ] **Gestion des RDV** (`/appointments`)
  - [ ] Liste des demandes envoyées/reçues
  - [ ] Actions (confirmer, annuler)
  - [ ] Export calendrier

#### Phase 2 : Fonctionnalités avancées
- [ ] **Notifications**
  - [ ] Email pour nouveaux RDV
  - [ ] Notifications in-app
- [ ] **Statistiques dashboard**
- [ ] **Gestion des indisponibilités**
- [ ] **Intégration complète Google Maps**
  - [ ] Autocomplete adresse
  - [ ] Géocodage automatique
  - [ ] Calcul de distances
  - [ ] Itinéraires

#### Phase 3 : Fonctionnalités futures
- [ ] Messagerie interne
- [ ] Synchronisation Google Calendar
- [ ] API publique
- [ ] Application mobile
- [ ] Gestion de documents

## 🤖 Guide pour les agents IA

### Informations essentielles

1. **État actuel** : L'authentification et la gestion de profil sont fonctionnelles. Le projet compile sans erreur.

2. **Configuration requise** :
   - Créer `.env.local` avec les clés Supabase
   - Exécuter le schéma SQL dans Supabase
   - Le bucket 'avatars' doit être public

3. **Commandes utiles** :
   ```bash
   npm run dev     # Développement
   npm run build   # Build production
   npm run lint    # Vérification du code
   ```

4. **Points d'attention** :
   - Toujours utiliser TypeScript strict
   - Suivre les conventions de code existantes
   - Utiliser les composants Shadcn/ui existants
   - Implémenter la gestion d'erreurs
   - Penser mobile-first

### Prochaine tâche recommandée

**Créer l'API des rendez-vous** (`/api/appointments`) avec :
- CRUD complet des rendez-vous
- Validation des créneaux et disponibilités
- Notifications email automatiques
- Gestion des statuts (pending, confirmed, cancelled, completed)
- Intégration avec le calendrier des professionnels

**Alternative** : **Intégrer Google Maps** pour :
- Géolocalisation des professionnels
- Recherche par distance
- Affichage sur carte interactive
- Itinéraires vers les cabinets

## 📐 Conventions de code

### TypeScript
```typescript
// Toujours typer explicitement
interface Props {
  title: string
  onClick: () => void
}

// Utiliser les types du projet
import { Professional, Appointment } from '@/types'
```

### Composants React
```typescript
'use client' // Si nécessaire

import { useState } from 'react'
// Imports organisés : React, bibliothèques, composants, utils, types

export function ComponentName({ prop }: Props) {
  // Hooks en premier
  // Logique
  // Return JSX
}
```

### Gestion d'erreurs
```typescript
try {
  // Code
} catch (error) {
  setError(error instanceof Error ? error.message : 'Une erreur est survenue')
}
```

### Formulaires
- Toujours utiliser React Hook Form + Zod
- Validation côté client ET serveur
- Messages d'erreur en français

## 🏗 Architecture du projet

```
healthcare-booking/
├── src/
│   ├── app/                    # Pages et routes Next.js
│   │   ├── (auth)/            # Routes publiques
│   │   ├── (dashboard)/       # Routes protégées
│   │   └── api/               # API Routes
│   ├── components/            
│   │   ├── ui/                # Composants réutilisables
│   │   ├── auth/              # Composants d'auth
│   │   ├── layout/            # Layout (navbar, sidebar)
│   │   └── professionals/     # Composants métier
│   ├── lib/
│   │   └── supabase/          # Config Supabase
│   ├── types/                 # Types TypeScript
│   └── hooks/                 # Hooks personnalisés
├── supabase/
│   └── schema.sql             # Structure BDD
└── public/                    # Assets statiques
```

## 🎯 Prochaines étapes prioritaires

1. **Créer le fichier `.env.local`** avec les vraies clés Supabase
2. **Implémenter l'API des professionnels** (`/api/professionals`)
3. **Créer la page annuaire** avec recherche et filtres
4. **Intégrer Google Maps** pour la géolocalisation
5. **Implémenter le système de prise de RDV**

## 📝 Notes pour le développement

- Le projet utilise le nouveau App Router de Next.js 15
- Préférer les Server Components quand possible
- Utiliser `'use client'` uniquement si nécessaire
- Les images de profil sont stockées dans Supabase Storage
- La validation RPPS est simulée pour le MVP
- Toujours penser à l'expérience mobile

## 🔐 Sécurité

- RLS activé sur toutes les tables
- Middleware pour protéger les routes `/dashboard`
- Validation des données côté client et serveur
- Pas de données sensibles dans le code
- Variables d'environnement pour les secrets

---

**Dernière mise à jour** : 12/06/2025
**Agent** : Claude
**Version** : 1.0.0