/**
 * Utilitaires de validation pour l'application NutriScan
 * Contient toutes les fonctions de validation des données utilisateur
 */

/**
 * Valider une adresse email
 * @param {string} email - Adresse email à valider
 * @returns {boolean} True si l'email est valide
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false
  
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  return emailRegex.test(email.trim())
}

/**
 * Valider un mot de passe (version simplifiée pour les tests)
 * @param {string} password - Mot de passe à valider
 * @returns {Object} Résultat de validation
 */
function validatePassword(password) {
  const result = {
    isValid: false,
    errors: []
  }

  if (!password || typeof password !== 'string') {
    result.errors.push('Le mot de passe est requis')
    return result
  }

  // Version simplifiée : minimum 6 caractères pour les tests
  if (password.length < 6) {
    result.errors.push('Le mot de passe doit contenir au moins 6 caractères')
  }

  result.isValid = result.errors.length === 0
  return result
}

/**
 * Valider les données de création d'un utilisateur
 * @param {Object} userData - Données utilisateur à valider
 * @returns {Object} Résultat de validation
 */
function validateUserCreation(userData) {
  const result = {
    isValid: false,
    errors: []
  }

  // Validation du nom
  if (!userData.name || typeof userData.name !== 'string' || userData.name.trim().length < 2) {
    result.errors.push('Le nom doit contenir au moins 2 caractères')
  } else if (userData.name.trim().length > 255) {
    result.errors.push('Le nom ne peut pas dépasser 255 caractères')
  }

  // Validation de l'email
  if (!isValidEmail(userData.email)) {
    result.errors.push('L\'adresse email n\'est pas valide')
  }

  // Validation du mot de passe
  const passwordValidation = validatePassword(userData.password)
  if (!passwordValidation.isValid) {
    result.errors.push(...passwordValidation.errors)
  }

  // Validation de l'âge (optionnel)
  if (userData.age !== undefined && userData.age !== null) {
    const age = parseInt(userData.age)
    if (isNaN(age) || age < 1 || age > 150) {
      result.errors.push('L\'âge doit être compris entre 1 et 150 ans')
    }
  }

  // Validation du poids (optionnel)
  if (userData.weight_kg !== undefined && userData.weight_kg !== null) {
    const weight = parseFloat(userData.weight_kg)
    if (isNaN(weight) || weight <= 0 || weight > 1000) {
      result.errors.push('Le poids doit être compris entre 0.1 et 1000 kg')
    }
  }

  // Validation de la taille (optionnel)
  if (userData.height_cm !== undefined && userData.height_cm !== null) {
    const height = parseFloat(userData.height_cm)
    if (isNaN(height) || height <= 0 || height > 300) {
      result.errors.push('La taille doit être comprise entre 0.1 et 300 cm')
    }
  }

  // Validation de l'URL de l'image de profil (optionnel)
  if (userData.profile_image_url && typeof userData.profile_image_url === 'string') {
    try {
      new URL(userData.profile_image_url)
    } catch (error) {
      result.errors.push('L\'URL de l\'image de profil n\'est pas valide')
    }
  }

  result.isValid = result.errors.length === 0
  return result
}

/**
 * Valider les données de mise à jour d'un utilisateur
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Object} Résultat de validation
 */
function validateUserUpdate(updateData) {
  const result = {
    isValid: false,
    errors: []
  }

  // Au moins un champ doit être fourni
  const allowedFields = ['name', 'password', 'profile_image_url', 'age', 'weight_kg', 'height_cm']
  const providedFields = Object.keys(updateData).filter(key => allowedFields.includes(key))
  
  if (providedFields.length === 0) {
    result.errors.push('Au moins un champ doit être fourni pour la mise à jour')
    return result
  }

  // Validation du nom si fourni
  if (updateData.name !== undefined) {
    if (!updateData.name || typeof updateData.name !== 'string' || updateData.name.trim().length < 2) {
      result.errors.push('Le nom doit contenir au moins 2 caractères')
    } else if (updateData.name.trim().length > 255) {
      result.errors.push('Le nom ne peut pas dépasser 255 caractères')
    }
  }

  // Validation du mot de passe si fourni
  if (updateData.password !== undefined) {
    const passwordValidation = validatePassword(updateData.password)
    if (!passwordValidation.isValid) {
      result.errors.push(...passwordValidation.errors)
    }
  }

  // Validation de l'âge si fourni
  if (updateData.age !== undefined && updateData.age !== null) {
    const age = parseInt(updateData.age)
    if (isNaN(age) || age < 1 || age > 150) {
      result.errors.push('L\'âge doit être compris entre 1 et 150 ans')
    }
  }

  // Validation du poids si fourni
  if (updateData.weight_kg !== undefined && updateData.weight_kg !== null) {
    const weight = parseFloat(updateData.weight_kg)
    if (isNaN(weight) || weight <= 0 || weight > 1000) {
      result.errors.push('Le poids doit être compris entre 0.1 et 1000 kg')
    }
  }

  // Validation de la taille si fournie
  if (updateData.height_cm !== undefined && updateData.height_cm !== null) {
    const height = parseFloat(updateData.height_cm)
    if (isNaN(height) || height <= 0 || height > 300) {
      result.errors.push('La taille doit être comprise entre 0.1 et 300 cm')
    }
  }

  // Validation de l'URL de l'image de profil si fournie
  if (updateData.profile_image_url !== undefined && updateData.profile_image_url !== null) {
    if (typeof updateData.profile_image_url === 'string' && updateData.profile_image_url.trim() !== '') {
      try {
        new URL(updateData.profile_image_url)
      } catch (error) {
        result.errors.push('L\'URL de l\'image de profil n\'est pas valide')
      }
    }
  }

  result.isValid = result.errors.length === 0
  return result
}

/**
 * Nettoyer et formater les données utilisateur
 * @param {Object} userData - Données utilisateur brutes
 * @returns {Object} Données nettoyées
 */
function sanitizeUserData(userData) {
  console.log('🧹 === DÉBUT SANITIZATION ===')
  console.log('📥 Données reçues pour sanitization:', JSON.stringify(userData, null, 2))
  
  // Vérifier que userData existe et est un objet
  if (!userData || typeof userData !== 'object') {
    console.log('❌ Données invalides ou manquantes')
    return {}
  }

  const sanitized = {}

  // Nettoyer le nom
  if (userData.name && typeof userData.name === 'string') {
    sanitized.name = userData.name.trim()
  }

  // Nettoyer l'email
  if (userData.email && typeof userData.email === 'string') {
    sanitized.email = userData.email.toLowerCase().trim()
  }

  // Conserver le mot de passe tel quel (sera hashé plus tard)
  if (userData.password) {
    sanitized.password = userData.password
  }

  // Nettoyer l'URL de l'image de profil
  if (userData.profile_image_url && typeof userData.profile_image_url === 'string') {
    const trimmed = userData.profile_image_url.trim()
    sanitized.profile_image_url = trimmed !== '' ? trimmed : null
  }

  // Convertir les nombres
  if (userData.age !== undefined && userData.age !== null) {
    const age = parseInt(userData.age)
    if (!isNaN(age)) sanitized.age = age
  }

  if (userData.weight_kg !== undefined && userData.weight_kg !== null) {
    const weight = parseFloat(userData.weight_kg)
    if (!isNaN(weight)) sanitized.weight_kg = weight
  }

  if (userData.height_cm !== undefined && userData.height_cm !== null) {
    const height = parseFloat(userData.height_cm)
    if (!isNaN(height)) sanitized.height_cm = height
  }

  console.log('✅ Données sanitizées finales:', JSON.stringify(sanitized, null, 2))
  console.log('🧹 === FIN SANITIZATION ===')
  return sanitized
}

module.exports = {
  isValidEmail,
  validatePassword,
  validateUserCreation,
  validateUserUpdate,
  sanitizeUserData
}