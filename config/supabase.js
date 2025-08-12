/**
 * Configuration et initialisation du client Supabase
 * Ce fichier configure la connexion à Supabase avec les variables d'environnement
 */

const { createClient } = require('@supabase/supabase-js')

// Vérification des variables d'environnement requises
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL est requis dans les variables d\'environnement')
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_ANON_KEY est requis dans les variables d\'environnement')
}

// Configuration des options du client Supabase
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
}

// Création du client Supabase avec la clé anonyme (pour les opérations côté client)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  supabaseOptions
)

// Création du client Supabase avec la clé service (pour les opérations administratives)
let supabaseAdmin = null
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('✅ Clé service Supabase configurée - Client admin disponible')
  supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
} else {
  console.log('⚠️ Clé service Supabase non configurée - Utilisation du client anonyme uniquement')
}

module.exports = {
  supabase,
  supabaseAdmin
}