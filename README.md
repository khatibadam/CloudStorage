# TP Next.js SaaS - Plateforme de Stockage Cloud

Application SaaS développée avec Next.js 16, Prisma, PostgreSQL (Neon) et système d'abonnement Stripe

## Fonctionnalités

- Authentification par email avec code OTP
- Dashboard protégé par authentification
- Interface utilisateur moderne avec Radix UI et Tailwind CSS
- Système d'abonnement. 3 plans disponibles : Free (5Go); Standard (500Go); Pro (2To)

## Technologies

- Next.js 16
- Prisma (PostgreSQL via Neon)
- Nodemailer (envoi d'emails OTP)
- Radix UI
- Tailwind CSS

## Variables d'environnement

Configurer les variables suivantes sur Vercel :

```
DATABASE_URL=postgresql://...

GMAIL_USER=votre-email@gmail.com
GMAIL_APP_PASSWORD=votre-mot-de-passe-application
EMAIL_FROM=votre-email@gmail.com
EMAIL_FROM_NAME=Nom de votre application
```

## Docs Utile

- Pour Test carte Stripe : https://docs.stripe.com/testing


## 🚀 Installation rapide

```bash
# Installer les dépendances
npm install
npm i stripe 
npm i nodemailer

# Configurer les variables d'environnement
# Faite une copie du fichier '.env.exemple', renommer-le '.env' et modifier les variables qu'elle contient

# Démarrer l'application
npm run dev
```

## Déploiement

Le projet est déployé sur [Vercel](https://vercel.com).

## Contributeurs

- **Adam** - Création du projet et développement initial :
  - Configuration de Prisma avec PostgreSQL (Neon)
  - Mise en place de Nodemailer pour l'envoi d'emails
  - Création de la structure des dossiers et composants
  - Développement des pages (login, signup, dashboard, OTP, pricing)
  - Intégration de Radix UI et Tailwind CSS
  - Intégration complète de Stripe (Checkout, Webhooks, Portal)

- **Nayir** - Maintenance et améliorations :
  - Résolution des problèmes techniques du système OTP
  - Protection du dashboard avec hook d'authentification
  - Ajout de la vérification du mot de passe à la connexion
  - Traduction de l'interface en français
  - Nettoyage du code (suppression fichiers inutiles)
  - Ajout du bouton déconnexion fonctionnel
  - Timeout de 60s sur le renvoi de code OTP
  - Validation mot de passe (8 caractères minimum)
  - Correction navigation sidebar (certain liens fonctionnels)
  - Nettoyage sidebar (suppression éléments inutiles)
  - Page Analytics avec statistiques de stockage
  - Affichage du stockage sur la carte d'abonnement (fake stockage)
