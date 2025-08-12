# Système d'Email de Bienvenue et de Vérification

## Vue d'ensemble

Le système d'email de bienvenue avec vérification de compte a été implémenté pour sécuriser l'inscription des utilisateurs. Les comptes sont créés avec `is_active: false` et nécessitent une vérification par email pour être activés.

## Fonctionnalités

### 1. Création de Compte
- Les nouveaux comptes sont créés avec `is_active: false`
- Un token de vérification unique est généré (32 caractères aléatoires)
- Le token expire après 24 heures
- Un email de bienvenue est automatiquement envoyé

### 2. Email de Bienvenue
- Contient un lien de vérification unique
- Template HTML responsive
- Envoyé via Resend (ou simulation si non configuré)
- Gestion d'erreur : la création du compte ne fail pas si l'email échoue

### 3. Vérification de Compte
- Route : `GET /api/verify/:token`
- Vérifie la validité et l'expiration du token
- Active le compte (`is_active: true`)
- Supprime le token de vérification
- Envoie un email de confirmation d'activation

### 4. Authentification
- Route : `POST /api/auth/login`
- Vérifie que le compte est activé avant la connexion
- Retourne une erreur spécifique si le compte n'est pas activé

## Configuration

### Variables d'environnement requises

```env
# Configuration Email (Resend)
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=noreply@yourdomain.com
APP_URL=http://localhost:3000
```

### Base de données

Les champs suivants ont été ajoutés au modèle User :
- `is_active` (boolean, default: false)
- `verification_token` (string, nullable)
- `verification_expires` (timestamp, nullable)
- `verified_at` (timestamp, nullable)

## Endpoints API

### Création d'utilisateur
```http
POST /api/users
Content-Type: multipart/form-data

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

**Réponse :**
```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "is_active": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Vérification de compte
```http
GET /api/verify/{token}
```

**Réponse (succès) :**
```json
{
  "success": true,
  "message": "Compte activé avec succès",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "is_active": true
  }
}
```

**Réponse (erreur) :**
```json
{
  "success": false,
  "message": "Token de vérification invalide"
}
```

### Connexion
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "123456"
}
```

**Réponse (compte non activé) :**
```json
{
  "success": false,
  "message": "Compte non activé. Veuillez vérifier votre email pour activer votre compte.",
  "code": "ACCOUNT_NOT_ACTIVATED"
}
```

### Renvoi d'email de vérification
```http
POST /api/verify/resend
Content-Type: application/json

{
  "email": "john@example.com"
}
```

## Flux Utilisateur

1. **Inscription** : L'utilisateur s'inscrit via `POST /api/users`
2. **Email envoyé** : Un email de bienvenue avec lien de vérification est envoyé
3. **Vérification** : L'utilisateur clique sur le lien dans l'email
4. **Activation** : Le compte est activé et un email de confirmation est envoyé
5. **Connexion** : L'utilisateur peut maintenant se connecter

## Sécurité

- **Tokens sécurisés** : Générés avec `crypto.randomBytes(32)`
- **Expiration** : Les tokens expirent après 24 heures
- **Validation** : Vérification de l'existence, validité et expiration
- **Protection** : Les comptes non activés ne peuvent pas se connecter

## Gestion d'erreurs

- **Email non configuré** : Simulation des envois avec logs
- **Token invalide** : Messages d'erreur appropriés
- **Token expiré** : Possibilité de renvoyer un email
- **Compte déjà activé** : Gestion des cas edge

## Logs

Le système génère des logs détaillés :
- ✅ Succès des opérations
- ⚠️ Avertissements (email non configuré)
- ❌ Erreurs avec détails
- 🔍 Informations de débogage

## Tests

Pour tester le système :

1. Créer un utilisateur avec `POST /api/users`
2. Vérifier les logs pour le token généré
3. Utiliser le token avec `GET /api/verify/{token}`
4. Tenter une connexion avec `POST /api/auth/login`

## Améliorations futures

- [ ] Interface web pour la vérification
- [ ] Personnalisation des templates d'email
- [ ] Limitation du nombre de renvois d'email
- [ ] Intégration avec d'autres services d'email
- [ ] Notifications push pour l'activation