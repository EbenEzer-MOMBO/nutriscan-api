/**
 * Modèle User - Gestion des utilisateurs de NutriScan
 * Ce modèle gère toutes les opérations CRUD pour les utilisateurs
 */

const { supabase, supabaseAdmin } = require('../config/supabase')
const bcrypt = require('bcrypt')
const { generateVerificationToken, sendWelcomeEmail } = require('../services/emailService')

class User {
  constructor(userData = {}) {
    this.id = userData.id || null
    this.name = userData.name || null
    this.email = userData.email || null
    this.password_hash = userData.password_hash || null
    this.profile_image_url = userData.profile_image_url || null
    this.age = userData.age || null
    this.weight_kg = userData.weight_kg || null
    this.height_cm = userData.height_cm || null
    this.created_at = userData.created_at || null
    this.updated_at = userData.updated_at || null
    this.is_active = userData.is_active !== undefined ? userData.is_active : true
  }

  /**
   * Créer un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @param {string} userData.name - Nom de l'utilisateur
   * @param {string} userData.email - Email de l'utilisateur
   * @param {string} userData.password - Mot de passe en clair
   * @param {number} userData.age - Âge de l'utilisateur
   * @param {number} userData.weight_kg - Poids en kg
   * @param {number} userData.height_cm - Taille en cm
   * @returns {Promise<Object>} Utilisateur créé ou erreur
   */
  static async create(userData) {
    try {
      // Validation des données requises
      if (!userData.name || !userData.email || !userData.password) {
        throw new Error('Nom, email et mot de passe sont requis')
      }

      // Vérifier si l'email existe déjà
      const existingUser = await this.findByEmail(userData.email)
      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà')
      }

      // Hasher le mot de passe
      const saltRounds = 12
      const password_hash = await bcrypt.hash(userData.password, saltRounds)

      // Générer un token de vérification
      const verificationToken = generateVerificationToken()
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures

      // Préparer les données pour l'insertion
      const userToInsert = {
        name: userData.name.trim(),
        email: userData.email.toLowerCase().trim(),
        password_hash,
        profile_image_url: userData.profile_image_url || null,
        age: userData.age || null,
        weight_kg: userData.weight_kg || null,
        height_cm: userData.height_cm || null,
        is_active: false, // Compte inactif jusqu'à vérification
        verification_token: verificationToken,
        verification_expires: verificationExpires.toISOString()
      }

      // Insérer l'utilisateur dans la base de données avec le client admin pour contourner RLS
      const client = supabaseAdmin || supabase // Utiliser admin si disponible, sinon client normal
      const { data, error } = await client
        .from('users')
        .insert([userToInsert])
        .select('id, name, email, profile_image_url, age, weight_kg, height_cm, created_at, updated_at, is_active')
        .single()

      if (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error)
        throw new Error('Erreur lors de la création de l\'utilisateur')
      }

      // Envoyer l'email de bienvenue avec le token de vérification
      try {
        await sendWelcomeEmail(data.email, data.name, verificationToken)
        console.log('✅ Email de bienvenue envoyé à:', data.email)
      } catch (emailError) {
        console.error('⚠️ Erreur envoi email (utilisateur créé):', emailError.message)
        // Ne pas faire échouer la création si l'email échoue
      }

      return new User(data)
    } catch (error) {
      throw error
    }
  }

  /**
   * Trouver un utilisateur par son ID
   * @param {string} id - ID de l'utilisateur
   * @returns {Promise<User|null>} Utilisateur trouvé ou null
   */
  static async findById(id) {
    try {
      // Utiliser le client admin pour contourner RLS
      const client = supabaseAdmin || supabase
      const { data, error } = await client
        .from('users')
        .select('id, name, email, profile_image_url, age, weight_kg, height_cm, created_at, updated_at, is_active')
        .eq('id', id)
        .single()

      if (error || !data) {
        return null
      }

      return new User(data)
    } catch (error) {
      console.error('Erreur lors de la recherche par ID:', error)
      return null
    }
  }

  /**
   * Vérifier un compte utilisateur avec le token de vérification
   * @param {string} verificationToken - Token de vérification
   * @returns {Promise<Object>} Résultat de la vérification
   */
  static async verifyAccount(verificationToken) {
    try {
      const { sendAccountActivatedEmail } = require('../services/emailService')
      
      // Chercher l'utilisateur avec ce token
      const client = supabaseAdmin || supabase
      const { data: user, error: findError } = await client
        .from('users')
        .select('*')
        .eq('verification_token', verificationToken)
        .single()

      if (findError || !user) {
        return { success: false, message: 'Token de vérification invalide' }
      }

      // Vérifier si le token n'a pas expiré
      const now = new Date()
      const expirationDate = new Date(user.verification_expires)
      
      if (now > expirationDate) {
        return { success: false, message: 'Token de vérification expiré' }
      }

      // Vérifier si le compte n'est pas déjà activé
      if (user.is_active) {
        return { success: false, message: 'Compte déjà activé' }
      }

      // Activer le compte
      const { data: updatedUser, error: updateError } = await client
        .from('users')
        .update({
          is_active: true,
          verification_token: null,
          verification_expires: null,
          verified_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select('id, name, email, profile_image_url, age, weight_kg, height_cm, created_at, updated_at, is_active')
        .single()

      if (updateError) {
        console.error('Erreur lors de l\'activation:', updateError)
        return { success: false, message: 'Erreur lors de l\'activation du compte' }
      }

      // Envoyer l'email de confirmation d'activation
      try {
        await sendAccountActivatedEmail(updatedUser.email, updatedUser.name)
        console.log('✅ Email d\'activation envoyé à:', updatedUser.email)
      } catch (emailError) {
        console.error('⚠️ Erreur envoi email activation:', emailError.message)
        // Ne pas faire échouer l'activation si l'email échoue
      }

      return { 
        success: true, 
        message: 'Compte activé avec succès',
        user: new User(updatedUser)
      }

    } catch (error) {
      console.error('Erreur lors de la vérification:', error)
      return { success: false, message: 'Erreur lors de la vérification du compte' }
    }
  }

  /**
   * Trouver un utilisateur par son email
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<User|null>} Utilisateur trouvé ou null
   */
  static async findByEmail(email) {
    try {
      const cleanEmail = email.toLowerCase().trim()
      console.log('🔍 Recherche utilisateur avec email:', cleanEmail)
      
      // Utiliser le client admin pour contourner RLS
      const client = supabaseAdmin || supabase
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .single()

      console.log('📊 Résultat requête Supabase:')
      console.log('  - Data:', data ? 'Utilisateur trouvé' : 'Aucun utilisateur')
      console.log('  - Error:', error)

      if (error) {
        console.log('❌ Erreur Supabase:', error.message, error.code)
        return null
      }

      if (!data) {
        console.log('❌ Aucune donnée retournée')
        return null
      }

      console.log('✅ Utilisateur trouvé:', data.email, 'ID:', data.id)
      return new User(data)
    } catch (error) {
      console.error('💥 Erreur lors de la recherche par email:', error)
      return null
    }
  }

  /**
   * Vérifier le mot de passe d'un utilisateur
   * @param {string} password - Mot de passe en clair
   * @returns {Promise<boolean>} True si le mot de passe est correct
   */
  async verifyPassword(password) {
    try {
      if (!this.password_hash) {
        return false
      }
      return await bcrypt.compare(password, this.password_hash)
    } catch (error) {
      console.error('Erreur lors de la vérification du mot de passe:', error)
      return false
    }
  }

  /**
   * Mettre à jour les informations de l'utilisateur
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Promise<User>} Utilisateur mis à jour
   */
  async update(updateData) {
    try {
      // Préparer les données à mettre à jour
      const allowedFields = ['name', 'profile_image_url', 'age', 'weight_kg', 'height_cm']
      const dataToUpdate = {}

      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          dataToUpdate[field] = updateData[field]
        }
      })

      // Si un nouveau mot de passe est fourni
      if (updateData.password) {
        const saltRounds = 12
        dataToUpdate.password_hash = await bcrypt.hash(updateData.password, saltRounds)
      }

      if (Object.keys(dataToUpdate).length === 0) {
        throw new Error('Aucune donnée à mettre à jour')
      }

      const { data, error } = await supabase
        .from('users')
        .update(dataToUpdate)
        .eq('id', this.id)
        .select('id, name, email, profile_image_url, age, weight_kg, height_cm, created_at, updated_at, is_active')
        .single()

      if (error) {
        console.error('Erreur lors de la mise à jour:', error)
        throw new Error('Erreur lors de la mise à jour de l\'utilisateur')
      }

      // Mettre à jour l'instance actuelle
      Object.assign(this, data)
      return this
    } catch (error) {
      throw error
    }
  }

  /**
   * Désactiver un utilisateur (soft delete)
   * @returns {Promise<boolean>} True si la désactivation a réussi
   */
  async deactivate() {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', this.id)

      if (error) {
        console.error('Erreur lors de la désactivation:', error)
        return false
      }

      this.is_active = false
      return true
    } catch (error) {
      console.error('Erreur lors de la désactivation:', error)
      return false
    }
  }

  /**
   * Calculer l'IMC de l'utilisateur
   * @returns {number|null} IMC calculé ou null si données manquantes
   */
  calculateBMI() {
    if (!this.weight_kg || !this.height_cm) {
      return null
    }
    const heightInMeters = this.height_cm / 100
    return parseFloat((this.weight_kg / (heightInMeters * heightInMeters)).toFixed(2))
  }

  /**
   * Obtenir le statut de poids basé sur l'IMC
   * @returns {string|null} Statut de poids ou null
   */
  getWeightStatus() {
    const bmi = this.calculateBMI()
    if (!bmi) return null

    if (bmi < 18.5) return 'Insuffisance pondérale'
    if (bmi < 25) return 'Poids normal'
    if (bmi < 30) return 'Surpoids'
    return 'Obésité'
  }

  /**
   * Convertir l'utilisateur en objet JSON (sans le mot de passe)
   * @returns {Object} Données publiques de l'utilisateur
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      profile_image_url: this.profile_image_url,
      age: this.age,
      weight_kg: this.weight_kg,
      height_cm: this.height_cm,
      created_at: this.created_at,
      updated_at: this.updated_at,
      is_active: this.is_active,
      bmi: this.calculateBMI(),
      weight_status: this.getWeightStatus()
    }
  }

  /**
   * Définir un token de réinitialisation de mot de passe
   * @param {string} resetToken - Token de réinitialisation
   * @param {Date} expiresAt - Date d'expiration du token
   * @returns {Promise<boolean>} True si la mise à jour a réussi
   */
  async setPasswordResetToken(resetToken, expiresAt) {
    try {
      // Utiliser le client admin pour contourner RLS
      const client = supabaseAdmin || supabase
      const { error } = await client
        .from('users')
        .update({
          password_reset_token: resetToken,
          password_reset_expires: expiresAt.toISOString()
        })
        .eq('id', this.id)

      if (error) {
        console.error('Erreur lors de la définition du token de réinitialisation:', error)
        return false
      }

      this.password_reset_token = resetToken
      this.password_reset_expires = expiresAt.toISOString()
      return true
    } catch (error) {
      console.error('Erreur lors de la définition du token de réinitialisation:', error)
      return false
    }
  }

  /**
   * Trouver un utilisateur par son token de réinitialisation
   * @param {string} resetToken - Token de réinitialisation
   * @returns {Promise<User|null>} Utilisateur trouvé ou null
   */
  static async findByPasswordResetToken(resetToken) {
    try {
      // Utiliser le client admin pour contourner RLS
      const client = supabaseAdmin || supabase
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('password_reset_token', resetToken)
        .gt('password_reset_expires', new Date().toISOString())
        .single()

      if (error || !data) {
        return null
      }

      return new User(data)
    } catch (error) {
      console.error('Erreur lors de la recherche par token de réinitialisation:', error)
      return null
    }
  }

  /**
   * Réinitialiser le mot de passe avec un nouveau mot de passe
   * @param {string} newPassword - Nouveau mot de passe
   * @returns {Promise<boolean>} True si la réinitialisation a réussi
   */
  async resetPassword(newPassword) {
    try {
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

      // Utiliser le client admin pour contourner RLS
      const client = supabaseAdmin || supabase
      const { error } = await client
        .from('users')
        .update({
          password_hash: hashedPassword,
          password_reset_token: null,
          password_reset_expires: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.id)

      if (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe:', error)
        return false
      }

      // Mettre à jour l'instance
      this.password_hash = hashedPassword
      this.password_reset_token = null
      this.password_reset_expires = null
      this.updated_at = new Date().toISOString()

      return true
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error)
      return false
    }
  }

  /**
   * Lister tous les utilisateurs actifs (admin uniquement)
   * @param {Object} options - Options de pagination
   * @param {number} options.page - Numéro de page
   * @param {number} options.limit - Nombre d'éléments par page
   * @returns {Promise<Object>} Liste des utilisateurs avec pagination
   */
  static async findAll(options = {}) {
    try {
      const page = options.page || 1
      const limit = Math.min(options.limit || 10, 100) // Max 100 par page
      const offset = (page - 1) * limit

      // Utiliser le client admin pour contourner RLS
      const client = supabaseAdmin || supabase
      const { data, error, count } = await client
        .from('users')
        .select('id, name, email, profile_image_url, age, weight_kg, height_cm, created_at, updated_at, is_active', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        throw new Error('Erreur lors de la récupération des utilisateurs')
      }

      return {
        users: data.map(userData => new User(userData)),
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    } catch (error) {
      throw error
    }
  }
}

module.exports = User