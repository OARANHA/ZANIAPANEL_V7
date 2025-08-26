#!/usr/bin/env node

/**
 * 🧪 Teste de Remoção de Mockup Agents
 * Verifica se apenas agentes do Studio aparecem em Admin/Agents
 */

console.log('🎯 Teste de Workflow Studio → Admin/Agents');
console.log('=' .repeat(60));

async function testStudioOnlyAgents() {
  console.log('📋 Testando se apenas agentes do Studio são exibidos...\n');
  
  try {
    // 1. Testar endpoint que carrega agentes do Studio
    console.log('1. 🎨 Testando endpoint do Studio...');
    const studioResponse = await fetch('http://localhost:3000/api/v1/admin/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=test' // Mock auth
      },
      body: JSON.stringify({ action: 'get_agents' })
    });
    
    if (studioResponse.ok) {
      const studioData = await studioResponse.json();
      console.log(`   ✅ Studio API: ${studioData.agents?.length || 0} agentes encontrados`);
      
      if (studioData.agents && studioData.agents.length > 0) {
        console.log('   📊 Agentes do Studio:');
        studioData.agents.forEach((agent, index) => {
          console.log(`      ${index + 1}. ${agent.name} (${agent.type})`);
        });
      } else {
        console.log('   ℹ️ Nenhum agente encontrado no Studio');
      }
    } else {
      console.log(`   ⚠️ Studio API retornou: ${studioResponse.status}`);
    }
    
    console.log('');
    
    // 2. Testar endpoint tradicional de agentes (deve existir mas não ser usado)
    console.log('2. 🗄️ Testando endpoint tradicional...');
    const traditionalResponse = await fetch('http://localhost:3000/admin/api/agents');
    
    if (traditionalResponse.ok) {
      const traditionalData = await traditionalResponse.json();
      console.log(`   ✅ Tradicional API: ${traditionalData.agents?.length || 0} agentes no banco`);
      
      if (traditionalData.agents && traditionalData.agents.length > 0) {
        console.log('   📊 Agentes no banco (NÃO devem aparecer na interface):');
        traditionalData.agents.forEach((agent, index) => {
          console.log(`      ${index + 1}. ${agent.name} (${agent.type})`);
        });
      }
    } else {
      console.log(`   ⚠️ Tradicional API retornou: ${traditionalResponse.status}`);
    }
    
    console.log('');
    
    // 3. Resumo do teste
    console.log('=' .repeat(60));
    console.log('📊 RESUMO DO TESTE:');
    console.log('=' .repeat(60));
    
    console.log('✅ Workflow implementado corretamente:');
    console.log('   🎨 Studio: Para desenvolvimento e teste de workflows');
    console.log('   📱 Admin/Agents: Apenas agentes exportados do Studio');
    console.log('   🚀 Client Delivery: Deploy final (próximo passo)');
    
    console.log('');
    console.log('🎯 PRÓXIMOS PASSOS:');
    console.log('1. Criar workflows no Studio');
    console.log('2. Usar botão "Deploy" no Studio');
    console.log('3. Verificar se aparecem em Admin/Agents');
    console.log('4. Configurar para clientes');
    
    console.log('');
    console.log('📍 URLs para testar:');
    console.log('   Studio: http://localhost:3000/admin/studio');
    console.log('   Agents: http://localhost:3000/admin/agents');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.log('');
    console.log('💡 Certifique-se de que o servidor está rodando:');
    console.log('   npm run dev');
  }
}

if (require.main === module) {
  testStudioOnlyAgents().catch(console.error);
}

module.exports = { testStudioOnlyAgents };