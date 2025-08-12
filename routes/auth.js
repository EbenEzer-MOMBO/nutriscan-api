/**
 * Routes d'authentification
 */

const express = require('express')
const router = express.Router()
const { 
  login, 
  logout, 
  checkStatus, 
  requestPasswordReset, 
  verifyResetToken, 
  resetPassword 
} = require('../controllers/authController')

// Route de connexion
router.post('/login', login)

// Route de déconnexion
router.post('/logout', logout)

// Route pour vérifier le statut d'un utilisateur
router.get('/status/:email', checkStatus)

// Routes de réinitialisation de mot de passe
router.post('/password-reset/request', requestPasswordReset)
router.get('/password-reset/verify/:token', verifyResetToken)
router.post('/password-reset/reset/:token', resetPassword)

module.exports = router