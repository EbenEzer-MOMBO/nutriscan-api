require('dotenv').config()
const axios = require('axios')

const API_BASE_URL = 'http://localhost:3009/api/auth'

/**
 * Script de test pour les fonctionnalités de réinitialisation de mot de passe
 */
async function testPasswordReset() {
  console.log('🧪 Test des fonctionnalités de réinitialisation de mot de passe\n')

  try {
    // Test 1: Demande de réinitialisation avec un email valide
    console.log('📧 Test 1: Demande de réinitialisation avec email valide')
    const resetRequest = await axios.post(`${API_BASE_URL}/password-reset/request`, {
      email: 'ebenezermombo@gmail.com'
    })
    console.log('✅ Réponse:', resetRequest.data)
    console.log('')

    // Test 2: Demande de réinitialisation avec un email invalide
    console.log('📧 Test 2: Demande de réinitialisation avec email invalide')
    try {
      const invalidEmailRequest = await axios.post(`${API_BASE_URL}/password-reset/request`, {
        email: 'email-inexistant@test.com'
      })
      console.log('✅ Réponse (email inexistant):', invalidEmailRequest.data)
    } catch (error) {
      console.log('❌ Erreur:', error.response?.data || error.message)
    }
    console.log('')

    // Test 3: Demande sans email
    console.log('📧 Test 3: Demande sans email')
    try {
      const noEmailRequest = await axios.post(`${API_BASE_URL}/password-reset/request`, {})
      console.log('✅ Réponse:', noEmailRequest.data)
    } catch (error) {
      console.log('❌ Erreur attendue:', error.response?.data || error.message)
    }
    console.log('')

    // Test 4: Vérification d'un token invalide
    console.log('🔍 Test 4: Vérification d\'un token invalide')
    try {
      const invalidTokenVerify = await axios.get(`${API_BASE_URL}/password-reset/verify/token-invalide`)
      console.log('✅ Réponse:', invalidTokenVerify.data)
    } catch (error) {
      console.log('❌ Erreur attendue:', error.response?.data || error.message)
    }
    console.log('')

    // Test 5: Tentative de réinitialisation avec token invalide
    console.log('🔑 Test 5: Réinitialisation avec token invalide')
    try {
      const invalidTokenReset = await axios.post(`${API_BASE_URL}/password-reset/reset/token-invalide`, {
        password: 'NouveauMotDePasse123!',
        confirmPassword: 'NouveauMotDePasse123!'
      })
      console.log('✅ Réponse:', invalidTokenReset.data)
    } catch (error) {
      console.log('❌ Erreur attendue:', error.response?.data || error.message)
    }
    console.log('')

    // Test 6: Réinitialisation avec mots de passe non correspondants
    console.log('🔑 Test 6: Réinitialisation avec mots de passe non correspondants')
    try {
      const mismatchPasswordReset = await axios.post(`${API_BASE_URL}/password-reset/reset/token-test`, {
        password: 'MotDePasse123!',
        confirmPassword: 'AutreMotDePasse123!'
      })
      console.log('✅ Réponse:', mismatchPasswordReset.data)
    } catch (error) {
      console.log('❌ Erreur attendue:', error.response?.data || error.message)
    }
    console.log('')

    console.log('🎉 Tests terminés!')
    console.log('\n📝 Notes importantes:')
    console.log('- Pour tester complètement, vous devrez utiliser un vrai token généré')
    console.log('- Vérifiez votre email pour le lien de réinitialisation')
    console.log('- Les tokens expirent après 1 heure')

  } catch (error) {
    console.error('💥 Erreur lors des tests:', error.message)
  }
}

// Exécuter les tests
testPasswordReset()