# Agente V2 - Documentação das Funcionalidades

## Visão Geral

A página **Agente V2** é uma evolução da página de agentes existente, com funcionalidades expandidas para integração avançada com o Flowise. Esta implementação mantém compatibilidade total com o formato de dados do Flowise enquanto adiciona novos recursos específicos para gestão de clientes.

## Localização

**Arquivo:** `src/app/admin/agente-v2/page.tsx`
**URL:** `/admin/agente-v2`

## Funcionalidades Implementadas

### 1. Campo "Cliente" 
- **Tipo:** Dropdown/Select
- **Funcionalidade:** Permite selecionar um cliente existente da lista
- **Formato de Envio:** 
  ```json
  {
    "clienteId": "ID_DO_CLIENTE",
    "workflow": "NOME_DO_WORKFLOW"
  }
  ```
- **Integração:** Dados são enviados automaticamente para o Flowise via API

### 2. Campo "Disponível"
- **Tipo:** Checkbox com opções condicionais
- **Funcionalidade:** Controla se o agente está disponível para uso
- **Tipos de Entrada Suportados:**
  - `prompt` - Para workflows padrão
  - `prompt_system` - Para workflows de sistema
- **Interface:** Quando marcado como disponível, exibe opções para tipos de entrada

### 3. Compatibilidade com Flowise

#### Preservação do Formato Original
- Mantém todos os campos obrigatórios do schema do Flowise
- Preserva a estrutura de `flowData`, `nodes`, `edges`, etc.
- Compatível com o sistema de exportação/importação existente

#### Metadados Específicos
Os dados V2 são armazenados em um campo `metadata` específico:
```json
{
  "metadata": {
    "sourceV2": true,
    "clienteId": "client-id",
    "clienteName": "Nome do Cliente",
    "disponivel": true,
    "inputTypes": ["prompt", "prompt_system"],
    "exportedAt": "2024-08-24T..."
  }
}
```

### 4. Status de Sincronização

#### Badges de Status
- **Não Exportado:** Agente ainda não foi exportado para o Flowise
- **Sincronizando:** Processo de exportação em andamento
- **Sincronizado:** Exportação concluída com sucesso
- **Erro:** Falha na exportação

#### Estados Visuais
- Cores diferentes para cada status
- Ícones informativos (CheckCircle, Loader2, AlertTriangle)
- Feedback visual em tempo real

### 5. Integração com API Existente

#### Endpoint de Exportação
- **URL:** `/api/flowise-external-sync`
- **Método:** POST
- **Ação:** `export_workflow`
- **Formato:** Compatível com a estrutura existente do Flowise

#### Endpoint de Sincronização de Dados
- **URL:** `/api/flowise-external-sync`
- **Método:** POST  
- **Ação:** `sync_client_data`
- **Dados Enviados:** clienteId e workflow

## Estrutura de Dados

### Interface Agent (Expandida)
```typescript
interface Agent {
  // Campos originais mantidos
  id: string;
  name: string;
  description: string;
  type: 'template' | 'custom' | 'composed' | 'workflow';
  
  // Campos específicos V2
  cliente?: {
    id: string;
    name: string;
  };
  disponivel?: boolean;
  inputTypes?: ('prompt' | 'prompt_system')[];
  flowiseConfig?: {
    exported: boolean;
    flowiseId?: string;
    exportedAt?: string;
    syncStatus?: 'pending' | 'synced' | 'error';
  };
}
```

### Interface Cliente
```typescript
interface Cliente {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  company?: string;
  sector?: string;
}
```

## Funcionalidades de Interface

### 1. Cards de Agente Expandidos
- Design aprimorado com gradientes e ícones
- Informações técnicas (nodes, edges, complexidade)
- Controles interativos para cliente e disponibilidade
- Botões de ação contextuais

### 2. Sistema de Filtros
- **Todos os Agentes:** Exibe todos os agentes
- **Disponíveis:** Apenas agentes marcados como disponíveis
- **Com Cliente:** Apenas agentes com cliente associado
- **Exportados:** Apenas agentes já exportados para Flowise
- **Workflows:** Apenas agentes do tipo workflow

### 3. Busca e Pesquisa
- Campo de busca em tempo real
- Pesquisa por nome e descrição
- Combinação com filtros

### 4. Estatísticas
- Total de agentes
- Agentes disponíveis
- Agentes com cliente associado
- Agentes exportados

## Navegação e Links

### Links de Navegação
- **Agentes V1:** Link para a página original de agentes
- **Studio:** Link para o ambiente de criação de workflows
- **Voltar:** Navegação contextual

### Estados Empty
- Mensagens informativas quando não há agentes
- Botões de ação para diferentes cenários
- Links para páginas relacionadas

## Tratamento de Erros

### Validações
- Cliente deve estar selecionado antes da exportação
- Agente deve estar marcado como disponível
- Validação de dados antes do envio

### Feedback ao Usuário
- Toasts informativos para sucesso e erro
- Estados visuais de carregamento
- Mensagens claras de erro

## Compatibilidade e Migração

### Dados Existentes
- Totalmente compatível com agentes existentes
- Campos V2 são opcionais e não afetam funcionalidade existente
- Migração gradual possível

### APIs Existentes
- Utiliza endpoints existentes quando possível
- Formato de dados mantido para compatibilidade
- Extensões feitas via metadados

## Código Fonte Analisado

A implementação foi baseada na análise do código fonte oficial do Flowise:
- **Arquivo:** `Flowise/packages/server/src/services/export-import/index.ts`
- **Estruturas:** Entidades ChatFlow, Assistant, ExportData
- **Validações:** Mesmas regras de validação do Flowise original
- **Formatos:** Compatibilidade total com schemas existentes

## Próximos Passos

1. **Testes de Integração:** Validar exportação real para instância Flowise
2. **Refinamentos de UI:** Melhorias baseadas no feedback do usuário  
3. **Extensões:** Adicionar mais campos conforme necessário
4. **Performance:** Otimizações para grandes volumes de dados

## Dependências

- React 18+
- Next.js 13+ (App Router)
- Tailwind CSS
- Radix UI Components
- Lucide React Icons
- TypeScript 5+

## Notas Técnicas

- Utiliza lazy loading para componentes pesados
- Gerenciamento de estado local com useState
- Integração com sistema de toast existente
- Responsivo e acessível (WCAG)
- Compatível com modo escuro