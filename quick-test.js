// Test rapide de l'API NutriScan
const http = require('http')

function testAPI() {
  console.log('🧪 Test de l\'API NutriScan...')
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
  }

  const req = http.request(options, (res) => {
    console.log(`✅ Statut: ${res.statusCode}`)
    console.log(`📋 Headers:`, res.headers)
    
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    
    res.on('end', () => {
      console.log('📄 Réponse:')
      try {
        const jsonData = JSON.parse(data)
        console.log(JSON.stringify(jsonData, null, 2))
      } catch (e) {
        console.log(data)
      }
    })
  })

  req.on('error', (e) => {
    console.error(`❌ Erreur: ${e.message}`)
  })

  req.end()
}

// Attendre un peu puis tester
setTimeout(testAPI, 2000)