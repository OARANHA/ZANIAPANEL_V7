import { db } from '@/lib/db';

/**
 * Serviço para gerenciar o vínculo entre IDs do ZanAI e IDs do Flowise
 */
export class IDLinkingService {
  /**
   * Cria um vínculo entre um ID do ZanAI e um ID do Flowise
   * @param zanaiId ID do recurso no ZanAI
   * @param flowiseId ID do recurso no Flowise
   * @param resourceType Tipo do recurso (agent, workflow, etc.)
   * @param userId ID do usuário proprietário
   */
  static async createLink(zanaiId: string, flowiseId: string, resourceType: string, userId: string) {
    try {
      // Criar registro no banco de dados para rastrear o vínculo
      const link = await db.idLink.create({
        data: {
          zanaiId,
          flowiseId,
          resourceType,
          userId
        }
      });

      console.log(`✅ Vínculo criado: ZanAI ${zanaiId} <-> Flowise ${flowiseId}`);
      return link;
    } catch (error) {
      console.error('❌ Erro ao criar vínculo:', error);
      throw error;
    }
  }

  /**
   * Obtém o ID do Flowise a partir do ID do ZanAI
   * @param zanaiId ID do recurso no ZanAI
   * @param resourceType Tipo do recurso
   */
  static async getFlowiseId(zanaiId: string, resourceType: string) {
    try {
      const link = await db.idLink.findFirst({
        where: {
          zanaiId,
          resourceType
        }
      });

      return link ? link.flowiseId : null;
    } catch (error) {
      console.error('❌ Erro ao obter ID do Flowise:', error);
      throw error;
    }
  }

  /**
   * Obtém o ID do ZanAI a partir do ID do Flowise
   * @param flowiseId ID do recurso no Flowise
   * @param resourceType Tipo do recurso
   */
  static async getZanaiId(flowiseId: string, resourceType: string) {
    try {
      const link = await db.idLink.findFirst({
        where: {
          flowiseId,
          resourceType
        }
      });

      return link ? link.zanaiId : null;
    } catch (error) {
      console.error('❌ Erro ao obter ID do ZanAI:', error);
      throw error;
    }
  }

  /**
   * Atualiza um vínculo existente
   * @param zanaiId ID do recurso no ZanAI
   * @param newFlowiseId Novo ID do Flowise
   * @param resourceType Tipo do recurso
   */
  static async updateLink(zanaiId: string, newFlowiseId: string, resourceType: string) {
    try {
      const link = await db.idLink.update({
        where: {
          zanaiId_resourceType: {
            zanaiId,
            resourceType
          }
        },
        data: {
          flowiseId: newFlowiseId
        }
      });

      console.log(`✅ Vínculo atualizado: ZanAI ${zanaiId} <-> Flowise ${newFlowiseId}`);
      return link;
    } catch (error) {
      console.error('❌ Erro ao atualizar vínculo:', error);
      throw error;
    }
  }

  /**
   * Remove um vínculo
   * @param zanaiId ID do recurso no ZanAI
   * @param resourceType Tipo do recurso
   */
  static async removeLink(zanaiId: string, resourceType: string) {
    try {
      await db.idLink.delete({
        where: {
          zanaiId_resourceType: {
            zanaiId,
            resourceType
          }
        }
      });

      console.log(`✅ Vínculo removido: ZanAI ${zanaiId}`);
    } catch (error) {
      console.error('❌ Erro ao remover vínculo:', error);
      throw error;
    }
  }

  /**
   * Lista todos os vínculos de um usuário
   * @param userId ID do usuário
   */
  static async listUserLinks(userId: string) {
    try {
      const links = await db.idLink.findMany({
        where: {
          userId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return links;
    } catch (error) {
      console.error('❌ Erro ao listar vínculos do usuário:', error);
      throw error;
    }
  }
}