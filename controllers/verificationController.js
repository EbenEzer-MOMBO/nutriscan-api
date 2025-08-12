/**
 * Contrôleur pour la vérification des comptes utilisateur
 */

const User = require('../models/User')

/**
 * Vérifier un compte utilisateur avec le token
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 */
const verifyAccount = async (req, res) => {
  try {
    console.log('🔍 Tentative de vérification de compte...')
    
    const { token } = req.params
    
    // Validation du token
    if (!token) {
      console.log('❌ Token manquant')
      return res.status(400).json({
        success: false,
        message: 'Token de vérification requis'
      })
    }

    console.log('📧 Vérification du token:', token.substring(0, 10) + '...')

    // Vérifier le compte
    const result = await User.verifyAccount(token)

    if (result.success) {
      console.log('✅ Compte vérifié avec succès pour:', result.user.email)
      
      // Retourner une page HTML de succès ou rediriger
      return res.status(200).json({
        success: true,
        message: result.message,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          is_active: result.user.is_active
        }
      })
    } else {
      console.log('❌ Échec de la vérification:', result.message)
      return res.status(400).json({
        success: false,
        message: result.message
      })
    }

  } catch (error) {
    console.error('💥 Erreur lors de la vérification:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    })
  }
}

/**
 * Renvoyer un email de vérification
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 */
const resendVerification = async (req, res) => {
  try {
    console.log('🔄 Demande de renvoi d\'email de vérification...')
    
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      })
    }

    // Trouver l'utilisateur
    const user = await User.findByEmail(email)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      })
    }

    if (user.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Compte déjà activé'
      })
    }

    // TODO: Implémenter la logique de renvoi d'email
    // Pour l'instant, on retourne un message d'information
    res.status(200).json({
      success: true,
      message: 'Fonctionnalité de renvoi d\'email en cours de développement'
    })

  } catch (error) {
    console.error('💥 Erreur lors du renvoi:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    })
  }
}

module.exports = {
  verifyAccount,
  resendVerification
}