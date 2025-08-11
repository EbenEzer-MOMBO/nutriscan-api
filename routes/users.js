/**
 * Routes pour la gestion des utilisateurs
 * Définit toutes les routes API pour les opérations utilisateur
 */

const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

// Middleware de logging spécifique aux routes utilisateur
router.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - Route utilisateur: ${req.method} ${req.originalUrl}`)
  next()
})

/**
 * @route   POST /api/users
 * @desc    Créer un nouvel utilisateur
 * @access  Public
 * @body    {name, email, password, age?, weight_kg?, height_cm?, profile_image_url?}
 */
router.post('/', userController.createUser)

/**
 * @route   GET /api/users
 * @desc    Obtenir tous les utilisateurs (avec pagination)
 * @access  Admin (à implémenter avec middleware d'auth)
 * @query   {page?, limit?}
 */
router.get('/', userController.getAllUsers)

/**
 * @route   GET /api/users/:id
 * @desc    Obtenir un utilisateur par son ID
 * @access  Private (utilisateur connecté ou admin)
 * @params  {id} - UUID de l'utilisateur
 */
router.get('/:id', userController.getUserById)

/**
 * @route   GET /api/users/email/:email
 * @desc    Obtenir un utilisateur par son email
 * @access  Private (utilisateur connecté ou admin)
 * @params  {email} - Email de l'utilisateur
 */
router.get('/email/:email', userController.getUserByEmail)

/**
 * @route   PUT /api/users/:id
 * @desc    Mettre à jour un utilisateur
 * @access  Private (utilisateur connecté)
 * @params  {id} - UUID de l'utilisateur
 * @body    {name?, password?, age?, weight_kg?, height_cm?, profile_image_url?}
 */
router.put('/:id', userController.updateUser)

/**
 * @route   DELETE /api/users/:id
 * @desc    Désactiver un utilisateur (soft delete)
 * @access  Private (utilisateur connecté ou admin)
 * @params  {id} - UUID de l'utilisateur
 */
router.delete('/:id', userController.deactivateUser)

/**
 * @route   POST /api/users/:id/verify-password
 * @desc    Vérifier le mot de passe d'un utilisateur
 * @access  Private (utilisateur connecté)
 * @params  {id} - UUID de l'utilisateur
 * @body    {email, password}
 */
router.post('/:id/verify-password', userController.verifyPassword)

/**
 * @route   GET /api/users/:id/stats
 * @desc    Obtenir les statistiques d'un utilisateur (IMC, etc.)
 * @access  Private (utilisateur connecté)
 * @params  {id} - UUID de l'utilisateur
 */
router.get('/:id/stats', userController.getUserStats)

// Gestionnaire d'erreur spécifique aux routes utilisateur
router.use((err, req, res, next) => {
  console.error('Erreur dans les routes utilisateur:', err)
  res.status(500).json({
    error: 'Erreur dans les routes utilisateur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  })
})

module.exports = router