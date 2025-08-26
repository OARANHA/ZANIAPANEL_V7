/**
 * Script de migração para criar vínculos de IDs para dados existentes
 * 
 * Este script cria vínculos no novo sistema de vinculação de IDs para:
 * 1. Agentes que já possuem flowiseId
 * 2. Workflows do Studio que já foram exportados
 */

import { db } from '@/lib/db';
import { IDLinkingService } from '@/lib/id-linking-service';

async function migrateAgentIdLinks() {
  console.log('🔄 Migrando vínculos de agentes...');
  
  try {
    // Obter todos os agentes que possuem flowiseId
    const agents = await db.agent.findMany({
      where: {
        flowiseId: {
          not: null
        }
      }
    });

    let migratedCount = 0;
    
    for (const agent of agents) {
      try {
        // Verificar se já existe um vínculo
        const existingLink = await db.idLink.findFirst({
          where: {
            zanaiId: agent.id,
            resourceType: 'agent'
          }
        });
        
        if (!existingLink) {
          // Criar vínculo usando o novo serviço
          await IDLinkingService.createLink(
            agent.id,
            agent.flowiseId!,
            'agent',
            agent.userId || 'system'
          );
          
          console.log(`✅ Vínculo criado para agente ${agent.id} -> ${agent.flowiseId}`);
          migratedCount++;
        }
      } catch (error) {
        console.error(`❌ Erro ao migrar agente ${agent.id}:`, error.message);
      }
    }
    
    console.log(`✅ Migração de agentes concluída: ${migratedCount} vínculos criados`);
    return migratedCount;
  } catch (error) {
    console.error('❌ Erro na migração de agentes:', error);
    throw error;
  }
}

async function migrateStudioWorkflowIdLinks() {
  console.log('🔄 Migrando vínculos de workflows do Studio...');
  
  try {
    // Obter todos os workflows do Studio que foram exportados
    const studioWorkflows = await db.studioWorkflow.findMany({
      where: {
        config: {
          contains: 'flowiseId'
        }
      }
    });

    let migratedCount = 0;
    
    for (const workflow of studioWorkflows) {
      try {
        // Extrair flowiseId da configuração
        const config = JSON.parse(workflow.config || '{}');
        const flowiseId = config.flowiseId;
        
        if (flowiseId) {
          // Verificar se já existe um vínculo
          const existingLink = await db.idLink.findFirst({
            where: {
              zanaiId: workflow.id,
              resourceType: 'studio_workflow'
            }
          });
          
          if (!existingLink) {
            // Criar vínculo usando o novo serviço
            await IDLinkingService.createLink(
              workflow.id,
              flowiseId,
              'studio_workflow',
              workflow.userId
            );
            
            console.log(`✅ Vínculo criado para workflow ${workflow.id} -> ${flowiseId}`);
            migratedCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Erro ao migrar workflow ${workflow.id}:`, error.message);
      }
    }
    
    console.log(`✅ Migração de workflows do Studio concluída: ${migratedCount} vínculos criados`);
    return migratedCount;
  } catch (error) {
    console.error('❌ Erro na migração de workflows do Studio:', error);
    throw error;
  }
}

async function runMigration() {
  console.log('🚀 Iniciando migração de vínculos de IDs...');
  
  try {
    // Migrar vínculos de agentes
    const agentLinks = await migrateAgentIdLinks();
    
    // Migrar vínculos de workflows do Studio
    const studioLinks = await migrateStudioWorkflowIdLinks();
    
    console.log('🎉 Migração concluída!');
    console.log(`📊 Total de vínculos criados: ${agentLinks + studioLinks}`);
    console.log(`   - Agentes: ${agentLinks}`);
    console.log(`   - Workflows do Studio: ${studioLinks}`);
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

// Executar migração se o script for chamado diretamente
if (require.main === module) {
  runMigration();
}

export { migrateAgentIdLinks, migrateStudioWorkflowIdLinks, runMigration };