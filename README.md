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
```

## 🏃‍♂️ Démarrage

```bash
# Mode développement
npm start

# Ou avec nodemon pour le rechargement automatique
npm run dev
```

## 🔍 Routes disponibles

- `GET /` - Page d'accueil de l'API
- `GET /health/supabase` - Test de connexion Supabase

## 🛠️ Structure du projet

```
nutriscan-api/
├── config/
│   └── supabase.js      # Configuration Supabase
├── .env                 # Variables d'environnement (non versionné)
├── .env.example         # Template des variables d'environnement
├── .gitignore          # Fichiers à ignorer par Git
├── app.js              # Point d'entrée de l'application
├── package.json        # Dépendances et scripts
└── README.md           # Documentation
```

## 🔒 Sécurité

- Variables d'environnement protégées par `.gitignore`
- Middlewares de sécurité (helmet, cors)
- Validation des entrées
- Gestion d'erreurs centralisée

## 📦 Dépendances principales

- **express** - Framework web
- **@supabase/supabase-js** - Client Supabase
- **dotenv** - Gestion des variables d'environnement
- **cors** - Gestion CORS
- **helmet** - Sécurité HTTP