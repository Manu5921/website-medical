# 🏥 HealthConnect Pro

> Plateforme B2B de prise de rendez-vous entre professionnels de santé

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-cyan)](https://tailwindcss.com/)

Une solution complète permettant aux professionnels de santé de rechercher, contacter et prendre rendez-vous entre eux pour leurs patients.

## ✨ Fonctionnalités

### ✅ Actuellement disponibles
- 🔐 **Authentification** complète avec Supabase Auth
- 👤 **Gestion de profil** avec upload d'avatar et disponibilités
- 🏥 **Annuaire des professionnels** avec recherche avancée
- 📋 **API REST complète** pour la gestion des professionnels
- 🎨 **Interface responsive** avec design médical moderne
- 🛡️ **Sécurité** avec Row Level Security (RLS)

### 🔄 En développement
- 📅 Système de prise de rendez-vous
- 🗺️ Intégration Google Maps
- 📧 Notifications par email
- 💬 Messagerie interne

## 🛠 Stack Technique

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| **Framework** | Next.js | 15.3 |
| **Langage** | TypeScript | 5+ |
| **Styling** | Tailwind CSS | 4 |
| **Base de données** | Supabase | Latest |
| **UI Components** | Shadcn/ui + Radix | Latest |
| **Formulaires** | React Hook Form + Zod | Latest |
| **Icons** | Lucide React | Latest |
| **Déploiement** | Vercel | - |

## 🚀 Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Compte Supabase

## 🛠️ Installation

1. **Cloner le projet**
```bash
cd healthcare-booking
npm install
```

2. **Configuration Supabase**

Créez un nouveau projet sur [Supabase](https://supabase.com) et exécutez le script SQL suivant :

```sql
-- Le contenu du fichier supabase/schema.sql
```

3. **Variables d'environnement**

Copiez `.env.local.example` vers `.env.local` et remplissez les variables :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Lancer le projet**

```bash
npm run dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🏗️ Structure du projet

```
healthcare-booking/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Pages d'authentification
│   │   ├── (dashboard)/      # Pages du dashboard
│   │   └── api/              # Routes API
│   ├── components/
│   │   ├── ui/               # Composants Shadcn/ui
│   │   ├── auth/             # Composants d'authentification
│   │   ├── layout/           # Composants de layout
│   │   └── professionals/    # Composants métier
│   ├── lib/
│   │   └── supabase/         # Configuration Supabase
│   ├── types/                # Types TypeScript
│   └── hooks/                # Hooks personnalisés
├── supabase/
│   └── schema.sql            # Structure de la base de données
└── public/                   # Fichiers statiques
```

## 🔐 Authentification

L'authentification utilise Supabase Auth avec :
- Inscription avec validation du numéro RPPS
- Connexion par email/mot de passe
- Protection des routes par middleware
- Row Level Security (RLS) sur toutes les tables

## 📊 Base de données

### Tables principales :

- **professionals** : Profils des professionnels de santé
- **appointments** : Rendez-vous entre professionnels
- **availabilities** : Disponibilités récurrentes
- **blocked_slots** : Indisponibilités ponctuelles

## 🎨 Design System

Le projet utilise un design system basé sur :
- **Couleurs principales** : Bleu médical (#0891b2)
- **Police** : Inter
- **Composants** : Shadcn/ui avec Radix UI
- **Responsive** : Mobile-first approach

## 🚀 Fonctionnalités

### ✅ Implémentées
- [x] Authentification (inscription/connexion)
- [x] Dashboard principal
- [x] Layout responsive avec navigation
- [x] Pages d'accueil

### 🔄 En cours de développement
- [ ] Annuaire des professionnels
- [ ] Prise de rendez-vous
- [ ] Gestion des disponibilités
- [ ] Système de notifications

### 📅 Prévues
- [ ] Messagerie interne
- [ ] Synchronisation calendrier
- [ ] Application mobile
- [ ] API publique

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Lint
npm run lint

# Type checking
npm run type-check
```

## 📦 Déploiement

### Vercel (recommandé)

1. Connectez votre repo GitHub à Vercel
2. Ajoutez les variables d'environnement
3. Déployez automatiquement

### Autres plateformes

Le projet est compatible avec :
- Netlify
- Railway
- Render
- Tout hébergeur supportant Next.js

## 📁 Structure du Projet

```
healthcare-booking/
├── 📁 src/
│   ├── 📁 app/                    # Pages Next.js App Router
│   │   ├── 📁 (auth)/            # Routes d'authentification
│   │   ├── 📁 (dashboard)/       # Routes protégées
│   │   └── 📁 api/               # API Routes
│   ├── 📁 components/
│   │   ├── 📁 ui/                # Composants Shadcn/ui
│   │   ├── 📁 layout/            # Navigation et layout
│   │   └── 📁 professionals/     # Composants métier
│   ├── 📁 hooks/                 # Hooks personnalisés
│   ├── 📁 lib/                   # Utilitaires et config
│   └── 📁 types/                 # Types TypeScript
├── 📁 supabase/                  # Schéma de base de données
└── 📄 DEVBOOK.md                 # Documentation technique
```

## 🔧 Configuration Supabase

### 1. Créer les tables

Exécutez le script SQL dans votre projet Supabase :

```bash
# Le contenu de supabase/schema.sql
```

### 2. Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push sur la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 🧪 Test avec données fictives

Le projet inclut des **données de test complètes** pour tester l'annuaire sans base de données :

### 👥 12 professionnels fictifs
- Différentes professions (médecin, infirmier, kinésithérapeute, etc.)
- Villes variées (Paris, Lyon, Marseille, Toulouse...)
- Biographies et informations réalistes
- Numéros RPPS de test

### 🔍 Fonctionnalités testables
- ✅ Navigation dans l'annuaire (`/professionals`)
- ✅ Recherche par profession, ville, nom
- ✅ Pagination des résultats
- ✅ Vue liste/grille responsive
- ✅ Consultation des profils détaillés
- ✅ Interface mobile et desktop

### 🚀 Démarrage rapide en mode test
```bash
npm run dev
# → Aller sur http://localhost:3000/professionals
# → Tester la recherche et les filtres
```

## 🐛 Problèmes connus

- [ ] Validation RPPS en simulation (pas de vérification réelle)
- [ ] Notifications push non implémentées
- [ ] Import/export calendrier à venir

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation Supabase
- Vérifiez les logs de la console

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**HealthConnect Pro** - Simplifiez la coordination entre professionnels de santé 🏥
