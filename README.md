# CloudStorage - Plateforme SaaS de Stockage Cloud

Application SaaS de stockage cloud professionnelle, construite avec Next.js 16, Prisma, PostgreSQL (Neon) et Stripe pour la gestion des abonnements.

## Fonctionnalites

- **Authentification securisee** : JWT avec cookies httpOnly + OTP par email
- **Dashboard protege** : Interface utilisateur moderne avec statistiques
- **Systeme d'abonnement** : 3 plans (Free 5Go, Standard 500Go, Pro 2To)
- **Paiement Stripe** : Checkout, webhooks, portail client
- **Gestion du profil** : Modification des informations et du mot de passe

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
│   │   │   ├── login/           # POST - Connexion
│   │   │   ├── logout/          # POST - Deconnexion
│   │   │   ├── refresh/         # POST - Refresh token
│   │   │   └── me/              # GET - Utilisateur courant
│   │   ├── users/               # Gestion utilisateurs
│   │   │   ├── register/        # POST - Inscription
│   │   │   ├── profile/         # GET/PATCH - Profil
│   │   │   └── password/        # POST - Changement MDP
│   │   ├── otp/                 # Authentification OTP
│   │   │   ├── send/            # POST - Envoyer code
│   │   │   ├── verify/          # POST - Verifier code
│   │   │   └── resend/          # POST - Renvoyer code
│   │   ├── stripe/              # Paiements Stripe
│   │   │   ├── create-checkout-session/
│   │   │   ├── create-portal-session/
│   │   │   └── webhooks/
│   │   └── subscription/        # Abonnements
│   ├── dashboard/               # Pages protegees
│   │   ├── page.tsx            # Dashboard principal
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
│   └── subscription-card.tsx   # Carte abonnement
├── hooks/                       # React Hooks
│   └── use-auth.ts             # Hook d'authentification
├── lib/                         # Utilitaires
│   ├── jwt.ts                  # Gestion JWT
│   ├── prisma.ts               # Client Prisma
│   ├── stripe.ts               # Configuration Stripe
│   ├── argon2i.ts              # Hashage mots de passe
│   └── email.ts                # Envoi d'emails
├── prisma/                      # Schema base de donnees
│   └── schema.prisma
├── docs/                        # Documentation
│   └── CloudStorage-API.postman_collection.json
└── middleware.ts                # Protection des routes
```

---

## Documentation API

### Base URL

- **Developpement**: `http://localhost:3000`
- **Production**: `https://votre-app.vercel.app`

### Authentification

L'API utilise des tokens JWT stockes dans des cookies httpOnly securises.

| Token | Duree | Usage |
|-------|-------|-------|
| Access Token | 15 minutes | Authentification des requetes |
| Refresh Token | 7 jours | Renouvellement de l'access token |

---

### Endpoints Authentication

#### POST /api/auth/login

Authentifie l'utilisateur et genere les tokens JWT.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "success": true,
  "user": {
    "id_user": "clxxx...",
    "email": "user@example.com",
    "firstname": "John",
    "lastname": "Doe"
  },
  "subscription": {
    "planType": "FREE",
    "status": "ACTIVE",
    "storageLimit": "5368709120",
    "storageUsed": "0"
  }
}
```

**Errors:**
- `400` - Donnees invalides
- `401` - Identifiants incorrects

---

#### POST /api/auth/logout

Deconnecte l'utilisateur en supprimant les cookies.

**Response 200:**
```json
{
  "success": true,
  "message": "Deconnexion reussie"
}
```

---

#### POST /api/auth/refresh

Rafraichit les tokens JWT.

**Response 200:**
```json
{
  "success": true,
  "user": {
    "id_user": "clxxx...",
    "email": "user@example.com",
    "firstname": "John",
    "lastname": "Doe"
  }
}
```

**Errors:**
- `401` - Refresh token invalide ou expire

---

#### GET /api/auth/me

Recupere l'utilisateur authentifie.

**Response 200:**
```json
{
  "user": {
    "id_user": "clxxx...",
    "email": "user@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "subscription": {
    "id": "clyyy...",
    "planType": "STANDARD",
    "status": "ACTIVE",
    "storageLimit": "536870912000",
    "storageUsed": "1073741824",
    "stripeCurrentPeriodEnd": "2024-02-15T10:30:00.000Z",
    "cancelAtPeriodEnd": false
  }
}
```

---

### Endpoints Users

#### POST /api/users/register

Cree un nouveau compte utilisateur.

**Request:**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Utilisateur cree avec succes",
  "user": {
    "id_user": "clxxx...",
    "email": "john.doe@example.com",
    "firstname": "John",
    "lastname": "Doe"
  }
}
```

**Errors:**
- `400` - Donnees invalides
- `409` - Email deja utilise

---

#### GET /api/users/profile

Recupere le profil de l'utilisateur connecte.

**Response 200:**
```json
{
  "user": {
    "id_user": "clxxx...",
    "email": "user@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T15:45:00.000Z",
    "subscription": {
      "planType": "STANDARD",
      "status": "ACTIVE",
      "storageLimit": "536870912000",
      "storageUsed": "1073741824"
    }
  }
}
```

---

#### PATCH /api/users/profile

Met a jour le profil.

**Request:**
```json
{
  "firstname": "Johnny",
  "lastname": "Doe"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Profil mis a jour avec succes",
  "user": {
    "id_user": "clxxx...",
    "firstname": "Johnny",
    "lastname": "Doe"
  }
}
```

---

#### POST /api/users/password

Change le mot de passe.

**Request:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456",
  "confirmPassword": "newSecurePassword456"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Mot de passe modifie avec succes"
}
```

**Errors:**
- `400` - Mots de passe ne correspondent pas
- `401` - Mot de passe actuel incorrect

---

### Endpoints OTP

#### POST /api/otp/send

Envoie un code OTP par email apres verification du mot de passe.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Code OTP envoye avec succes"
}
```

---

#### POST /api/otp/verify

Verifie le code OTP (valide 10 minutes).

**Request:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Code verifie avec succes",
  "user": {
    "id_user": "clxxx...",
    "email": "user@example.com",
    "firstname": "John",
    "lastname": "Doe"
  }
}
```

---

#### POST /api/otp/resend

Renvoie un code OTP (cooldown 60 secondes).

**Request:**
```json
{
  "email": "user@example.com"
}
```

---

### Endpoints Stripe

#### POST /api/stripe/create-checkout-session

Cree une session Stripe Checkout.

**Request:**
```json
{
  "planType": "STANDARD",
  "userId": "clxxx..."
}
```

**Response 200:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_xxx..."
}
```

---

#### POST /api/stripe/create-portal-session

Cree une session vers le portail client Stripe.

**Request:**
```json
{
  "customerId": "cus_xxx..."
}
```

**Response 200:**
```json
{
  "url": "https://billing.stripe.com/p/session/xxx..."
}
```

---

#### POST /api/stripe/webhooks

Endpoint pour les webhooks Stripe (ne pas appeler directement).

**Evenements geres:**
- `checkout.session.completed` - Abonnement cree
- `customer.subscription.created` - Abonnement cree
- `customer.subscription.updated` - Abonnement mis a jour
- `customer.subscription.deleted` - Abonnement annule
- `invoice.payment_succeeded` - Paiement reussi
- `invoice.payment_failed` - Paiement echoue

---

### Endpoints Subscription

#### GET /api/subscription?userId=xxx

Recupere l'abonnement d'un utilisateur.

**Response 200:**
```json
{
  "subscription": {
    "id": "clyyy...",
    "planType": "STANDARD",
    "status": "ACTIVE",
    "storageLimit": "536870912000",
    "storageUsed": "1073741824",
    "stripeCurrentPeriodEnd": "2024-02-15T10:30:00.000Z",
    "cancelAtPeriodEnd": false
  }
}
```

---

#### POST /api/subscription/sync

Synchronise l'abonnement avec Stripe.

**Request:**
```json
{
  "userId": "clxxx..."
}
```

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

## Deploiement

### Vercel

```bash
# Installation de Vercel CLI
npm i -g vercel

# Deploiement
vercel

# Production
vercel --prod
```

### Configuration Vercel

1. Ajouter toutes les variables d'environnement dans les settings du projet
2. Configurer le webhook Stripe avec l'URL de production
3. Mettre a jour `NEXT_PUBLIC_APP_URL` avec l'URL Vercel

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
- **Validation des donnees** : Zod sur toutes les entrees
- **Protection CSRF** : Cookies SameSite=Lax
- **Middleware** : Verification du token sur les routes protegees
- **Messages d'erreur generiques** : Evite l'enumeration des comptes
- **OTP** : Expiration apres 10 minutes, codes a 6 chiffres

---

## Contribution

1. Fork le projet
2. Creer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajout nouvelle fonctionnalite'`)
4. Push la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

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
