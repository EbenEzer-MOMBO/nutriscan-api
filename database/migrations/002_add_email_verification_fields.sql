-- Migration: Ajout des champs de vérification d'email
-- Description: Ajouter les champs nécessaires pour le système de vérification d'email
-- Date: 2024-12-24

-- Ajouter les champs de vérification d'email
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(64),
ADD COLUMN IF NOT EXISTS verification_expires TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Modifier la valeur par défaut de is_active pour les nouveaux comptes
ALTER TABLE users 
ALTER COLUMN is_active SET DEFAULT false;

-- Créer un index sur le token de vérification pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);

-- Ajouter des contraintes pour la sécurité
ALTER TABLE users 
ADD CONSTRAINT chk_verification_token_length 
CHECK (verification_token IS NULL OR length(verification_token) >= 32);

-- Commentaires pour la documentation
COMMENT ON COLUMN users.verification_token IS 'Token unique pour la vérification d''email (32+ caractères)';
COMMENT ON COLUMN users.verification_expires IS 'Date d''expiration du token de vérification';
COMMENT ON COLUMN users.verified_at IS 'Date et heure de vérification du compte';

-- Mise à jour des comptes existants pour les marquer comme vérifiés
-- (Optionnel: décommentez si vous voulez marquer les comptes existants comme vérifiés)
-- UPDATE users 
-- SET is_active = true, verified_at = NOW() 
-- WHERE is_active = true AND verified_at IS NULL;