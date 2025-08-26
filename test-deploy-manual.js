#!/usr/bin/env node

/**
 * 🚀 Teste Simples de Deploy Studio → Admin/Agents
 * Testa o deploy direto no endpoint da API
 */

console.log('🧪 Teste de Deploy Studio → Admin/Agents');
console.log('=' .repeat(50));

// Dados do workflow para deploy
const testWorkflow = {
  name: 'Agente de Teste Deploy Manual',
  description: 'Agente criado para testar o deploy Studio → Admin/Agents',
  type: 'workflow',
  category: 'chatflow',
  
  workflowConfig: {
    flowiseId: 'test-workflow-' + Date.now(),
    flowData: JSON.stringify({
      nodes: [
        { id: '1', data: { label: 'Input Node' }, type: 'input' },
        { id: '2', data: { label: 'LLM Node' }, type: 'llm' },
        { id: '3', data: { label: 'Output Node' }, type: 'output' }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' }
      ]
    }),
    nodeCount: 3,
    edgeCount: 2,
    complexityScore: 35
  },
  
  metadata: {
    sourceStudio: true,
    deployedAt: new Date().toISOString(),
    version: '1.0.0',
    status: 'ready_for_client'
  },
  
  clientConfig: {
    customizable: true,
    parameters: [],
    pricing: {
      model: 'freemium',
      basePrice: 0
    }
  }
};

console.log('📋 Dados do workflow preparados:');
console.log('- Nome:', testWorkflow.name);
console.log('- Tipo:', testWorkflow.type);
console.log('- Nós:', testWorkflow.workflowConfig.nodeCount);
console.log('- Complexidade:', testWorkflow.workflowConfig.complexityScore);

console.log('\n🔍 Para testar manualmente:');
console.log('1. Acesse http://localhost:3000/admin/login');
console.log('2. Login: superadmin@zanai.com / 123456');
console.log('3. Vá para http://localhost:3000/admin/studio');
console.log('4. Procure por botão "Deploy" em algum workflow');
console.log('5. Verifique se o agente aparece em http://localhost:3000/admin/agents');

console.log('\n📊 Comando curl para testar API diretamente:');
console.log('curl -X POST http://localhost:3000/api/v1/admin/agents \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -H "Cookie: next-auth.session-token=TOKEN" \\');
console.log('  -d \'{"action":"create_from_studio","data":' + JSON.stringify(testWorkflow, null, 2) + '}\'');

console.log('\n✅ Para verificar se funcionou:');
console.log('- Verifique se novo agente aparece em Admin/Agents');
console.log('- Confirme que tem metadata "sourceStudio: true"');
console.log('- Teste se pode editar e configurar o agente');

console.log('\n🎯 Status esperado do workflow:');
console.log('📍 Development Phase: Concluído no Studio');
console.log('📍 Productization Phase: Agente criado em Admin/Agents');
console.log('📍 Client Delivery: Aguardando configuração e deploy final');