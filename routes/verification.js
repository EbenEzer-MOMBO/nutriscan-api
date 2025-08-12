/**
 * Routes pour la vérification des comptes utilisateur
 */

const express = require('express')
const router = express.Router()
const { verifyAccount, resendVerification } = require('../controllers/verificationController')

/**
 * @route GET /api/verify/:token
 * @desc Vérifier un compte utilisateur avec le token
 * @access Public
 */
router.get('/:token', verifyAccount)

/**
 * @route POST /api/verify/resend
 * @desc Renvoyer un email de vérification
 * @access Public
 */
router.post('/resend', resendVerification)

module.exports = router