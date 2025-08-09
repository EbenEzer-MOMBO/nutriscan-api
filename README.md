# Nutriscan API

> API backend pour l'application Nutriscan - Analyse nutritionnelle intelligente

## 📋 Description

Nutriscan API est le backend de l'application mobile Nutriscan qui permet d'analyser la composition nutritionnelle des aliments via scan de codes-barres et reconnaissance d'images.

## 🚀 Technologies

- **Runtime** : Node.js
- **Framework** : Express.js 5.1.0
- **Port par défaut** : 3000

## 📦 Installation

```bash
# Cloner le repository
git clone <url-du-repo>
cd nutriscan-api

# Installer les dépendances
npm install

# Démarrer le serveur de développement
node app.js
```

## 🔧 Configuration

### Variables d'environnement

```env
# À créer : .env
PORT=3000
NODE_ENV=development
# Autres variables à ajouter selon les besoins
```

## 📚 API Endpoints

### Status
- `GET /` - Point d'entrée de l'API

*Documentation complète des endpoints à venir...*

## 🏗️ Architecture prévue

```
nутriscan-api/
├── app.js              # Point d'entrée
├── routes/             # Routes API
├── controllers/        # Logique métier
├── models/            # Modèles de données
├── middleware/        # Middlewares personnalisés
├── config/            # Configuration
├── utils/             # Utilitaires
├── tests/             # Tests unitaires
└── docs/              # Documentation
```

## 🔮 Fonctionnalités prévues

- [ ] Authentification utilisateur (JWT)
- [ ] Scan de codes-barres
- [ ] Reconnaissance d'images d'aliments
- [ ] Base de données nutritionnelle
- [ ] Calcul de scores nutritionnels
- [ ] Historique des scans
- [ ] Profils utilisateur
- [ ] API de recommandations

## 🛠️ Développement

### Scripts disponibles

```bash
# Démarrer le serveur
node app.js

# Tests (à configurer)
npm test
```

### Standards de code

- Utilisation d'ESLint (à configurer)
- Convention de nommage camelCase
- Documentation JSDoc pour les fonctions complexes

## 🔒 Sécurité

- [ ] Validation des entrées
- [ ] Rate limiting
- [ ] CORS configuré
- [ ] Helmet.js pour les headers de sécurité
- [ ] Authentification JWT
- [ ] Chiffrement des données sensibles

## 📊 Base de données

*À définir - MongoDB ou PostgreSQL selon les besoins*

## 🚀 Déploiement

*Instructions de déploiement à venir...*

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📝 Changelog

### [0.1.0] - 2025-01-XX
- Initialisation du projet Express.js
- Configuration de base
- Structure de projet définie

## 📄 Licence

ISC

---

**Note** : Ce README sera mis à jour au fur et à mesure du développement de l'API Nutriscan.