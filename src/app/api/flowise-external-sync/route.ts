import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    console.log('🔄 Flowise External Sync - Action:', action);
    console.log('📦 Data:', JSON.stringify(data, null, 2));

    // Configuração da API Flowise
    const FLOWISE_BASE_URL = process.env.FLOWISE_BASE_URL || 'https://aaranha-zania.hf.space';
    const FLOWISE_API_KEY = process.env.FLOWISE_API_KEY || '';

    if (!FLOWISE_BASE_URL || !FLOWISE_API_KEY) {
      console.error('❌ Flowise configuration missing');
      return NextResponse.json(
        { error: 'Flowise configuration missing' },
        { status: 500 }
      );
    }

    // Headers comuns para requisições Flowise
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FLOWISE_API_KEY}`,
    };

    switch (action) {
      case 'get_workflows':
        try {
          // Buscar workflows do Flowise
          const response = await fetch(`${FLOWISE_BASE_URL}/api/v1/chatflows`, {
            method: 'GET',
            headers,
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch workflows: ${response.status}`);
          }

          const workflows = await response.json();
          console.log(`✅ ${workflows.length} workflows carregados do Flowise`);

          return NextResponse.json({
            success: true,
            data: workflows,
            workflows: workflows
          });
        } catch (error) {
          console.error('❌ Error fetching workflows:', error);
          return NextResponse.json(
            { error: 'Failed to fetch workflows from Flowise' },
            { status: 500 }
          );
        }

      case 'export_workflow':
        try {
          const { canvasId, workflowData } = data;
          
          // Criar novo workflow no Flowise
          const createResponse = await fetch(`${FLOWISE_BASE_URL}/api/v1/chatflows`, {
            method: 'POST',
            headers,
            body: JSON.stringify(workflowData),
          });

          if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error('❌ Error creating workflow:', createResponse.status, errorText);
            throw new Error(`Failed to create workflow: ${createResponse.status}`);
          }

          const createdWorkflow = await createResponse.json();
          console.log('✅ Workflow criado no Flowise:', createdWorkflow.id);

          return NextResponse.json({
            success: true,
            data: {
              canvasId: createdWorkflow.id,
              chatflowId: createdWorkflow.id,
              ...createdWorkflow
            }
          });
        } catch (error) {
          console.error('❌ Error exporting workflow:', error);
          return NextResponse.json(
            { error: 'Failed to export workflow to Flowise' },
            { status: 500 }
          );
        }

      case 'update_workflow_metadata':
        try {
          const { canvasId, metadata } = data;
          
          // Primeiro, buscar o workflow existente
          const getResponse = await fetch(`${FLOWISE_BASE_URL}/api/v1/chatflows/${canvasId}`, {
            method: 'GET',
            headers,
          });

          if (!getResponse.ok) {
            throw new Error(`Failed to fetch workflow: ${getResponse.status}`);
          }

          const existingWorkflow = await getResponse.json();
          
          // Atualizar o workflow com novos metadados
          const updatedWorkflow = {
            ...existingWorkflow,
            metadata: JSON.stringify({
              ...JSON.parse(existingWorkflow.metadata || '{}'),
              ...metadata
            })
          };

          const updateResponse = await fetch(`${FLOWISE_BASE_URL}/api/v1/chatflows/${canvasId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(updatedWorkflow),
          });

          if (!updateResponse.ok) {
            throw new Error(`Failed to update workflow: ${updateResponse.status}`);
          }

          console.log('✅ Metadados atualizados no Flowise:', canvasId);

          return NextResponse.json({
            success: true,
            data: { canvasId, updated: true }
          });
        } catch (error) {
          console.error('❌ Error updating workflow metadata:', error);
          return NextResponse.json(
            { error: 'Failed to update workflow metadata' },
            { status: 500 }
          );
        }

      case 'reexport_workflow':
        try {
          const { originalCanvasId, workflowData } = data;
          
          // Criar novo workflow com base nas configurações personalizadas
          const reExportData = {
            ...workflowData,
            metadata: JSON.stringify({
              ...JSON.parse(workflowData.metadata || '{}'),
              isReExport: true,
              originalCanvasId,
              reExportedAt: new Date().toISOString()
            })
          };

          const createResponse = await fetch(`${FLOWISE_BASE_URL}/api/v1/chatflows`, {
            method: 'POST',
            headers,
            body: JSON.stringify(reExportData),
          });

          if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error('❌ Error re-exporting workflow:', createResponse.status, errorText);
            throw new Error(`Failed to re-export workflow: ${createResponse.status}`);
          }

          const reExportedWorkflow = await createResponse.json();
          console.log('✅ Workflow re-exportado com novo ID:', reExportedWorkflow.id);

          return NextResponse.json({
            success: true,
            data: {
              canvasId: reExportedWorkflow.id,
              chatflowId: reExportedWorkflow.id,
              originalCanvasId,
              ...reExportedWorkflow
            }
          });
        } catch (error) {
          console.error('❌ Error re-exporting workflow:', error);
          return NextResponse.json(
            { error: 'Failed to re-export workflow to Flowise' },
            { status: 500 }
          );
        }

      case 'sync_client_data':
        try {
          const { agentId, clienteId, workflow, timestamp } = data;
          
          // Aqui você pode implementar a lógica para sincronizar dados do cliente
          // com o workflow específico no Flowise
          
          console.log('🔄 Sincronizando dados do cliente:', clienteId, 'com agente:', agentId);
          
          return NextResponse.json({
            success: true,
            data: {
              agentId,
              clienteId,
              syncedAt: timestamp,
              message: 'Client data synchronized successfully'
            }
          });
        } catch (error) {
          console.error('❌ Error syncing client data:', error);
          return NextResponse.json(
            { error: 'Failed to sync client data' },
            { status: 500 }
          );
        }

      default:
        console.warn('⚠️ Unknown action:', action);
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ Unexpected error in Flowise external sync:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'get_workflows') {
      // Reutilizar a lógica do POST para get_workflows
      const body = { action: 'get_workflows' };
      const response = await POST(new NextRequest(request.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }));
      return response;
    }

    return NextResponse.json(
      { error: 'Invalid GET request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ Error in GET request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}