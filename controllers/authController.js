/**
 * Contrôleur d'authentification
 * Gestion de la connexion et de l'authentification des utilisateurs
 */

const User = require('../models/User')
const bcrypt = require('bcrypt')

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

module.exports = {
  login,
  logout,
  checkStatus
}