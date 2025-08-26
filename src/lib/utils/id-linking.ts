import { IDLinkingService } from '@/lib/id-linking-service';

/**
 * Funções utilitárias para vinculação de IDs
 */

/**
 * Vincula um agente do ZanAI a um workflow do Flowise
 * @param agentId ID do agente ZanAI
 * @param flowiseWorkflowId ID do workflow Flowise
 * @param userId ID do usuário
 */
export async function linkAgentToFlowiseWorkflow(agentId: string, flowiseWorkflowId: string, userId: string) {
  return await IDLinkingService.createLink(agentId, flowiseWorkflowId, 'agent', userId);
}

/**
 * Obtém o ID do workflow Flowise a partir do ID do agente ZanAI
 * @param agentId ID do agente ZanAI
 */
export async function getFlowiseWorkflowIdByAgentId(agentId: string) {
  return await IDLinkingService.getFlowiseId(agentId, 'agent');
}

/**
 * Obtém o ID do agente ZanAI a partir do ID do workflow Flowise
 * @param flowiseWorkflowId ID do workflow Flowise
 */
export async function getAgentIdByFlowiseWorkflowId(flowiseWorkflowId: string) {
  return await IDLinkingService.getZanaiId(flowiseWorkflowId, 'agent');
}

/**
 * Vincula um workflow do Studio a um workflow do Flowise
 * @param studioWorkflowId ID do workflow Studio
 * @param flowiseWorkflowId ID do workflow Flowise
 * @param userId ID do usuário
 */
export async function linkStudioWorkflowToFlowise(studioWorkflowId: string, flowiseWorkflowId: string, userId: string) {
  return await IDLinkingService.createLink(studioWorkflowId, flowiseWorkflowId, 'studio_workflow', userId);
}

/**
 * Obtém o ID do workflow Flowise a partir do ID do workflow Studio
 * @param studioWorkflowId ID do workflow Studio
 */
export async function getFlowiseWorkflowIdByStudioId(studioWorkflowId: string) {
  return await IDLinkingService.getFlowiseId(studioWorkflowId, 'studio_workflow');
}

/**
 * Obtém o ID do workflow Studio a partir do ID do workflow Flowise
 * @param flowiseWorkflowId ID do workflow Flowise
 */
export async function getStudioWorkflowIdByFlowiseId(flowiseWorkflowId: string) {
  return await IDLinkingService.getZanaiId(flowiseWorkflowId, 'studio_workflow');
}