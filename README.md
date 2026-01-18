# CloudStorage - Plateforme SaaS de Stockage Cloud

Application SaaS de stockage cloud professionnelle, construite avec Next.js 16, Prisma, PostgreSQL (Neon) et Stripe pour la gestion des abonnements. Projet Développé dans le cadre du TP de découverte de NextJS.

## Fonctionnalites

- **Authentification securisee** : JWT avec cookies httpOnly + OTP par email
- **Dashboard protege** : Interface utilisateur moderne avec statistiques
- **Gestion de Projets** : CRUD complet pour creer et organiser vos projets
- **Systeme d'abonnement** : 3 plans (Free 5Go, Standard 500Go, Pro 2To)
- **Paiement Stripe** : Checkout, webhooks, portail client
- **Gestion des Factures** : Generation, consultation et annulation des factures
- **Gestion du profil** : Modification des informations et du mot de passe
- **Rate Limiting** : Protection contre les attaques par brute force
- **Reponses API Standardisees** : Format uniforme pour toutes les reponses

## Stack Technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| Next.js | 16.1.1 | Framework React full-stack |
| TypeScript | 5.x | Typage statique |
| Prisma | 7.x | ORM pour PostgreSQL |
| Neon | - | Base de donnees PostgreSQL |
| Stripe | 20.x | Paiements et abonnements |
| Radix UI / shadcn | - | Composants UI |
| Tailwind CSS | 4.x | Styles CSS |
| Jose | - | Tokens JWT |
| Argon2 | - | Hashage des mots de passe |
| Nodemailer | 7.x | Envoi d'emails |
| Zod | - | Validation des donnees |

## Installation

### Prerequis

- Node.js 20+
- npm ou yarn
- Compte Neon (PostgreSQL)
- Compte Stripe (mode sandbox)
- Compte Gmail (pour les emails OTP)

### Etapes d'installation

```bash
# 1. Cloner le repository
git clone https://github.com/khatibadam/tp-nextjs-saas.git
cd tp-nextjs-saas

# 2. Installer les dependances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Editer le fichier .env avec vos credentials

# 4. Generer le client Prisma
npx prisma generate

# 5. Appliquer les migrations
npx prisma db push

# 6. Lancer le serveur de developpement
npm run dev
```

### Variables d'environnement

```env
# Base de donnees Neon
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# JWT Secret (generer une cle securisee en production)
JWT_SECRET=your-super-secret-key-min-32-characters

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (Gmail)
GMAIL_USER=votre-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM=votre-email@gmail.com
EMAIL_FROM_NAME=CloudStorage

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_STANDARD=price_xxx
STRIPE_PRICE_ID_PRO=price_xxx
```

## Structure du Projet

```
tp-nextjs-saas/
├── app/                          # Next.js App Router
│   ├── api/                      # Routes API
│   │   ├── auth/                 # Authentification JWT
│   │   │   ├── login/           # POST - Connexion (rate limited)
│   │   │   ├── logout/          # POST - Deconnexion
│   │   │   ├── refresh/         # POST - Refresh token (rate limited)
│   │   │   └── me/              # GET - Utilisateur courant
│   │   ├── users/               # Gestion utilisateurs
│   │   │   ├── register/        # POST - Inscription
│   │   │   ├── profile/         # GET/PATCH - Profil
│   │   │   └── password/        # POST - Changement MDP
│   │   ├── otp/                 # Authentification OTP
│   │   │   ├── send/            # POST - Envoyer code
│   │   │   ├── verify/          # POST - Verifier code
│   │   │   └── resend/          # POST - Renvoyer code
│   │   ├── projects/            # Gestion des projets
│   │   │   ├── route.ts         # GET/POST - Liste et creation
│   │   │   └── [projectId]/     # GET/PATCH/DELETE - Detail
│   │   ├── stripe/              # Paiements Stripe
│   │   │   ├── create-checkout-session/
│   │   │   ├── create-portal-session/
│   │   │   ├── invoices/        # GET/POST - Factures
│   │   │   │   └── [invoiceId]/ # GET/POST - Detail et annulation
│   │   │   └── webhooks/        # Webhooks Stripe
│   │   └── subscription/        # Abonnements
│   ├── dashboard/               # Pages protegees
│   │   ├── page.tsx            # Dashboard principal
│   │   ├── projects/           # Gestion des projets
│   │   ├── invoices/           # Liste des factures
│   │   └── settings/           # Parametres utilisateur
│   ├── analytics/              # Statistiques
│   ├── login/                  # Page de connexion
│   ├── signup/                 # Page d'inscription
│   ├── pricing/                # Plans et tarifs
│   └── page.tsx                # Landing page
├── components/                  # Composants React
│   ├── ui/                     # Composants shadcn/ui
│   ├── app-sidebar.tsx         # Navigation laterale
│   ├── login-form.tsx          # Formulaire connexion
│   ├── subscription-card.tsx   # Carte abonnement
│   └── invoices-list.tsx       # Liste des factures
├── hooks/                       # React Hooks
│   └── use-auth.ts             # Hook d'authentification
├── lib/                         # Utilitaires
│   ├── jwt.ts                  # Gestion JWT (securise)
│   ├── prisma.ts               # Client Prisma
│   ├── stripe.ts               # Configuration Stripe
│   ├── argon2i.ts              # Hashage mots de passe
│   ├── email.ts                # Envoi d'emails
│   ├── rate-limit.ts           # Protection rate limiting
│   └── api-response.ts         # Reponses API standardisees
├── prisma/                      # Schema base de donnees
│   └── schema.prisma           # User, Subscription, Project, Invoice, OtpCode
├── docs/                        # Documentation
│   └── CloudStorage-API.postman_collection.json
└── middleware.ts                # Protection des routes
```

---

## Documentation API

Toute la documentation API de CloudStorage est disponible via Postman : https://documenter.getpostman.com/view/51595306/2sBXVig9sM

### Authentification

L'API utilise des tokens JWT stockes dans des cookies httpOnly securises.

| Token | Duree | Usage |
|-------|-------|-------|
| Access Token | 15 minutes | Authentification des requetes |
| Refresh Token | 7 jours | Renouvellement de l'access token |

---

## Plans d'abonnement

| Plan | Stockage | Prix | Fonctionnalites |
|------|----------|------|-----------------|
| **FREE** | 5 Go | 0 EUR | Partage basique, support communautaire |
| **STANDARD** | 500 Go | 9.99 EUR/mois | Partage avance, support prioritaire, historique |
| **PRO** | 2 To | 29.99 EUR/mois | Partage illimite, support 24/7, API, chiffrement |

## Test Stripe

Utilisez les cartes de test Stripe en mode sandbox :

| Carte | Numero | Resultat |
|-------|--------|----------|
| Visa | 4242 4242 4242 4242 | Paiement reussi |
| Mastercard | 5555 5555 5555 4444 | Paiement reussi |
| Decline | 4000 0000 0000 0002 | Paiement refuse |

Date d'expiration : n'importe quelle date future
CVC : n'importe quels 3 chiffres

Documentation complete : https://docs.stripe.com/testing

---

## Repartition du Travail

### Adam KHATIB - Lead Auth/Payments/Infra

- Configuration initiale du projet Next.js
- Integration Prisma + Neon (PostgreSQL)
- Systeme d'authentification JWT complet
  - Tokens access/refresh
  - Cookies httpOnly securises
  - Middleware de protection des routes
- Integration complete Stripe
  - Checkout sessions
  - Webhooks (6 evenements)
  - Portail client
- Page Settings utilisateur
- Documentation API complete (README + Postman)
- Hashage des mots de passe (Argon2)
- Validation des donnees (Zod)

### Nayir - Lead Front/UX & Auth Support

- Resolution des problemes du systeme OTP
- Protection du dashboard avec hook d'authentification
- Verification du mot de passe a la connexion
- Traduction de l'interface en francais
- Nettoyage du code et des fichiers inutiles
- Bouton deconnexion fonctionnel
- Timeout 60s sur le renvoi de code OTP
- Validation mot de passe (8 caracteres min)
- Correction navigation sidebar
- Page Analytics avec statistiques de stockage
- Affichage stockage sur carte d'abonnement

### Martin - Front/Design Support

- Ameliorations design dashboard
- Responsive mobile
- Support pages diverses

---

## Securite

### Mesures implementees

- **Hashage des mots de passe** : Argon2i (resistant aux attaques GPU)
- **Tokens JWT** : Stockes dans des cookies httpOnly (protection XSS)
- **JWT Secret obligatoire** : Erreur si JWT_SECRET non defini en production
- **Validation des donnees** : Zod sur toutes les entrees
- **Protection CSRF** : Cookies SameSite=Lax
- **Rate Limiting** : Protection contre brute force
  - Login: 5 tentatives / 15 minutes
  - Refresh Token: 10 requetes / minute
  - OTP Send: 3 envois / 5 minutes
- **Middleware** : Verification du token sur les routes protegees
- **Messages d'erreur generiques** : Evite l'enumeration des comptes
- **OTP** : Expiration apres 10 minutes, codes a 6 chiffres
- **Idempotence Webhooks** : Protection contre le double traitement des evenements Stripe
- **Reponses API standardisees** : Format uniforme avec timestamps

---

## Licence

Projet academique - TP Next.js ISITECH 2026

---

## Liens Utiles

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Stripe](https://docs.stripe.com)
- [Documentation shadcn/ui](https://ui.shadcn.com)
- [Cartes de test Stripe](https://docs.stripe.com/testing)
