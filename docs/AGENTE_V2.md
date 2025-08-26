# Agente V2 - Documentação e Melhorias

## Visão Geral

A página **Agente V2** é uma evolução da página de agentes existente, com funcionalidades expandidas para integração avançada com o Flowise. Esta implementação mantém compatibilidade total com o formato de dados do Flowise enquanto adiciona novos recursos específicos para gestão de clientes.

## Localização

- **Arquivo:** `src/app/admin/agente-v2/page.tsx`
- **URL:** `/admin/agente-v2`
- **README:** `src/app/admin/agente-v2/README.md`

## Funcionalidades Atuais

### 1. Campo "Cliente" 
- **Tipo:** Dropdown/Select
- **Funcionalidade:** Permite selecionar um cliente existente da lista
- **Integração:** Dados são enviados automaticamente para o Flowise via API

### 2. Campo "Disponível"
- **Tipo:** Checkbox com opções condicionais
- **Funcionalidade:** Controla se o agente está disponível para uso
- **Tipos de Entrada Suportados:**
  - `prompt` - Para workflows padrão
  - `prompt_system` - Para workflows de sistema

### 3. Compatibilidade com Flowise
- Mantém todos os campos obrigatórios do schema do Flowise
- Preserva a estrutura de `flowData`, `nodes`, `edges`, etc.
- Compatível com o sistema de exportação/importação existente

## Melhorias Implementadas

### 🚀 Otimização de Performance
- **Memoização de Componentes**: O componente `AgentCardV2` foi memoizado com `React.memo` para evitar re-renderizações desnecessárias
- **Debounce na Busca**: Implementado debounce na função de busca para reduzir chamadas frequentes ao filtro (300ms)

### 🏗️ Refatoração de Código
- **Divisão de Arquivos**: O arquivo principal foi dividido em múltiplos componentes e hooks menores
- **Estrutura Modular**: Criação de diretórios para componentes, hooks, tipos e utilitários
- **Separação de Responsabilidades**: Lógica de dados, UI e utilitários separados

## Estrutura de Arquivos Refatorada

```
src/app/admin/agente-v2/
├── components/
│   ├── AgentCardV2.tsx          # Componente de cartão do agente
│   ├── AgentFilters.tsx          # Componente de filtros
│   └── AgentStats.tsx            # Componente de estatísticas
├── hooks/
│   ├── useAgents.ts              # Hook para lógica de agentes
│   └── useClientes.ts            # Hook para lógica de clientes
├── types/
│   └── index.ts                  # Tipos e interfaces
├── utils/
│   └── agentHelpers.ts           # Funções utilitárias
└── page.tsx                      # Página principal (reduzida)
```

## Oportunidades de Melhoria

### 🚀 Otimização de Performance
- **Virtualização**: Para listas grandes de agentes, considerar usar bibliotecas como `react-window` ou `react-virtual` para renderização virtual

### 👥 Experiência do Usuário (UX)
- **Ordenação**: Adicionar opções de ordenação (por nome, data de criação, status, etc.)
- **Filtros Avançados**: Permitir filtros combinados e salvamento de filtros personalizados
- **Seleção em Massa**: Adicionar seleção múltipla para operações em lote

### 🧠 Gerenciamento de Estado
- **Estado Global**: Considerar usar um gerenciamento de estado global (como Zustand ou Redux)
- **Tratamento de Erros**: Aprimorar o tratamento de erros com retry automático

### 🛠️ Funcionalidades Adicionais
- **Histórico de Exportações**: Adicionar histórico de exportações com datas e status
- **Preview antes da Exportação**: Permitir visualizar as alterações antes de exportar

## Próximas Etapas de Melhoria

### Fase 1 - Performance (Alta Prioridade)
~~1. Implementar `React.memo` no componente `AgentCardV2`~~ *(Concluído)*
~~2. Adicionar debounce na função de busca~~ *(Concluído)*
~~3. Dividir arquivo principal em componentes menores~~ *(Concluído)*
4. Melhorar tratamento de erros

### Fase 2 - UX (Média Prioridade)
1. Adicionar ordenação por colunas
2. Implementar seleção múltipla
3. Criar filtros avançados

### Fase 3 - Funcionalidades (Baixa Prioridade)
1. Histórico de exportações
2. Preview de alterações
3. Templates de configuração

## Contribuindo com Melhorias

1. **Siga os padrões**: Adira às convenções de desenvolvimento do projeto
2. **Teste as mudanças**: Certifique-se de que as melhorias não quebram funcionalidades existentes
3. **Documente as alterações**: Atualize este documento com novas funcionalidades
4. **Mantenha a compatibilidade**: Preserve a integração com o Flowise