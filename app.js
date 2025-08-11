/**
 * Application principale NutriScan API
 * API backend pour l'application de scan nutritionnel
 */

// Chargement des variables d'environnement
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

// Import de la configuration Supabase
const { supabase, supabaseAdmin } = require('./config/supabase')

// Import des routes
const userRoutes = require('./routes/users')

const app = express()

// Configuration du port depuis les variables d'environnement
const port = process.env.PORT || 3000

// Middlewares de sécurité
app.use(helmet()) // Protection contre les vulnérabilités communes
app.use(cors()) // Configuration CORS pour les requêtes cross-origin
app.use(express.json()) // Parser pour les requêtes JSON
app.use(express.urlencoded({ extended: true })) // Parser pour les données de formulaire

// Middleware de logging des requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Route de test de l'API
app.get('/', function (req, res) {
  res.json({
    message: 'Bienvenue sur NutriScan API!',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: {
      users: '/api/users',
      health: '/health/supabase'
    }
  })
})

// Routes API
app.use('/api/users', userRoutes)

// Route de test de la connexion Supabase
app.get('/health/supabase', async function (req, res) {
  try {
    // Test simple de connexion à Supabase
    const { data, error } = await supabase
      .from('_health_check')
      .select('*')
      .limit(1)
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table n'existe pas (normal)
      throw error
    }
    
    res.json({
      status: 'connected',
      message: 'Connexion Supabase opérationnelle',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur de connexion Supabase:', error)
    res.status(500).json({
      status: 'error',
      message: 'Erreur de connexion à Supabase',
      error: error.message
    })
  }
})

// Gestionnaire d'erreur global
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err)
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  })
})

// Gestionnaire pour les routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.method} ${req.originalUrl} n'existe pas`
  })
})

// Démarrage du serveur
app.listen(port, function () {
  console.log(`🚀 NutriScan API démarrée sur le port ${port}`)
  console.log(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 URL: http://localhost:${port}`)
})
