/**
 * Contrôleur User - Gestion des routes utilisateur
 * Contient toutes les fonctions de gestion des utilisateurs
 */

const User = require('../models/User')
const { validateUserCreation, validateUserUpdate, sanitizeUserData } = require('../utils/validation')

/**
 * Créer un nouvel utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function createUser(req, res) {
  try {
    console.log('🔍 === DÉBUT CRÉATION UTILISATEUR ===');
    console.log('📥 req.body:', JSON.stringify(req.body, null, 2));
    console.log('📥 req.query:', JSON.stringify(req.query, null, 2));
    console.log('📥 req.params:', JSON.stringify(req.params, null, 2));
    console.log('📥 Content-Type:', req.get('Content-Type'));
    
    // Récupérer les données du corps de la requête ou des paramètres de requête
    const userData = { ...req.body, ...req.query };
    console.log('🔄 Données combinées (body + query):', JSON.stringify(userData, null, 2));
    
    // Nettoyer les données d'entrée
    const sanitizedData = sanitizeUserData(userData)
    console.log('🧹 Données nettoyées:', JSON.stringify(sanitizedData, null, 2));
    
    // Valider les données
    const validation = validateUserCreation(sanitizedData)
    console.log('✅ Résultat validation:', JSON.stringify(validation, null, 2));
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Données invalides',
        details: validation.errors
      })
    }

    // Créer l'utilisateur
    const user = await User.create(sanitizedData)
    
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: user.toJSON()
    })
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    
    if (error.message.includes('existe déjà')) {
      return res.status(409).json({
        error: 'Conflit',
        message: error.message
      })
    }
    
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Impossible de créer l\'utilisateur'
    })
  }
}

/**
 * Obtenir un utilisateur par son ID
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getUserById(req, res) {
  try {
    const { id } = req.params
    
    if (!id) {
      return res.status(400).json({
        error: 'ID utilisateur requis'
      })
    }

    const user = await User.findById(id)
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      })
    }

    res.json({
      user: user.toJSON()
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    res.status(500).json({
      error: 'Erreur interne du serveur'
    })
  }
}

/**
 * Obtenir un utilisateur par son email
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getUserByEmail(req, res) {
  try {
    const { email } = req.params
    
    if (!email) {
      return res.status(400).json({
        error: 'Email utilisateur requis'
      })
    }

    const user = await User.findByEmail(email)
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      })
    }

    res.json({
      user: user.toJSON()
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    res.status(500).json({
      error: 'Erreur interne du serveur'
    })
  }
}

/**
 * Mettre à jour un utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function updateUser(req, res) {
  try {
    const { id } = req.params
    
    if (!id) {
      return res.status(400).json({
        error: 'ID utilisateur requis'
      })
    }

    // Trouver l'utilisateur
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      })
    }

    // Nettoyer et valider les données de mise à jour
    const sanitizedData = sanitizeUserData(req.body)
    const validation = validateUserUpdate(sanitizedData)
    
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Données invalides',
        details: validation.errors
      })
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await user.update(sanitizedData)
    
    res.json({
      message: 'Utilisateur mis à jour avec succès',
      user: updatedUser.toJSON()
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Impossible de mettre à jour l\'utilisateur'
    })
  }
}

/**
 * Désactiver un utilisateur (soft delete)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function deactivateUser(req, res) {
  try {
    const { id } = req.params
    
    if (!id) {
      return res.status(400).json({
        error: 'ID utilisateur requis'
      })
    }

    // Trouver l'utilisateur
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      })
    }

    // Désactiver l'utilisateur
    const success = await user.deactivate()
    
    if (!success) {
      return res.status(500).json({
        error: 'Erreur lors de la désactivation de l\'utilisateur'
      })
    }

    res.json({
      message: 'Utilisateur désactivé avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la désactivation de l\'utilisateur:', error)
    res.status(500).json({
      error: 'Erreur interne du serveur'
    })
  }
}

/**
 * Lister tous les utilisateurs (avec pagination)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getAllUsers(req, res) {
  try {
    // Paramètres de pagination
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'Paramètres de pagination invalides',
        message: 'La page doit être >= 1 et la limite entre 1 et 100'
      })
    }

    const result = await User.findAll({ page, limit })
    
    res.json({
      message: 'Utilisateurs récupérés avec succès',
      users: result.users.map(user => user.toJSON()),
      pagination: result.pagination
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    res.status(500).json({
      error: 'Erreur interne du serveur'
    })
  }
}

/**
 * Vérifier le mot de passe d'un utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function verifyPassword(req, res) {
  try {
    const { id } = req.params
    const { password } = req.body
    
    if (!id || !password) {
      return res.status(400).json({
        error: 'ID utilisateur et mot de passe requis'
      })
    }

    // Trouver l'utilisateur avec le mot de passe
    const user = await User.findByEmail(req.body.email) // Utiliser email pour récupérer le hash
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      })
    }

    const isValid = await user.verifyPassword(password)
    
    res.json({
      valid: isValid,
      message: isValid ? 'Mot de passe correct' : 'Mot de passe incorrect'
    })
  } catch (error) {
    console.error('Erreur lors de la vérification du mot de passe:', error)
    res.status(500).json({
      error: 'Erreur interne du serveur'
    })
  }
}

/**
 * Obtenir les statistiques d'un utilisateur (IMC, etc.)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getUserStats(req, res) {
  try {
    const { id } = req.params
    
    if (!id) {
      return res.status(400).json({
        error: 'ID utilisateur requis'
      })
    }

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      })
    }

    const bmi = user.calculateBMI()
    const weightStatus = user.getWeightStatus()
    
    res.json({
      user_id: user.id,
      stats: {
        bmi: bmi,
        weight_status: weightStatus,
        age: user.age,
        weight_kg: user.weight_kg,
        height_cm: user.height_cm
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    res.status(500).json({
      error: 'Erreur interne du serveur'
    })
  }
}

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  deactivateUser,
  getAllUsers,
  verifyPassword,
  getUserStats
}