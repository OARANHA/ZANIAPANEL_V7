import { db } from '@/lib/db';
import { IDLinkingService } from '@/lib/id-linking-service';
import { createFlowiseClient, defaultFlowiseConfig } from '@/lib/flowise-client';

/**
 * Serviço para gerenciar a sincronização bidirecional entre ZanAI e Flowise
 */
export class SyncService {
  /**
   * Sincroniza um agente do ZanAI com um workflow do Flowise
   * @param agentId ID do agente ZanAI
   * @param userId ID do usuário
   */
  static async syncAgentWithFlowise(agentId: string, userId: string) {
    try {
      // Obter o ID do workflow Flowise vinculado ao agente
      const flowiseId = await IDLinkingService.getFlowiseId(agentId, 'agent');
      
      if (!flowiseId) {
        throw new Error('Nenhum workflow Flowise vinculado a este agente');
      }

      // Obter dados do agente do ZanAI
      const agent = await db.agent.findUnique({
        where: { id: agentId }
      });

      if (!agent) {
        throw new Error('Agente não encontrado');
      }

      // Obter dados do workflow do Flowise
      const flowiseClient = createFlowiseClient(defaultFlowiseConfig);
      const flowiseWorkflow = await flowiseClient.getChatflow(flowiseId);

      // Atualizar dados do workflow local
      await db.flowiseWorkflow.upsert({
        where: { flowiseId },
        update: {
          name: flowiseWorkflow.name,
          flowData: flowiseWorkflow.flowData,
          deployed: flowiseWorkflow.deployed,
          isPublic: flowiseWorkflow.isPublic,
          updatedAt: flowiseWorkflow.updatedDate,
          lastSyncAt: new Date()
        },
        create: {
          flowiseId: flowiseWorkflow.id,
          name: flowiseWorkflow.name,
          description: `Workflow para agente: ${agent.name}`,
          type: flowiseWorkflow.type,
          flowData: flowiseWorkflow.flowData,
          deployed: flowiseWorkflow.deployed,
          isPublic: flowiseWorkflow.isPublic,
          category: flowiseWorkflow.category || 'general',
          workspaceId: agent.workspaceId,
          createdAt: flowiseWorkflow.createdDate,
          updatedAt: flowiseWorkflow.updatedDate,
          lastSyncAt: new Date()
        }
      });

      // Registrar log de sincronização
      await db.syncLog.create({
        data: {
          action: 'SYNC_AGENT',
          flowiseId,
          resourceId: agentId,
          resourceType: 'agent',
          details: JSON.stringify({
            agentName: agent.name,
            workflowName: flowiseWorkflow.name
          }),
          status: 'SUCCESS'
        }
      });

      console.log(`✅ Agente ${agentId} sincronizado com Flowise ${flowiseId}`);
      return { success: true, flowiseId };
    } catch (error) {
      console.error('❌ Erro ao sincronizar agente com Flowise:', error);
      
      // Registrar erro no log
      try {
        await db.syncLog.create({
          data: {
            action: 'SYNC_AGENT',
            resourceId: agentId,
            resourceType: 'agent',
            details: JSON.stringify({ error: error.message }),
            status: 'ERROR'
          }
        });
      } catch (logError) {
        console.error('❌ Erro ao registrar log de sincronização:', logError);
      }
      
      throw error;
    }
  }

  /**
   * Sincroniza um workflow do Studio com um workflow do Flowise
   * @param studioWorkflowId ID do workflow Studio
   * @param userId ID do usuário
   */
  static async syncStudioWorkflowWithFlowise(studioWorkflowId: string, userId: string) {
    try {
      // Obter o ID do workflow Flowise vinculado ao workflow Studio
      const flowiseId = await IDLinkingService.getFlowiseId(studioWorkflowId, 'studio_workflow');
      
      if (!flowiseId) {
        throw new Error('Nenhum workflow Flowise vinculado a este workflow Studio');
      }

      // Obter dados do workflow Studio
      const studioWorkflow = await db.studioWorkflow.findUnique({
        where: { id: studioWorkflowId }
      });

      if (!studioWorkflow) {
        throw new Error('Workflow Studio não encontrado');
      }

      // Obter dados do workflow do Flowise
      const flowiseClient = createFlowiseClient(defaultFlowiseConfig);
      const flowiseWorkflow = await flowiseClient.getChatflow(flowiseId);

      // Atualizar dados do workflow Studio
      await db.studioWorkflow.update({
        where: { id: studioWorkflowId },
        data: {
          name: flowiseWorkflow.name,
          flowData: flowiseWorkflow.flowData,
          updatedAt: new Date()
        }
      });

      // Atualizar dados do workflow local
      await db.flowiseWorkflow.upsert({
        where: { flowiseId },
        update: {
          name: flowiseWorkflow.name,
          flowData: flowiseWorkflow.flowData,
          deployed: flowiseWorkflow.deployed,
          isPublic: flowiseWorkflow.isPublic,
          updatedAt: flowiseWorkflow.updatedDate,
          lastSyncAt: new Date()
        },
        create: {
          flowiseId: flowiseWorkflow.id,
          name: flowiseWorkflow.name,
          description: studioWorkflow.description || `Imported workflow: ${studioWorkflow.name}`,
          type: flowiseWorkflow.type || studioWorkflow.type,
          flowData: flowiseWorkflow.flowData,
          deployed: flowiseWorkflow.deployed,
          isPublic: flowiseWorkflow.isPublic,
          category: flowiseWorkflow.category || 'general',
          workspaceId: studioWorkflow.workspaceId,
          createdAt: flowiseWorkflow.createdDate,
          updatedAt: flowiseWorkflow.updatedDate,
          lastSyncAt: new Date()
        }
      });

      // Registrar log de sincronização
      await db.syncLog.create({
        data: {
          action: 'SYNC_STUDIO_WORKFLOW',
          flowiseId,
          resourceId: studioWorkflowId,
          resourceType: 'studio_workflow',
          details: JSON.stringify({
            studioName: studioWorkflow.name,
            workflowName: flowiseWorkflow.name
          }),
          status: 'SUCCESS'
        }
      });

      console.log(`✅ Workflow Studio ${studioWorkflowId} sincronizado com Flowise ${flowiseId}`);
      return { success: true, flowiseId };
    } catch (error) {
      console.error('❌ Erro ao sincronizar workflow Studio com Flowise:', error);
      
      // Registrar erro no log
      try {
        await db.syncLog.create({
          data: {
            action: 'SYNC_STUDIO_WORKFLOW',
            resourceId: studioWorkflowId,
            resourceType: 'studio_workflow',
            details: JSON.stringify({ error: error.message }),
            status: 'ERROR'
          }
        });
      } catch (logError) {
        console.error('❌ Erro ao registrar log de sincronização:', logError);
      }
      
      throw error;
    }
  }

  /**
   * Sincronização em lote de todos os recursos de um usuário
   * @param userId ID do usuário
   */
  static async syncAllUserResources(userId: string) {
    try {
      console.log(`🔄 Iniciando sincronização em lote para usuário ${userId}`);
      
      // Obter todos os vínculos do usuário
      const links = await IDLinkingService.listUserLinks(userId);
      
      const results = {
        success: 0,
        errors: 0,
        details: [] as string[]
      };

      // Sincronizar cada recurso
      for (const link of links) {
        try {
          if (link.resourceType === 'agent') {
            await this.syncAgentWithFlowise(link.zanaiId, userId);
            results.success++;
            results.details.push(`Agente ${link.zanaiId} sincronizado com sucesso`);
          } else if (link.resourceType === 'studio_workflow') {
            await this.syncStudioWorkflowWithFlowise(link.zanaiId, userId);
            results.success++;
            results.details.push(`Workflow Studio ${link.zanaiId} sincronizado com sucesso`);
          }
        } catch (error) {
          results.errors++;
          results.details.push(`Erro ao sincronizar ${link.resourceType} ${link.zanaiId}: ${error.message}`);
        }
      }

      // Registrar log de sincronização em lote
      await db.syncLog.create({
        data: {
          action: 'BATCH_SYNC',
          details: JSON.stringify(results),
          status: results.errors === 0 ? 'SUCCESS' : results.success > 0 ? 'PARTIAL' : 'ERROR'
        }
      });

      console.log(`✅ Sincronização em lote concluída: ${results.success} sucesso, ${results.errors} erros`);
      return results;
    } catch (error) {
      console.error('❌ Erro na sincronização em lote:', error);
      throw error;
    }
  }
}