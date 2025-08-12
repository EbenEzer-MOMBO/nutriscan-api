// Serveur de diagnostic simple
const express = require('express')
const app = express()
const port = 3001

// Route de test simple
app.get('/', (req, res) => {
  console.log('Route racine appelée!')
  res.json({
    message: 'Serveur de diagnostic actif',
    timestamp: new Date().toISOString()
  })
})

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

// Démarrage
app.listen(port, () => {
  console.log(`🔍 Serveur de diagnostic sur le port ${port}`)
})

// Keep alive
setInterval(() => {
  console.log('Serveur de diagnostic actif...')
}, 10000)