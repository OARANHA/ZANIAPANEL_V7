# Arquitetura de Vinculação de IDs entre ZanAI e Flowise

## Visão Geral

Este documento descreve a arquitetura implementada para vincular IDs de criação do ZanAI com IDs do Flowise, permitindo um rastreamento bidirecional eficiente entre os sistemas.

## Estrutura de Vinculação

### Modelo de Dados

O sistema utiliza o modelo `IDLink` para armazenar os vínculos entre IDs:

```prisma
model IDLink {
  id          String   @id @default(cuid())
  zanaiId     String   // ID do recurso no ZanAI
  flowiseId   String   // ID do recurso no Flowise
  resourceType String  // Tipo do recurso (agent, workflow, etc.)
  userId      String   // ID do usuário proprietário
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id])
  
  @@unique([zanaiId, resourceType])
  @@unique([flowiseId, resourceType])
  @@index([userId])
  @@index([resourceType])
  @@map("id_links")
}
```

### Tipos de Recursos Suportados

1. **agent** - Agentes criados no ZanAI
2. **studio_workflow** - Workflows criados no Studio
3. **template** - Templates de aprendizado

## Serviços Disponíveis

### IDLinkingService

Serviço principal para gerenciar vínculos de IDs:

```typescript
class IDLinkingService {
  // Cria um novo vínculo
  static async createLink(zanaiId: string, flowiseId: string, resourceType: string, userId: string)
  
  // Obtém ID do Flowise a partir do ID do ZanAI
  static async getFlowiseId(zanaiId: string, resourceType: string)
  
  // Obtém ID do ZanAI a partir do ID do Flowise
  static async getZanaiId(flowiseId: string, resourceType: string)
  
  // Atualiza um vínculo existente
  static async updateLink(zanaiId: string, newFlowiseId: string, resourceType: string)
  
  // Remove um vínculo
  static async removeLink(zanaiId: string, resourceType: string)
  
  // Lista todos os vínculos de um usuário
  static async listUserLinks(userId: string)
}
```

### Funções Utilitárias

Funções auxiliares para operações comuns:

```typescript
// Vincula um agente do ZanAI a um workflow do Flowise
async function linkAgentToFlowiseWorkflow(agentId: string, flowiseWorkflowId: string, userId: string)

// Obtém o ID do workflow Flowise a partir do ID do agente ZanAI
async function getFlowiseWorkflowIdByAgentId(agentId: string)

// Obtém o ID do agente ZanAI a partir do ID do workflow Flowise
async function getAgentIdByFlowiseWorkflowId(flowiseWorkflowId: string)

// Vincula um workflow do Studio a um workflow do Flowise
async function linkStudioWorkflowToFlowise(studioWorkflowId: string, flowiseWorkflowId: string, userId: string)

// Obtém o ID do workflow Flowise a partir do ID do workflow Studio
async function getFlowiseWorkflowIdByStudioId(studioWorkflowId: string)

// Obtém o ID do workflow Studio a partir do ID do workflow Flowise
async function getStudioWorkflowIdByFlowiseId(flowiseWorkflowId: string)
```

## APIs Disponíveis

### API de Vinculação de IDs

Endpoint: `/api/v1/id-linking`

Ações suportadas:
- `create_link` - Cria um novo vínculo
- `get_flowise_id` - Obtém ID do Flowise
- `get_zanai_id` - Obtém ID do ZanAI
- `update_link` - Atualiza um vínculo
- `remove_link` - Remove um vínculo
- `list_links` - Lista vínculos do usuário

### API de Sincronização

Endpoint: `/api/v1/sync`

Ações suportadas:
- `sync_agent` - Sincroniza um agente
- `sync_studio_workflow` - Sincroniza um workflow do Studio
- `sync_all` - Sincronização em lote

## Fluxo de Integração

### Criação de Agente com Workflow Flowise

1. Usuário cria um agente no ZanAI
2. Sistema gera automaticamente um workflow no Flowise
3. Sistema cria um vínculo entre o ID do agente e o ID do workflow
4. Informações são armazenadas no modelo `IDLink`

### Exportação de Workflow do Studio para Flowise

1. Usuário exporta um workflow do Studio para Flowise
2. Sistema cria um workflow correspondente no Flowise
3. Sistema cria um vínculo entre o ID do workflow Studio e o ID do workflow Flowise
4. Informações são armazenadas no modelo `IDLink`

### Sincronização Bidirecional

1. Sistema pode sincronizar dados entre ZanAI e Flowise a qualquer momento
2. Alterações em um sistema são refletidas no outro
3. Logs de sincronização são registrados para auditoria

## Benefícios da Arquitetura

1. **Rastreabilidade Completa** - Permite rastrear qualquer recurso entre os sistemas
2. **Sincronização Bidirecional** - Mantém dados consistentes entre ZanAI e Flowise
3. **Extensibilidade** - Fácil de adicionar novos tipos de recursos
4. **Segurança** - Vínculos são associados a usuários específicos
5. **Auditoria** - Todos os vínculos e sincronizações são registrados

## Exemplos de Uso

### Criando um Vínculo

```typescript
import { IDLinkingService } from '@/lib/id-linking-service';

// Criar vínculo entre agente ZanAI e workflow Flowise
await IDLinkingService.createLink(
  'agent_123',     // ID do agente ZanAI
  'flowise_456',   // ID do workflow Flowise
  'agent',         // Tipo do recurso
  'user_789'       // ID do usuário
);
```

### Obtendo ID Correspondente

```typescript
import { getFlowiseWorkflowIdByAgentId } from '@/lib/utils/id-linking';

// Obter ID do workflow Flowise a partir do ID do agente ZanAI
const flowiseId = await getFlowiseWorkflowIdByAgentId('agent_123');
```

### Sincronizando Recursos

```typescript
import { SyncService } from '@/lib/sync-service';

// Sincronizar agente com workflow Flowise
await SyncService.syncAgentWithFlowise('agent_123', 'user_789');
```