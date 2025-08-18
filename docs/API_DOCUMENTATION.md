# 📚 Documentation API NutriScan

**Version :** 1.0.0  
**Base URL :** `http://localhost:3009/api`  

---

## 📋 Table des matières

1. [🔐 Authentification](#authentification)
2. [👥 Gestion des utilisateurs](#gestion-des-utilisateurs)
3. [✉️ Vérification d'email](#vérification-demail)
4. [🔑 Réinitialisation de mot de passe](#réinitialisation-de-mot-de-passe)
5. [📊 Codes de réponse](#codes-de-réponse)
6. [🚨 Gestion d'erreurs](#gestion-derreurs)
7. [💡 Exemples d'utilisation](#exemples-dutilisation)

---

## 🔐 Authentification

### POST `/auth/login`
**Description :** Connexion utilisateur

#### Requête
```json
{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

#### Réponse succès (200)
```json
{
  "success": true,
  "message": "Connexion réussie",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "is_active": true,
    "email_verified": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Erreurs possibles
- `400` : Email ou mot de passe manquant
- `401` : Identifiants incorrects
- `403` : Compte non activé

---

### POST `/auth/logout`
**Description :** Déconnexion utilisateur

#### Requête
```json
{
  "email": "user@example.com"
}
```

#### Réponse succès (200)
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

---

### GET `/auth/status/:email`
**Description :** Vérifier le statut d'un utilisateur

#### Paramètres URL
- `email` : Email de l'utilisateur

#### Réponse succès (200)
```json
{
  "success": true,
  "user": {
    "email": "user@example.com",
    "is_active": true,
    "email_verified": true,
    "last_login": "2024-01-01T12:00:00Z"
  }
}
```

---

## 👥 Gestion des utilisateurs

### POST `/users/register`
**Description :** Inscription d'un nouvel utilisateur

#### Requête
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "MotDePasse123!",
  "confirmPassword": "MotDePasse123!"
}
```

#### Réponse succès (201)
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "is_active": false,
    "email_verified": false,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "emailSent": true
}
```

#### Erreurs possibles
- `400` : Données manquantes ou invalides
- `409` : Email déjà utilisé

---

### GET `/users/profile/:email`
**Description :** Récupérer le profil utilisateur

#### Paramètres URL
- `email` : Email de l'utilisateur

#### Réponse succès (200)
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "is_active": true,
    "email_verified": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

---

### PUT `/users/profile/:email`
**Description :** Mettre à jour le profil utilisateur

#### Paramètres URL
- `email` : Email de l'utilisateur

#### Requête
```json
{
  "name": "Jane Doe",
  "currentPassword": "ancienMotDePasse",
  "newPassword": "nouveauMotDePasse123!"
}
```

#### Réponse succès (200)
```json
{
  "success": true,
  "message": "Profil mis à jour avec succès",
  "user": {
    "id": "uuid",
    "name": "Jane Doe",
    "email": "user@example.com",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

---

### DELETE `/users/profile/:email`
**Description :** Supprimer un compte utilisateur

#### Paramètres URL
- `email` : Email de l'utilisateur

#### Requête
```json
{
  "password": "motDePasseConfirmation"
}
```

#### Réponse succès (200)
```json
{
  "success": true,
  "message": "Compte supprimé avec succès"
}
```

---

## ✉️ Vérification d'email

### POST `/verification/send`
**Description :** Envoyer un email de vérification

#### Requête
```json
{
  "email": "user@example.com"
}
```

#### Réponse succès (200)
```json
{
  "success": true,
  "message": "Email de vérification envoyé",
  "expiresIn": "24 heures"
}
```

---

### GET `/verification/verify/:token`
**Description :** Vérifier un token d'activation

#### Paramètres URL
- `token` : Token de vérification (64 caractères)

#### Réponse succès (200)
```json
{
  "success": true,
  "message": "Email vérifié avec succès",
  "user": {
    "email": "user@example.com",
    "email_verified": true,
    "is_active": true
  }
}
```

#### Erreurs possibles
- `400` : Token invalide ou expiré
- `404` : Utilisateur non trouvé

---

### POST `/verification/resend`
**Description :** Renvoyer un email de vérification

#### Requête
```json
{
  "email": "user@example.com"
}
```

#### Réponse succès (200)
```json
{
  "success": true,
  "message": "Nouvel email de vérification envoyé",
  "expiresIn": "24 heures"
}
```

---

## 🔑 Réinitialisation de mot de passe

### POST `/auth/password-reset/request`
**Description :** Demander une réinitialisation de mot de passe

#### Requête
```json
{
  "email": "user@example.com"
}
```

#### Réponse succès (200)
```json
{
  "success": true,
  "message": "Un email de réinitialisation a été envoyé à votre adresse.",
  "expiresIn": "1 heure"
}
```

**Note :** La réponse est identique même si l'email n'existe pas (sécurité)

---

### GET `/auth/password-reset/verify/:token`
**Description :** Vérifier un token de réinitialisation

#### Paramètres URL
- `token` : Token de réinitialisation (64 caractères)

#### Réponse succès (200)
```json
{
  "success": true,
  "message": "Token valide",
  "user": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Erreurs possibles
- `400` : Token invalide ou expiré

---

### POST `/auth/password-reset/reset/:token`
**Description :** Réinitialiser le mot de passe

#### Paramètres URL
- `token` : Token de réinitialisation (64 caractères)

#### Requête
```json
{
  "password": "NouveauMotDePasse123!",
  "confirmPassword": "NouveauMotDePasse123!"
}
```

#### Réponse succès (200)
```json
{
  "success": true,
  "message": "Mot de passe réinitialisé avec succès",
  "user": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Erreurs possibles
- `400` : Token invalide, mots de passe non correspondants, ou mot de passe faible

---

## 📊 Codes de réponse

| Code | Statut | Description |
|------|--------|-------------|
| `200` | OK | Requête réussie |
| `201` | Created | Ressource créée avec succès |
| `400` | Bad Request | Données invalides ou manquantes |
| `401` | Unauthorized | Authentification échouée |
| `403` | Forbidden | Accès refusé (compte non activé) |
| `404` | Not Found | Ressource non trouvée |
| `409` | Conflict | Conflit (email déjà utilisé) |
| `500` | Internal Server Error | Erreur serveur |

---

## 🚨 Gestion d'erreurs

### Format standard des erreurs
```json
{
  "success": false,
  "message": "Description de l'erreur",
  "error": "CODE_ERREUR",
  "details": {
    "field": "Détail spécifique"
  }
}
```

### Erreurs de validation
```json
{
  "success": false,
  "message": "Données invalides",
  "error": "VALIDATION_ERROR",
  "details": {
    "email": "Format d'email invalide",
    "password": "Le mot de passe doit contenir au moins 8 caractères"
  }
}
```

---

## 💡 Exemples d'utilisation

### JavaScript (Fetch)
```javascript
// Inscription
const register = async (userData) => {
  try {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Inscription réussie:', data.user);
      // Rediriger vers page de vérification email
    } else {
      console.error('Erreur:', data.message);
    }
  } catch (error) {
    console.error('Erreur réseau:', error);
  }
};

// Connexion
const login = async (email, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Stocker les informations utilisateur
      localStorage.setItem('user', JSON.stringify(data.user));
      // Rediriger vers dashboard
    } else {
      // Afficher message d'erreur
      alert(data.message);
    }
  } catch (error) {
    console.error('Erreur de connexion:', error);
  }
};

// Réinitialisation de mot de passe
const requestPasswordReset = async (email) => {
  try {
    const response = await fetch('/api/auth/password-reset/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Email de réinitialisation envoyé!');
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

### React Hook personnalisé
```javascript
import { useState, useCallback } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        setError(data.message);
        return { success: false, error: data.message };
      }
    } catch (err) {
      setError('Erreur de connexion');
      return { success: false, error: 'Erreur de connexion' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    if (user) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
    }
    setUser(null);
  }, [user]);

  return { user, loading, error, login, logout };
};
```

---

## 🔧 Notes techniques

### Validation des mots de passe
- **Longueur minimale :** 8 caractères
- **Requis :** Au moins une majuscule, une minuscule, un chiffre
- **Recommandé :** Caractères spéciaux

### Tokens de sécurité
- **Longueur :** 64 caractères hexadécimaux
- **Expiration email :** 24 heures
- **Expiration reset :** 1 heure
- **Génération :** Cryptographiquement sécurisé

### Emails
- **Service :** Resend
- **Templates :** HTML responsive
- **Fallback :** Mode simulation en développement

---

**📞 Support technique :** Pour toute question, contactez l'équipe backend.

**🔄 Dernière mise à jour :** Décembre 2024