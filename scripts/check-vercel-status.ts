async function checkVercelStatus() {
  console.log('🔍 Vérification du statut Vercel...\n')

  const vercelToken = 'x0ttcNvpZEEa9gJKK7VmeTie'
  const projectId = 'prj_YAeVQA9wLwL8L5uKopqZiWkMKJud'

  try {
    // 1. Récupérer les infos du projet
    console.log('1️⃣ Informations du projet Vercel...')
    const projectResponse = await fetch(
      `https://api.vercel.com/v9/projects/${projectId}`,
      {
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
        },
      }
    )

    if (!projectResponse.ok) {
      throw new Error(`Erreur API Vercel: ${projectResponse.status}`)
    }

    const project = await projectResponse.json()
    
    console.log(`   Nom: ${project.name}`)
    console.log(`   URL: https://${project.name}.vercel.app`)
    console.log(`   Framework: ${project.framework || 'N/A'}`)
    
    if (project.link) {
      console.log(`   Repo GitHub: ${project.link.repo || 'Non connecté'}`)
      console.log(`   Type: ${project.link.type || 'N/A'}`)
    } else {
      console.log(`   ⚠️ Aucun repository connecté`)
    }
    console.log('')

    // 2. Récupérer les derniers déploiements
    console.log('2️⃣ Derniers déploiements...')
    const deploymentsResponse = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=3`,
      {
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
        },
      }
    )

    if (!deploymentsResponse.ok) {
      throw new Error(`Erreur récupération déploiements: ${deploymentsResponse.status}`)
    }

    const { deployments } = await deploymentsResponse.json()

    if (deployments && deployments.length > 0) {
      deployments.forEach((deployment: any, index: number) => {
        const status = deployment.readyState === 'READY' ? '✅' : 
                      deployment.readyState === 'ERROR' ? '❌' : 
                      deployment.readyState === 'BUILDING' ? '🔨' : '⏳'
        
        console.log(`   ${status} ${deployment.readyState}`)
        console.log(`      URL: https://${deployment.url}`)
        console.log(`      Date: ${new Date(deployment.created).toLocaleString()}`)
        if (deployment.meta?.githubCommitMessage) {
          console.log(`      Commit: ${deployment.meta.githubCommitMessage}`)
        }
        console.log('')
      })
    } else {
      console.log('   ⚠️ Aucun déploiement trouvé')
    }

    // 3. Recommandations
    console.log('📋 Recommandations:')
    if (!project.link || !project.link.repo) {
      console.log('   ⚠️ Le projet Vercel n\'est pas connecté à GitHub')
      console.log('   → Allez sur https://vercel.com/dashboard')
      console.log('   → Ouvrez le projet "b-photovoltaique"')
      console.log('   → Settings → Git → Reconnectez le repository')
    } else if (project.link.repo !== 'mitch69001/b-photovoltaique') {
      console.log('   ⚠️ Le projet est connecté à un autre repository')
      console.log(`   → Actuellement: ${project.link.repo}`)
      console.log('   → Attendu: mitch69001/b-photovoltaique')
      console.log('   → Reconnectez le bon repository depuis Vercel')
    } else {
      console.log('   ✅ Le projet est correctement connecté à GitHub')
      console.log('   ✅ Les prochains commits déclencheront des déploiements automatiques')
    }

  } catch (error: any) {
    console.error('\n❌ Erreur:', error.message)
    process.exit(1)
  }
}

checkVercelStatus()
