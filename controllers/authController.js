/**
 * Contrôleur d'authentification
 * Gestion de la connexion et de l'authentification des utilisateurs
 */

const User = require('../models/User')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const { sendPasswordResetEmail, sendPasswordResetConfirmationEmail } = require('../services/emailService')
const { isValidEmail, validatePassword } = require('../utils/validation')

/**
 * Connexion d'un utilisateur
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 */
const login = async (req, res) => {
  try {
    console.log('🔐 Tentative de connexion...')
    
    const { email, password } = req.body
    
    // Validation des données d'entrée
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      })
    }

    console.log('📧 Tentative de connexion pour:', email)

    // Trouver l'utilisateur par email
    const user = await User.findByEmail(email.toLowerCase().trim())
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé')
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      })
    }

    // Vérifier si le compte est activé
    if (!user.is_active) {
      console.log('⚠️ Compte non activé pour:', email)
      return res.status(403).json({
        success: false,
        message: 'Compte non activé. Veuillez vérifier votre email pour activer votre compte.',
        code: 'ACCOUNT_NOT_ACTIVATED'
      })
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.verifyPassword(password)
    
    if (!isPasswordValid) {
      console.log('❌ Mot de passe incorrect pour:', email)
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      })
    }

    console.log('✅ Connexion réussie pour:', email)

    // Connexion réussie
    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_image_url: user.profile_image_url,
        age: user.age,
        weight_kg: user.weight_kg,
        height_cm: user.height_cm,
        is_active: user.is_active,
        created_at: user.created_at
      }
    })

  } catch (error) {
    console.error('💥 Erreur lors de la connexion:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    })
  }
}

/**
 * Déconnexion d'un utilisateur (pour les sessions futures)
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 */
const logout = async (req, res) => {
  try {
    // Pour l'instant, simple réponse de succès
    // Dans le futur, on pourrait invalider des tokens JWT ici
    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie'
    })
  } catch (error) {
    console.error('💥 Erreur lors de la déconnexion:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    })
  }
}

/**
 * Vérifier le statut d'un utilisateur (pour les sessions futures)
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 */
const checkStatus = async (req, res) => {
  try {
    const { email } = req.params
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      })
    }

    const user = await User.findByEmail(email.toLowerCase().trim())
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      })
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        is_active: user.is_active,
        created_at: user.created_at
      }
    })

  } catch (error) {
    console.error('💥 Erreur lors de la vérification du statut:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    })
  }
}

/**
 * Demander une réinitialisation de mot de passe
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 */
const requestPasswordReset = async (req, res) => {
  try {
    console.log('🔐 Demande de réinitialisation de mot de passe...')
    
    const { email } = req.body
    
    // Validation de l'email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'email invalide'
      })
    }

    console.log('📧 Demande de réinitialisation pour:', email)

    // Trouver l'utilisateur par email
    const user = await User.findByEmail(email.toLowerCase().trim())
    
    // Toujours retourner un succès pour éviter l'énumération d'emails
    if (!user) {
      console.log('⚠️ Utilisateur non trouvé, mais on retourne un succès')
      return res.status(200).json({
        success: true,
        message: 'Si cet email existe dans notre système, vous recevrez un lien de réinitialisation.'
      })
    }

    // Vérifier si le compte est actif
    if (!user.is_active) {
      console.log('⚠️ Compte non activé pour:', email)
      return res.status(403).json({
        success: false,
        message: 'Compte non activé. Veuillez d\'abord activer votre compte.',
        code: 'ACCOUNT_NOT_ACTIVATED'
      })
    }

    // Générer un token de réinitialisation sécurisé
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

    // Sauvegarder le token dans la base de données
    const tokenSaved = await user.setPasswordResetToken(resetToken, expiresAt)
    
    if (!tokenSaved) {
      console.error('❌ Erreur lors de la sauvegarde du token')
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération du lien de réinitialisation'
      })
    }

    // Envoyer l'email de réinitialisation
    const emailResult = await sendPasswordResetEmail(user.email, user.name, resetToken)
    
    if (!emailResult.success) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', emailResult.error)
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email de réinitialisation'
      })
    }

    console.log('✅ Email de réinitialisation envoyé pour:', email)

    res.status(200).json({
      success: true,
      message: 'Un email de réinitialisation a été envoyé à votre adresse.',
      expiresIn: '1 heure'
    })

  } catch (error) {
    console.error('💥 Erreur lors de la demande de réinitialisation:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    })
  }
}

/**
 * Vérifier la validité d'un token de réinitialisation
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 */
const verifyResetToken = async (req, res) => {
  try {
    console.log('🔍 Vérification du token de réinitialisation...')
    
    const { token } = req.params
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token de réinitialisation requis'
      })
    }

    // Trouver l'utilisateur par token
    const user = await User.findByPasswordResetToken(token)
    
    if (!user) {
      console.log('❌ Token invalide ou expiré')
      return res.status(400).json({
        success: false,
        message: 'Token de réinitialisation invalide ou expiré'
      })
    }

    console.log('✅ Token valide pour:', user.email)

    res.status(200).json({
      success: true,
      message: 'Token valide',
      user: {
        email: user.email,
        name: user.name
      }
    })

  } catch (error) {
    console.error('💥 Erreur lors de la vérification du token:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    })
  }
}

/**
 * Réinitialiser le mot de passe avec un nouveau mot de passe
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 */
const resetPassword = async (req, res) => {
  try {
    console.log('🔑 Réinitialisation du mot de passe...')
    
    const { token } = req.params
    const { password, confirmPassword } = req.body
    
    // Validation des données d'entrée
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token de réinitialisation requis'
      })
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe et confirmation requis'
      })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Les mots de passe ne correspondent pas'
      })
    }

    // Validation du mot de passe
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe invalide',
        errors: passwordValidation.errors
      })
    }

    // Trouver l'utilisateur par token
    const user = await User.findByPasswordResetToken(token)
    
    if (!user) {
      console.log('❌ Token invalide ou expiré')
      return res.status(400).json({
        success: false,
        message: 'Token de réinitialisation invalide ou expiré'
      })
    }

    console.log('🔄 Réinitialisation du mot de passe pour:', user.email)

    // Réinitialiser le mot de passe
    const resetSuccess = await user.resetPassword(password)
    
    if (!resetSuccess) {
      console.error('❌ Erreur lors de la réinitialisation du mot de passe')
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la réinitialisation du mot de passe'
      })
    }

    // Envoyer un email de confirmation
    const emailResult = await sendPasswordResetConfirmationEmail(user.email, user.name)
    
    if (!emailResult.success) {
      console.error('⚠️ Erreur lors de l\'envoi de l\'email de confirmation:', emailResult.error)
      // Ne pas faire échouer la requête pour cela
    }

    console.log('✅ Mot de passe réinitialisé avec succès pour:', user.email)

    res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
    })

  } catch (error) {
    console.error('💥 Erreur lors de la réinitialisation du mot de passe:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    })
  }
}

module.exports = {
  login,
  logout,
  checkStatus,
  requestPasswordReset,
  verifyResetToken,
  resetPassword
}