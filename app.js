/**
 * Application principale NutriScan API
 * API backend pour l'application de scan nutritionnel
 */

// Chargement des variables d'environnement
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const multer = require('multer')

// Import de la configuration Supabase
let supabase = null
try {
  const supabaseConfig = require('./config/supabase')
  supabase = supabaseConfig.supabase
  console.log('✅ Configuration Supabase chargée')
} catch (error) {
  console.error('❌ Erreur lors du chargement de Supabase:', error.message)
}

// Import des routes
let userRoutes = null
let verificationRoutes = null
let authRoutes = null
try {
  userRoutes = require('./routes/users')
  console.log('✅ Routes utilisateur chargées')
} catch (error) {
  console.error('❌ Erreur lors du chargement des routes utilisateur:', error.message)
}

try {
  verificationRoutes = require('./routes/verification')
  console.log('✅ Routes de vérification chargées')
} catch (error) {
  console.error('❌ Erreur lors du chargement des routes de vérification:', error.message)
}

try {
  authRoutes = require('./routes/auth')
  console.log('✅ Routes d\'authentification chargées')
} catch (error) {
  console.error('❌ Erreur lors du chargement des routes d\'authentification:', error.message)
}

const app = express()

// Configuration du port depuis les variables d'environnement
const port = process.env.PORT || 3009

// Configuration de multer pour les données multipart/form-data
const upload = multer()

// Middlewares de sécurité
app.use(helmet()) // Protection contre les vulnérabilités communes
app.use(cors()) // Configuration CORS pour les requêtes cross-origin
app.use(express.json()) // Parser pour les requêtes JSON
app.use(express.urlencoded({ extended: true })) // Parser pour les données de formulaire
app.use(upload.none()) // Parser pour les données multipart/form-data (sans fichiers)

// Middleware de logging des requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  
  // Logging détaillé pour les requêtes POST
  if (req.method === 'POST') {
    console.log('🔍 === MIDDLEWARE LOGGING POST ===')
    console.log('📋 Headers:', JSON.stringify(req.headers, null, 2))
    console.log('📦 Body (avant parsing):', req.body)
    console.log('🔗 Query params:', JSON.stringify(req.query, null, 2))
    console.log('📄 Content-Type:', req.get('Content-Type'))
    console.log('📏 Content-Length:', req.get('Content-Length'))
  }
  
  next()
})

// Route racine avec page d'accueil améliorée
app.get('/', function (req, res) {
  // Si l'en-tête Accept contient application/json, retourner JSON
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.json({
      message: 'Bienvenue sur NutriScan API!',
      version: '1.0.0',
      status: 'active',
      timestamp: new Date().toISOString(),
      endpoints: {
        users: '/api/users',
        auth: '/api/auth',
        verification: '/api/verify',
        health: '/health/supabase'
      }
    })
  }

  // Sinon, retourner une page HTML moderne
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NutriScan API - Scanner Nutritionnel Intelligent</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .header {
            text-align: center;
            margin-bottom: 3rem;
            color: white;
        }
        
        .logo {
            font-size: 3rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .tagline {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 1rem;
        }
        
        .status-badge {
            display: inline-block;
            background: #4CAF50;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 25px;
            font-weight: bold;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .main-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }
        
        .card {
            background: white;
            border-radius: 15px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .card-title {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: #667eea;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .card-icon {
            font-size: 1.8rem;
        }
        
        .endpoint-list {
            list-style: none;
        }
        
        .endpoint-item {
            margin: 0.8rem 0;
            padding: 0.8rem;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            transition: background 0.3s ease;
        }
        
        .endpoint-item:hover {
            background: #e9ecef;
        }
        
        .endpoint-method {
            font-weight: bold;
            color: #28a745;
            margin-right: 0.5rem;
        }
        
        .endpoint-path {
            font-family: 'Courier New', monospace;
            color: #495057;
        }
        
        .endpoint-desc {
            font-size: 0.9rem;
            color: #6c757d;
            margin-top: 0.3rem;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        
        .info-item {
            text-align: center;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 10px;
        }
        
        .info-label {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 0.5rem;
        }
        
        .info-value {
            font-family: 'Courier New', monospace;
            color: #495057;
        }
        
        .footer {
            text-align: center;
            color: white;
            opacity: 0.8;
            margin-top: 2rem;
        }
        
        .tech-stack {
            display: flex;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
            margin-top: 1rem;
        }
        
        .tech-badge {
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 0.3rem 0.8rem;
            border-radius: 15px;
            font-size: 0.9rem;
            backdrop-filter: blur(10px);
        }
        
        .health-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            background: #4CAF50;
            border-radius: 50%;
            margin-right: 0.5rem;
            animation: blink 1.5s infinite;
        }
        
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.3; }
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .logo {
                font-size: 2rem;
            }
            
            .main-content {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🥗 NutriScan API</div>
            <div class="tagline">Scanner Nutritionnel Intelligent</div>
            <div class="status-badge">
                <span class="health-indicator"></span>
                API Active
            </div>
        </div>
        
        <div class="main-content">
            <div class="card">
                <div class="card-title">
                    <span class="card-icon">🚀</span>
                    Endpoints Disponibles
                </div>
                <ul class="endpoint-list">
                    <li class="endpoint-item">
                        <div>
                            <span class="endpoint-method">POST</span>
                            <span class="endpoint-path">/api/auth/login</span>
                        </div>
                        <div class="endpoint-desc">Authentification utilisateur</div>
                    </li>
                    <li class="endpoint-item">
                        <div>
                            <span class="endpoint-method">POST</span>
                            <span class="endpoint-path">/api/auth/register</span>
                        </div>
                        <div class="endpoint-desc">Inscription nouvel utilisateur</div>
                    </li>
                    <li class="endpoint-item">
                        <div>
                            <span class="endpoint-method">GET</span>
                            <span class="endpoint-path">/api/users</span>
                        </div>
                        <div class="endpoint-desc">Liste des utilisateurs</div>
                    </li>
                    <li class="endpoint-item">
                        <div>
                            <span class="endpoint-method">POST</span>
                            <span class="endpoint-path">/api/verify/send</span>
                        </div>
                        <div class="endpoint-desc">Envoi email de vérification</div>
                    </li>
                    <li class="endpoint-item">
                        <div>
                            <span class="endpoint-method">GET</span>
                            <span class="endpoint-path">/health/supabase</span>
                        </div>
                        <div class="endpoint-desc">Statut de la base de données</div>
                    </li>
                </ul>
            </div>
            
            <div class="card">
                <div class="card-title">
                    <span class="card-icon">📊</span>
                    Informations API
                </div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Version</div>
                        <div class="info-value">v1.0.0</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Environnement</div>
                        <div class="info-value">${process.env.NODE_ENV || 'development'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Port</div>
                        <div class="info-value">${port}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Démarré le</div>
                        <div class="info-value">${new Date().toLocaleString('fr-FR')}</div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-title">
                    <span class="card-icon">🛠️</span>
                    Technologies
                </div>
                <div class="tech-stack">
                    <span class="tech-badge">Node.js</span>
                    <span class="tech-badge">Express.js</span>
                    <span class="tech-badge">Supabase</span>
                    <span class="tech-badge">JWT</span>
                    <span class="tech-badge">Bcrypt</span>
                    <span class="tech-badge">Resend</span>
                </div>
                <div style="margin-top: 1.5rem; text-align: center; color: #6c757d;">
                    <p>API RESTful sécurisée pour la gestion des utilisateurs et l'analyse nutritionnelle</p>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>&copy; 2024 NutriScan Team - API Backend</p>
            <p style="margin-top: 0.5rem; font-size: 0.9rem;">
                Développé avec ❤️ pour une alimentation plus saine
            </p>
        </div>
    </div>
    
    <script>
        // Animation simple pour les cartes
        document.addEventListener('DOMContentLoaded', function() {
            const cards = document.querySelectorAll('.card');
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 200);
            });
            
            // Test de connectivité en arrière-plan
            fetch('/health/supabase')
                .then(response => response.json())
                .then(data => {
                    const indicator = document.querySelector('.health-indicator');
                    if (data.status === 'connected') {
                        indicator.style.background = '#4CAF50';
                    } else {
                        indicator.style.background = '#f44336';
                    }
                })
                .catch(() => {
                    const indicator = document.querySelector('.health-indicator');
                    indicator.style.background = '#ff9800';
                });
        });
    </script>
</body>
</html>
  `
  
  res.send(html)
})

// Routes API
if (userRoutes) {
  app.use('/api/users', userRoutes)
  console.log('✅ Routes API utilisateur configurées')
} else {
  console.log('⚠️ Routes utilisateur non disponibles')
}

if (verificationRoutes) {
  app.use('/api/verify', verificationRoutes)
  console.log('✅ Routes API de vérification configurées')
} else {
  console.log('⚠️ Routes de vérification non disponibles')
}

if (authRoutes) {
  app.use('/api/auth', authRoutes)
  console.log('✅ Routes API d\'authentification configurées')
} else {
  console.log('⚠️ Routes d\'authentification non disponibles')
}

// Route de test de la connexion Supabase
app.get('/health/supabase', async function (req, res) {
  try {
    if (!supabase) {
      return res.status(500).json({
        status: 'error',
        message: 'Configuration Supabase non disponible'
      })
    }

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

// Gestionnaires d'erreur globaux
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesse rejetée non gérée:', reason)
  console.error('Promise:', promise)
})

process.on('uncaughtException', (error) => {
  console.error('Exception non gérée:', error)
  process.exit(1)
})

// Démarrage du serveur
const server = app.listen(port, function () {
  console.log(`🚀 NutriScan API démarrée sur le port ${port}`)
  console.log(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 URL: http://localhost:${port}`)
})

// Keep-alive pour maintenir le serveur actif
setInterval(() => {
  console.log(`⏰ Serveur actif - ${new Date().toISOString()}`)
}, 30000) // Log toutes les 30 secondes

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
