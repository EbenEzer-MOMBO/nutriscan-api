/**
 * Script de test pour diagnostiquer les problèmes d'accès à la base de données
 */

// Charger les variables d'environnement
require('dotenv').config()

const { supabase, supabaseAdmin } = require('./config/supabase')

async function testDatabaseAccess() {
  console.log('🔍 === TEST D\'ACCÈS À LA BASE DE DONNÉES ===\n')

  // Test 1: Accès avec le client normal
  console.log('📋 Test 1: Accès avec le client Supabase normal')
  try {
    const { data: normalData, error: normalError, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })

    console.log('  Résultat client normal:')
    console.log('  - Nombre d\'utilisateurs:', count)
    console.log('  - Données:', normalData ? normalData.length : 0, 'lignes')
    console.log('  - Erreur:', normalError ? normalError.message : 'Aucune')
    
    if (normalData && normalData.length > 0) {
      console.log('  - Premier utilisateur:', normalData[0].email)
    }
  } catch (error) {
    console.log('  ❌ Erreur client normal:', error.message)
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // Test 2: Accès avec le client admin (si disponible)
  if (supabaseAdmin) {
    console.log('📋 Test 2: Accès avec le client Supabase Admin')
    try {
      const { data: adminData, error: adminError, count: adminCount } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact' })

      console.log('  Résultat client admin:')
      console.log('  - Nombre d\'utilisateurs:', adminCount)
      console.log('  - Données:', adminData ? adminData.length : 0, 'lignes')
      console.log('  - Erreur:', adminError ? adminError.message : 'Aucune')
      
      if (adminData && adminData.length > 0) {
        console.log('  - Premier utilisateur:', adminData[0].email)
        console.log('  - Utilisateurs trouvés:')
        adminData.forEach((user, index) => {
          console.log(`    ${index + 1}. ${user.email} (ID: ${user.id}, Actif: ${user.is_active})`)
        })
      }
    } catch (error) {
      console.log('  ❌ Erreur client admin:', error.message)
    }
  } else {
    console.log('📋 Test 2: Client Admin non disponible')
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // Test 3: Test de recherche spécifique
  console.log('📋 Test 3: Recherche spécifique par email')
  const testEmail = 'ebenezermombo@gmail.com'
  
  try {
    // Avec client normal
    const { data: specificNormal, error: errorNormal } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)

    console.log(`  Recherche "${testEmail}" (client normal):`)
    console.log('  - Résultats:', specificNormal ? specificNormal.length : 0)
    console.log('  - Erreur:', errorNormal ? errorNormal.message : 'Aucune')

    // Avec client admin si disponible
    if (supabaseAdmin) {
      const { data: specificAdmin, error: errorAdmin } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', testEmail)

      console.log(`  Recherche "${testEmail}" (client admin):`)
      console.log('  - Résultats:', specificAdmin ? specificAdmin.length : 0)
      console.log('  - Erreur:', errorAdmin ? errorAdmin.message : 'Aucune')
      
      if (specificAdmin && specificAdmin.length > 0) {
        const user = specificAdmin[0]
        console.log('  - Utilisateur trouvé:')
        console.log(`    Email: ${user.email}`)
        console.log(`    ID: ${user.id}`)
        console.log(`    Actif: ${user.is_active}`)
        console.log(`    Password hash: ${user.password_hash ? 'Présent' : 'Absent'}`)
      }
    }
  } catch (error) {
    console.log('  ❌ Erreur recherche spécifique:', error.message)
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // Test 4: Informations sur la configuration
  console.log('📋 Test 4: Configuration Supabase')
  console.log('  - Client normal configuré:', !!supabase)
  console.log('  - Client admin configuré:', !!supabaseAdmin)
  console.log('  - URL Supabase:', process.env.SUPABASE_URL ? 'Configurée' : 'Manquante')
  console.log('  - Clé publique:', process.env.SUPABASE_ANON_KEY ? 'Configurée' : 'Manquante')
  console.log('  - Clé service:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurée' : 'Manquante')
}

// Exécuter les tests
testDatabaseAccess()
  .then(() => {
    console.log('\n✅ Tests terminés')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n💥 Erreur lors des tests:', error)
    process.exit(1)
  })