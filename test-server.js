/**
 * Serveur de test simple pour identifier les problèmes
 */

const express = require('express')
const app = express()
const port = 3000

// Middleware simple
app.use(express.json())

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: 'Serveur de test fonctionnel!',
    timestamp: new Date().toISOString()
  })
})

// Gestionnaire d'erreur
app.use((err, req, res, next) => {
  console.error('Erreur:', err)
  res.status(500).json({ error: 'Erreur serveur' })
})

// Gestionnaire pour les promesses rejetées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesse rejetée non gérée:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Exception non gérée:', error)
  process.exit(1)
})

// Démarrage du serveur
const server = app.listen(port, () => {
  console.log(`🧪 Serveur de test démarré sur http://localhost:${port}`)
})

// Gestionnaire de fermeture propre
process.on('SIGTERM', () => {
  console.log('Signal SIGTERM reçu, fermeture du serveur...')
  server.close(() => {
    console.log('Serveur fermé')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Signal SIGINT reçu, fermeture du serveur...')
  server.close(() => {
    console.log('Serveur fermé')
    process.exit(0)
  })
})