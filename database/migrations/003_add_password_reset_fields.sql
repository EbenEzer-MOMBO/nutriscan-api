-- Migration: Ajout des champs de réinitialisation de mot de passe
-- Description: Ajouter les champs nécessaires pour le système de réinitialisation de mot de passe
-- Date: 2025-01-12

-- Ajouter les champs de réinitialisation de mot de passe
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(64);

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP WITH TIME ZONE;

-- Créer un index sur le token de réinitialisation pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);

-- Commentaires pour la documentation
COMMENT ON COLUMN users.password_reset_token IS 'Token unique pour la réinitialisation de mot de passe';
COMMENT ON COLUMN users.password_reset_expires IS 'Date d''expiration du token de réinitialisation';