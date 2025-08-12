/**
 * Routes d'authentification
 */

const express = require('express')
const router = express.Router()
const { login, logout, checkStatus } = require('../controllers/authController')

/**
 * @route POST /api/auth/login
 * @desc Connexion d'un utilisateur
 * @access Public
 */
router.post('/login', login)

/**
 * @route POST /api/auth/logout
 * @desc Déconnexion d'un utilisateur
 * @access Public
 */
router.post('/logout', logout)

/**
 * @route GET /api/auth/status/:email
 * @desc Vérifier le statut d'un utilisateur
 * @access Public
 */
router.get('/status/:email', checkStatus)

module.exports = router