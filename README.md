# NutriScan API

API backend pour l'application NutriScan - Scanner nutritionnel intelligent.

## 🚀 Installation

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn
- Compte Supabase

### Configuration

1. **Cloner le projet et installer les dépendances :**
```bash
npm install
```

2. **Configuration des variables d'environnement :**
   - Copier le fichier `.env.example` vers `.env`
   - Remplir les variables avec vos informations Supabase

```bash
cp .env.example .env
```

3. **Obtenir les clés Supabase :**
   - Connectez-vous à votre [dashboard Supabase](https://app.supabase.com)
   - Sélectionnez votre projet
   - Allez dans `Settings` > `API`
   - Copiez :
     - `Project URL` → `SUPABASE_URL`
     - `anon public` → `SUPABASE_ANON_KEY`
     - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### Variables d'environnement requises

```env
# Configuration Supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Configuration de l'application
NODE_ENV=development
PORT=3000

# Configuration email (optionnel - pour les emails de vérification)
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=noreply@yourdomain.com
APP_URL=http://localhost:3000
```

## 🔐 Fonctionnalités d'authentification

### ✅ Fonctionnalités implémentées

#### 🔑 Authentification de base
- ✅ **Inscription utilisateur** - Création de compte avec validation
- ✅ **Connexion/Déconnexion** - Authentification sécurisée
- ✅ **Gestion des profils** - CRUD complet des utilisateurs
- ✅ **Validation des données** - Sanitization et validation stricte

#### 📧 Vérification d'email
- ✅ **Envoi d'emails de vérification** - Tokens sécurisés
- ✅ **Activation de compte** - Vérification par lien email
- ✅ **Renvoi d'emails** - Gestion des tokens expirés
- ✅ **Templates d'email** - Design professionnel et responsive

#### 🔄 Réinitialisation de mot de passe
- ✅ **Demande de réinitialisation** - Génération de tokens sécurisés
- ✅ **Vérification de tokens** - Validation et expiration (1h)
- ✅ **Réinitialisation sécurisée** - Changement de mot de passe
- ✅ **Emails de confirmation** - Notification des changements

#### 🛡️ Sécurité
- ✅ **Hachage bcrypt** - Mots de passe sécurisés (12 rounds)
- ✅ **Tokens cryptographiques** - 64 caractères aléatoires
- ✅ **Expiration automatique** - Tokens avec durée de vie limitée
- ✅ **Validation stricte** - Sanitization des entrées
- ✅ **Gestion d'erreurs** - Pas de fuite d'informations sensibles

### 🔄 Migrations de base de données
- ✅ **001_create_users_table.sql** - Table utilisateurs de base
- ✅ **002_add_email_verification_fields.sql** - Champs de vérification email
- ✅ **003_add_password_reset_fields.sql** - Champs de réinitialisation mot de passe

## 🏃‍♂️ Démarrage

```bash
# Mode développement
npm start

# Ou avec nodemon pour le rechargement automatique
npm run dev
```

## 🔍 Routes disponibles

### Routes générales
- `GET /` - Page d'accueil de l'API
- `GET /health/supabase` - Test de connexion Supabase

### 🔐 Authentification (`/api/auth`)
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/logout` - Déconnexion utilisateur
- `GET /api/auth/status/:email` - Vérifier le statut d'un utilisateur

### 🔑 Réinitialisation de mot de passe (`/api/auth/password-reset`)
- `POST /api/auth/password-reset/request` - Demander une réinitialisation
- `GET /api/auth/password-reset/verify/:token` - Vérifier un token de réinitialisation
- `POST /api/auth/password-reset/reset/:token` - Réinitialiser le mot de passe

### 👥 Gestion des utilisateurs (`/api/users`)
- `POST /api/users/register` - Inscription d'un nouvel utilisateur
- `GET /api/users/profile/:email` - Récupérer le profil utilisateur
- `PUT /api/users/profile/:email` - Mettre à jour le profil utilisateur
- `DELETE /api/users/profile/:email` - Supprimer un compte utilisateur

### ✉️ Vérification d'email (`/api/verification`)
- `POST /api/verification/send` - Envoyer un email de vérification
- `GET /api/verification/verify/:token` - Vérifier un token d'activation
- `POST /api/verification/resend` - Renvoyer un email de vérification

## 🛠️ Structure du projet

```
nutriscan-api/
├── config/
│   └── supabase.js           # Configuration Supabase
├── controllers/
│   ├── authController.js     # Contrôleurs d'authentification
│   ├── userController.js     # Contrôleurs utilisateur
│   └── verificationController.js # Contrôleurs de vérification
├── database/
│   ├── migrations/           # Scripts de migration SQL
│   │   ├── 001_create_users_table.sql
│   │   ├── 002_add_email_verification_fields.sql
│   │   └── 003_add_password_reset_fields.sql
│   └── README.md            # Documentation base de données
├── docs/
│   └── EMAIL_VERIFICATION.md # Documentation vérification email
├── models/
│   └── User.js              # Modèle utilisateur
├── routes/
│   ├── auth.js              # Routes d'authentification
│   ├── users.js             # Routes utilisateur
│   └── verification.js      # Routes de vérification
├── services/
│   └── emailService.js      # Service d'envoi d'emails
├── utils/
│   └── validation.js        # Utilitaires de validation
├── .env                     # Variables d'environnement (non versionné)
├── .env.example             # Template des variables d'environnement
├── .gitignore              # Fichiers à ignorer par Git
├── app.js                  # Point d'entrée de l'application
├── package.json            # Dépendances et scripts
└── README.md               # Documentation
```

## 🔒 Sécurité

- Variables d'environnement protégées par `.gitignore`
- Middlewares de sécurité (helmet, cors)
- Validation des entrées
- Gestion d'erreurs centralisée

## 🧪 Tests

### Scripts de test disponibles
- `test-password-reset.js` - Test complet du système de réinitialisation
- `test-api.js` - Tests des routes API principales
- `test-db-access.js` - Test de connexion à la base de données

### Exécuter les tests
```bash
# Test de réinitialisation de mot de passe
node test-password-reset.js

# Test des APIs
node test-api.js

# Test de la base de données
node test-db-access.js
```

## 🚀 Prochaines étapes

### 🔄 Améliorations prévues
- [ ] **Authentification JWT** - Tokens d'accès et de rafraîchissement
- [ ] **Authentification à deux facteurs (2FA)** - SMS/TOTP
- [ ] **OAuth2** - Connexion Google/Facebook/Apple
- [ ] **Rate limiting** - Protection contre les attaques par force brute
- [ ] **Logs d'audit** - Traçabilité des actions utilisateur
- [ ] **Tests unitaires** - Couverture de code complète
- [ ] **Documentation API** - Swagger/OpenAPI
- [ ] **Monitoring** - Métriques et alertes

### 🔧 Optimisations techniques
- [ ] **Cache Redis** - Amélioration des performances
- [ ] **Compression** - Optimisation des réponses
- [ ] **CDN** - Distribution de contenu
- [ ] **Load balancing** - Répartition de charge

## 📦 Dépendances principales

- **express** - Framework web
- **@supabase/supabase-js** - Client Supabase
- **bcrypt** - Hachage des mots de passe
- **crypto** - Génération de tokens sécurisés
- **resend** - Service d'envoi d'emails
- **dotenv** - Gestion des variables d'environnement
- **cors** - Gestion CORS
- **helmet** - Sécurité HTTP
- **axios** - Client HTTP pour les tests