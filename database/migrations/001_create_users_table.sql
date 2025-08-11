-- Migration: Création de la table users
-- Description: Table principale pour stocker les informations des utilisateurs de NutriScan
-- Date: 2025-01-XX

-- Activer l'extension UUID si elle n'est pas déjà activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Création de la table users
CREATE TABLE IF NOT EXISTS users (
    -- Clé primaire UUID
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Informations personnelles
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_image_url TEXT,
    
    -- Informations physiques
    age INTEGER CHECK (age > 0 AND age <= 150),
    weight_kg DECIMAL(5,2) CHECK (weight_kg > 0 AND weight_kg <= 1000),
    height_cm DECIMAL(5,2) CHECK (height_cm > 0 AND height_cm <= 300),
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- Index pour améliorer les performances
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Création d'index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Politique de sécurité RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir et modifier leurs propres données
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Politique: Permettre l'insertion lors de l'inscription
CREATE POLICY "Enable insert for registration" ON users
    FOR INSERT WITH CHECK (true);

-- Commentaires pour la documentation
COMMENT ON TABLE users IS 'Table principale des utilisateurs de l''application NutriScan';
COMMENT ON COLUMN users.id IS 'Identifiant unique UUID de l''utilisateur';
COMMENT ON COLUMN users.name IS 'Nom complet de l''utilisateur';
COMMENT ON COLUMN users.email IS 'Adresse email unique de l''utilisateur';
COMMENT ON COLUMN users.password_hash IS 'Hash du mot de passe (bcrypt)';
COMMENT ON COLUMN users.profile_image_url IS 'URL de l''image de profil';
COMMENT ON COLUMN users.age IS 'Âge de l''utilisateur en années';
COMMENT ON COLUMN users.weight_kg IS 'Poids de l''utilisateur en kilogrammes';
COMMENT ON COLUMN users.height_cm IS 'Taille de l''utilisateur en centimètres';
COMMENT ON COLUMN users.is_active IS 'Statut actif/inactif du compte utilisateur';