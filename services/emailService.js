/**
 * Service d'envoi d'emails - NutriScan API
 * Gère l'envoi d'emails de bienvenue, vérification et notifications
 */

const { Resend } = require('resend')
const crypto = require('crypto')

// Initialiser Resend avec la clé API
let resend = null
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY)
  console.log('✅ Service email Resend configuré')
} else {
  console.log('⚠️ Clé API Resend non configurée - Emails désactivés')
}

/**
 * Générer un token de vérification sécurisé
 * @returns {string} Token de vérification
 */
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Envoyer un email de bienvenue avec lien de vérification
 * @param {string} email - Email du destinataire
 * @param {string} name - Nom du destinataire
 * @param {string} verificationToken - Token de vérification
 * @returns {Promise<Object>} Résultat de l'envoi
 */
async function sendWelcomeEmail(email, name, verificationToken) {
  try {
    if (!resend) {
      console.log('📧 Simulation envoi email (Resend non configuré)')
      console.log(`📧 Email de bienvenue pour: ${email}`)
      console.log(`📧 Token de vérification: ${verificationToken}`)
      return { success: true, simulated: true }
    }

    const verificationUrl = `${process.env.APP_URL || 'http://localhost:3009'}/api/verify/${verificationToken}`

    const emailContent = {
      from: process.env.FROM_EMAIL || 'noreply@nutriscan.app',
      to: email,
      subject: '🎉 Bienvenue sur NutriScan ! Vérifiez votre compte',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Bienvenue sur NutriScan</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🥗 Bienvenue sur NutriScan !</h1>
              <p>Votre assistant nutritionnel intelligent</p>
            </div>
            <div class="content">
              <h2>Bonjour ${name} ! 👋</h2>
              <p>Merci de vous être inscrit sur NutriScan. Nous sommes ravis de vous accompagner dans votre parcours nutritionnel !</p>
              
              <p><strong>Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</strong></p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">✅ Vérifier mon compte</a>
              </div>
              
              <p>Ou copiez ce lien dans votre navigateur :</p>
              <p style="background: #eee; padding: 10px; border-radius: 5px; word-break: break-all;">
                ${verificationUrl}
              </p>
              
              <p><strong>Ce que vous pouvez faire avec NutriScan :</strong></p>
              <ul>
                <li>📱 Scanner vos aliments pour obtenir des informations nutritionnelles</li>
                <li>📊 Suivre vos apports nutritionnels quotidiens</li>
                <li>🎯 Définir et atteindre vos objectifs santé</li>
                <li>💡 Recevoir des recommandations personnalisées</li>
              </ul>
              
              <p>Si vous n'avez pas créé ce compte, vous pouvez ignorer cet email.</p>
            </div>
            <div class="footer">
              <p>© 2024 NutriScan - Votre santé, notre priorité</p>
              <p>Ce lien de vérification expire dans 24 heures.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    const result = await resend.emails.send(emailContent)
    
    console.log('✅ Email de bienvenue envoyé avec succès:', result.data?.id)
    return { success: true, messageId: result.data?.id }

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Envoyer un email de confirmation après vérification
 * @param {string} email - Email du destinataire
 * @param {string} name - Nom du destinataire
 * @returns {Promise<Object>} Résultat de l'envoi
 */
async function sendAccountActivatedEmail(email, name) {
  try {
    if (!resend) {
      console.log('📧 Simulation email activation (Resend non configuré)')
      return { success: true, simulated: true }
    }

    const emailContent = {
      from: process.env.FROM_EMAIL || 'noreply@nutriscan.app',
      to: email,
      subject: '🎉 Votre compte NutriScan est activé !',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Compte activé - NutriScan</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Compte activé !</h1>
              <p>Bienvenue dans la communauté NutriScan</p>
            </div>
            <div class="content">
              <h2>Félicitations ${name} ! 🎉</h2>
              <p>Votre compte NutriScan a été activé avec succès. Vous pouvez maintenant profiter de toutes nos fonctionnalités !</p>
              
              <p><strong>Prochaines étapes :</strong></p>
              <ul>
                <li>📱 Téléchargez l'application mobile NutriScan</li>
                <li>📊 Complétez votre profil nutritionnel</li>
                <li>🎯 Définissez vos premiers objectifs</li>
                <li>🥗 Commencez à scanner vos premiers aliments</li>
              </ul>
              
              <p>Merci de faire confiance à NutriScan pour votre parcours nutritionnel !</p>
            </div>
            <div class="footer">
              <p>© 2024 NutriScan - Votre santé, notre priorité</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    const result = await resend.emails.send(emailContent)
    
    console.log('✅ Email d\'activation envoyé avec succès:', result.data?.id)
    return { success: true, messageId: result.data?.id }

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email d\'activation:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Envoyer un email de réinitialisation de mot de passe
 * @param {string} email - Email du destinataire
 * @param {string} name - Nom du destinataire
 * @param {string} resetToken - Token de réinitialisation
 * @returns {Promise<Object>} Résultat de l'envoi
 */
async function sendPasswordResetEmail(email, name, resetToken) {
  try {
    if (!resend) {
      console.log('📧 Simulation envoi email réinitialisation (Resend non configuré)')
      console.log(`📧 Email de réinitialisation pour: ${email}`)
      console.log(`📧 Token de réinitialisation: ${resetToken}`)
      return { success: true, simulated: true }
    }

    const resetUrl = `${process.env.APP_URL || 'http://localhost:3009'}/api/auth/password-reset/verify/${resetToken}`

    const emailContent = {
      from: process.env.FROM_EMAIL || 'noreply@nutriscan.app',
      to: email,
      subject: '🔐 Réinitialisation de votre mot de passe NutriScan',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Réinitialisation de mot de passe - NutriScan</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Réinitialisation de mot de passe</h1>
              <p>NutriScan - Sécurité de votre compte</p>
            </div>
            <div class="content">
              <h2>Bonjour ${name} ! 👋</h2>
              <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte NutriScan.</p>
              
              <p><strong>Pour créer un nouveau mot de passe, cliquez sur le bouton ci-dessous :</strong></p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">🔑 Réinitialiser mon mot de passe</a>
              </div>
              
              <p>Ou copiez ce lien dans votre navigateur :</p>
              <p style="background: #eee; padding: 10px; border-radius: 5px; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <div class="warning">
                <p><strong>⚠️ Important :</strong></p>
                <ul>
                  <li>Ce lien expire dans <strong>1 heure</strong></li>
                  <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                  <li>Votre mot de passe actuel reste inchangé tant que vous n'en créez pas un nouveau</li>
                </ul>
              </div>
              
              <p><strong>Conseils pour un mot de passe sécurisé :</strong></p>
              <ul>
                <li>🔤 Au moins 8 caractères</li>
                <li>🔠 Mélange de majuscules et minuscules</li>
                <li>🔢 Inclure des chiffres</li>
                <li>🔣 Ajouter des caractères spéciaux</li>
              </ul>
            </div>
            <div class="footer">
              <p>© 2024 NutriScan - Sécurité et confidentialité</p>
              <p>Si vous avez des questions, contactez notre support.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    const result = await resend.emails.send(emailContent)
    
    console.log('✅ Email de réinitialisation envoyé avec succès:', result.data?.id)
    return { success: true, messageId: result.data?.id }

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de réinitialisation:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Envoyer un email de confirmation après réinitialisation de mot de passe
 * @param {string} email - Email du destinataire
 * @param {string} name - Nom du destinataire
 * @returns {Promise<Object>} Résultat de l'envoi
 */
async function sendPasswordResetConfirmationEmail(email, name) {
  try {
    if (!resend) {
      console.log('📧 Simulation email confirmation réinitialisation (Resend non configuré)')
      return { success: true, simulated: true }
    }

    const emailContent = {
      from: process.env.FROM_EMAIL || 'noreply@nutriscan.app',
      to: email,
      subject: '✅ Votre mot de passe NutriScan a été modifié',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Mot de passe modifié - NutriScan</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .security-info { background: #e8f5e8; border: 1px solid #4CAF50; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Mot de passe modifié</h1>
              <p>NutriScan - Confirmation de sécurité</p>
            </div>
            <div class="content">
              <h2>Bonjour ${name} ! 👋</h2>
              <p>Votre mot de passe NutriScan a été modifié avec succès le <strong>${new Date().toLocaleString('fr-FR')}</strong>.</p>
              
              <div class="security-info">
                <p><strong>🔒 Informations de sécurité :</strong></p>
                <ul>
                  <li>Votre nouveau mot de passe est maintenant actif</li>
                  <li>Vous pouvez vous connecter avec vos nouvelles informations</li>
                  <li>Tous les tokens de réinitialisation précédents ont été invalidés</li>
                </ul>
              </div>
              
              <p><strong>Si vous n'avez pas effectué cette modification :</strong></p>
              <ul>
                <li>🚨 Contactez immédiatement notre support</li>
                <li>🔐 Changez votre mot de passe dès que possible</li>
                <li>📧 Vérifiez vos autres comptes en ligne</li>
              </ul>
              
              <p><strong>Conseils de sécurité :</strong></p>
              <ul>
                <li>🔄 Changez régulièrement vos mots de passe</li>
                <li>🚫 Ne partagez jamais vos informations de connexion</li>
                <li>📱 Activez l'authentification à deux facteurs quand c'est possible</li>
              </ul>
              
              <p>Merci de faire confiance à NutriScan pour votre sécurité !</p>
            </div>
            <div class="footer">
              <p>© 2024 NutriScan - Votre sécurité, notre priorité</p>
              <p>Cet email a été envoyé pour des raisons de sécurité.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    const result = await resend.emails.send(emailContent)
    
    console.log('✅ Email de confirmation de réinitialisation envoyé avec succès:', result.data?.id)
    return { success: true, messageId: result.data?.id }

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de confirmation:', error)
    return { success: false, error: error.message }
  }
}

module.exports = {
  generateVerificationToken,
  sendWelcomeEmail,
  sendAccountActivatedEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail
}