/**
 * Version simplifiée de l'application pour identifier le problème
 */

// Chargement des variables d'environnement
require('dotenv').config()

const express = require('express')
const app = express()
const port = process.env.PORT || 3000

console.log('Démarrage de l\'application...')

// Middlewares de base
app.use(express.json())

console.log('Middlewares configurés...')

// Route de test simple
app.get('/', (req, res) => {
  console.log('Route / appelée')
  res.json({
    message: 'API NutriScan - Version simplifiée',
    status: 'OK',
    timestamp: new Date().toISOString()
  })
})

console.log('Routes configurées...')

// Gestionnaires d'erreur
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesse rejetée non gérée:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Exception non gérée:', error)
  process.exit(1)
})

console.log('Gestionnaires d\'erreur configurés...')

// Démarrage du serveur
const server = app.listen(port, () => {
  console.log(`✅ Serveur démarré sur le port ${port}`)
  console.log(`🔗 URL: http://localhost:${port}`)
  console.log('Le serveur est en cours d\'exécution...')
})

// Empêcher la fermeture automatique
setInterval(() => {
  console.log('Serveur toujours actif...', new Date().toISOString())
}, 30000)

console.log('Configuration terminée, serveur en attente...')