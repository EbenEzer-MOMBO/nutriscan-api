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

module.exports = {
  generateVerificationToken,
  sendWelcomeEmail,
  sendAccountActivatedEmail
}