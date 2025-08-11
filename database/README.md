# Configuration de la base de données Supabase

## Instructions pour créer la table users

### 1. Accéder à votre projet Supabase

1. Connectez-vous à [supabase.com](https://supabase.com)
2. Sélectionnez votre projet NutriScan
3. Allez dans l'onglet **SQL Editor**

### 2. Exécuter la migration

1. Copiez le contenu du fichier `migrations/001_create_users_table.sql`
2. Collez-le dans l'éditeur SQL de Supabase
3. Cliquez sur **Run** pour exécuter la migration

### 3. Vérifier la création

1. Allez dans l'onglet **Table Editor**
2. Vous devriez voir la table `users` avec toutes les colonnes
3. Vérifiez que les politiques RLS sont activées

## Structure de la table users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_image_url TEXT,
    age INTEGER CHECK (age > 0 AND age <= 150),
    weight_kg DECIMAL(5,2) CHECK (weight_kg > 0 AND weight_kg <= 1000),
    height_cm DECIMAL(5,2) CHECK (height_cm > 0 AND height_cm <= 300),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);
```

## Fonctionnalités incluses

### ✅ Sécurité
- **Row Level Security (RLS)** activé
- **Politiques de sécurité** pour protéger les données
- **Contraintes de validation** sur les champs
- **Index** pour optimiser les performances

### ✅ Fonctionnalités automatiques
- **UUID** généré automatiquement pour l'ID
- **Timestamps** automatiques (created_at, updated_at)
- **Trigger** pour mettre à jour updated_at automatiquement
- **Validation email** avec regex

### ✅ Politiques RLS configurées
- Les utilisateurs peuvent voir leurs propres données
- Les utilisateurs peuvent modifier leurs propres données
- Insertion autorisée pour l'inscription

## Configuration des variables d'environnement

Après avoir créé la table, configurez vos variables d'environnement dans le fichier `.env` :

```env
# Récupérez ces valeurs depuis Settings > API dans votre dashboard Supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## Test de la configuration

Une fois la table créée et les variables configurées, testez la connexion :

```bash
# Démarrer l'API
npm start

# Tester la connexion Supabase
curl http://localhost:3000/health/supabase
```

## Endpoints API disponibles

Après configuration, vous aurez accès à ces endpoints :

- `POST /api/users` - Créer un utilisateur
- `GET /api/users` - Lister les utilisateurs (avec pagination)
- `GET /api/users/:id` - Obtenir un utilisateur par ID
- `GET /api/users/email/:email` - Obtenir un utilisateur par email
- `PUT /api/users/:id` - Mettre à jour un utilisateur
- `DELETE /api/users/:id` - Désactiver un utilisateur
- `GET /api/users/:id/stats` - Obtenir les statistiques (IMC, etc.)
- `POST /api/users/:id/verify-password` - Vérifier un mot de passe