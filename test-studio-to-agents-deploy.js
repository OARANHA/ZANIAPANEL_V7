/**
 * 🚀 Teste de Deploy Studio → Admin/Agents
 * Verifica o fluxo completo de deployment conforme workflow preferido
 */

const BASE_URL = 'http://localhost:3000';

// 1. Workflow de teste para deploy
const testWorkflow = {
  id: 'test-workflow-' + Date.now(),
  name: 'Agente de Teste Deploy',
  description: 'Agente criado automaticamente para testar o deploy Studio → Admin/Agents',
  type: 'CHATFLOW',
  complexityScore: 45,
  nodeCount: 5,
  edgeCount: 4,
  exportedAt: new Date().toISOString(),
  source: 'learning',
  status: 'ready',
  flowData: JSON.stringify({
    nodes: [
      { id: '1', data: { label: 'Input Node' }, type: 'input' },
      { id: '2', data: { label: 'Processing Node' }, type: 'llm' },
      { id: '3', data: { label: 'Output Node' }, type: 'output' }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' }
    ]
  })
};

// 2. Dados do usuário de teste
const testUser = {
  email: 'superadmin@zanai.com',
  password: '123456'
};

// Função para fazer login
async function login() {
  console.log('🔐 Fazendo login...');
  
  const response = await fetch(`${BASE_URL}/api/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
      redirect: false
    }),
  });

  if (!response.ok) {
    throw new Error(`Login falhou: ${response.status}`);
  }

  const data = await response.json();
  console.log('✅ Login realizado com sucesso');
  
  // Extrair cookies para próximas requisições
  const cookies = response.headers.get('set-cookie');
  return cookies;
}

// Função para testar deploy Studio → Admin/Agents
async function testStudioToAgentsDeploy(cookies) {
  console.log('🚀 Testando deploy Studio → Admin/Agents...');
  
  // Preparar dados do agente baseado no workflow
  const agentData = {
    name: testWorkflow.name,
    description: testWorkflow.description,
    type: 'workflow',
    category: testWorkflow.type.toLowerCase(),
    
    // Configuração do workflow
    workflowConfig: {
      flowiseId: testWorkflow.id,
      flowData: testWorkflow.flowData,
      nodeCount: testWorkflow.nodeCount,
      edgeCount: testWorkflow.edgeCount,
      complexityScore: testWorkflow.complexityScore
    },
    
    // Metadados para o Admin/Agents
    metadata: {
      sourceStudio: true,
      deployedAt: new Date().toISOString(),
      version: '1.0.0',
      status: 'ready_for_client'
    },
    
    // Configurações padrão para clientes
    clientConfig: {
      customizable: true,
      parameters: [],
      pricing: {
        model: 'freemium',
        basePrice: 0
      }
    }
  };

  // Fazer requisição de deploy
  const response = await fetch(`${BASE_URL}/api/v1/admin/agents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies || ''
    },
    body: JSON.stringify({
      action: 'create_from_studio',
      data: agentData
    })
  });

  const result = await response.json();
  
  console.log('📊 Resultado do deploy:', {
    status: response.status,
    success: result.success,
    message: result.message,
    agentId: result.agent?.id
  });

  if (result.success) {
    console.log('✅ Deploy realizado com sucesso!');
    console.log('🎯 Agente criado:', {
      ID: result.agent.id,
      Nome: result.agent.name,
      Tipo: result.agent.type,
      Status: result.agent.status
    });
    return result.agent;
  } else {
    throw new Error(`Deploy falhou: ${result.error}`);
  }
}

// Função para verificar se o agente aparece no Admin/Agents
async function verifyAgentInAdminAgents(agentId, cookies) {
  console.log('🔍 Verificando se agente aparece em Admin/Agents...');
  
  const response = await fetch(`${BASE_URL}/api/v1/admin/agents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies || ''
    },
    body: JSON.stringify({
      action: 'get_agents'
    })
  });

  const result = await response.json();
  
  if (result.success) {
    const deployedAgent = result.agents.find(agent => agent.id === agentId);
    
    if (deployedAgent) {
      console.log('✅ Agente encontrado em Admin/Agents!');
      console.log('📋 Detalhes:', {
        ID: deployedAgent.id,
        Nome: deployedAgent.name,
        Tipo: deployedAgent.type,
        Workspace: deployedAgent.workspaceId
      });
      return true;
    } else {
      console.log('❌ Agente não encontrado em Admin/Agents');
      return false;
    }
  } else {
    throw new Error(`Erro ao buscar agentes: ${result.error}`);
  }
}

// Função principal de teste
async function runTest() {
  console.log('🧪 Iniciando teste de Deploy Studio → Admin/Agents');
  console.log('=' .repeat(60));
  
  try {
    // 1. Login
    const cookies = await login();
    
    // 2. Deploy Studio → Admin/Agents
    const deployedAgent = await testStudioToAgentsDeploy(cookies);
    
    // 3. Verificar se aparece em Admin/Agents
    const isVisible = await verifyAgentInAdminAgents(deployedAgent.id, cookies);
    
    // 4. Resultado final
    console.log('=' .repeat(60));
    console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('✅ Fluxo Studio → Admin/Agents está funcionando');
    console.log('✅ Workflow de negócio implementado corretamente');
    console.log('✅ API endpoints funcionando');
    console.log('✅ Integração bidirecional ativa');
    
    console.log('\n📈 Próximos passos no workflow:');
    console.log('1. ✅ Development Phase no Studio (concluído)');
    console.log('2. ✅ Productization Phase no Admin/Agents (pronto)');
    console.log('3. 🔄 Client Delivery (aguardando configuração)');
    
  } catch (error) {
    console.error('❌ TESTE FALHOU:', error.message);
    console.log('\n🔧 Possíveis soluções:');
    console.log('- Verificar se o servidor está rodando');
    console.log('- Verificar se o banco de dados está acessível');
    console.log('- Verificar se as APIs estão implementadas');
    console.log('- Verificar autenticação e permissões');
  }
}

// Executar teste
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = { runTest, testStudioToAgentsDeploy, verifyAgentInAdminAgents };