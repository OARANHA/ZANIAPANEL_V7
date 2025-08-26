const testData = {
  action: 'create_from_studio',
  data: {
    name: 'Agente de Teste',
    description: 'Agente criado para teste do deploy do Studio',
    type: 'workflow',
    category: 'chatflow',
    workflowConfig: {
      flowiseId: 'test-workflow-123',
      flowData: JSON.stringify({
        nodes: [
          { id: 'node1', type: 'LLMChain', data: { name: 'Chat Principal' } },
          { id: 'node2', type: 'Memory', data: { name: 'Memória' } }
        ],
        edges: [
          { id: 'edge1', source: 'node1', target: 'node2' }
        ]
      }),
      nodeCount: 2,
      edgeCount: 1,
      complexityScore: 45
    },
    metadata: {
      sourceStudio: true,
      createdFrom: 'workflow-editor',
      version: '1.0'
    },
    clientConfig: {
      pricing: {
        type: 'free',
        maxMessages: 100
      }
    }
  }
};

async function testAPI() {
  try {
    console.log('🧪 Testando API de criação de agentes...');
    
    const response = await fetch('http://localhost:3000/api/v1/admin/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Teste bem-sucedido!');
      console.log('📄 Resposta:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Teste falhou!');
      console.log('📄 Erro:', JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.log('💥 Erro no teste:', error.message);
  }
}

testAPI();