# Agente V2 - Sugestões de Melhoria

## Visão Geral

Este documento apresenta sugestões de melhoria para a página `/admin/agente-v2`, com foco em performance, experiência do usuário, funcionalidades e integração com o Cipher Memory System.

## 1. Integração com Cipher Memory System

### Status Atual
- O sistema de memória Cipher foi implementado mas não está sendo utilizado na página Agente V2
- Não há persistência de contexto das sessões de desenvolvimento

### Sugestões de Melhoria

#### 1.1. Registro Automático de Sessões
```typescript
// Integrar o hook useCipherMemory na página AgenteV2Page
import { useCipherMemory } from '@/lib/cipher-memory/useCipherMemory';

export default function AgenteV2Page() {
  const { 
    recordTask, 
    recordDecision, 
    recordCodeSnippet 
  } = useCipherMemory('Agente V2 Development Session');
  
  // Registrar tarefas importantes automaticamente
  useEffect(() => {
    recordTask({
      title: 'Carregar agentes do Flowise',
      description: 'Buscar workflows do Flowise e exibir na interface',
      status: 'in_progress',
      priority: 3,
      completed_at: null
    });
  }, []);
  
  // Registrar decisões importantes
  const handleExportToFlowise = async (agent: Agent) => {
    await recordDecision({
      context: `Exportando agente ${agent.name} para o Flowise`,
      decision: 'Validar campos obrigatórios antes da exportação',
      rationale: 'Evitar erros de exportação devido a dados incompletos'
    });
    
    // Implementar lógica de exportação...
  };
}
```

#### 1.2. Armazenamento de Contexto de Desenvolvimento
- Registrar decisões arquiteturais tomadas durante o desenvolvimento
- Armazenar snippets de código úteis
- Manter histórico de tarefas e progresso

## 2. Otimização de Performance

### 2.1. Memoização de Componentes
```typescript
// Memoizar o componente AgentCardV2 para evitar re-renderizações desnecessárias
import React, { memo } from 'react';

const AgentCardV2 = memo(({ 
  agent, 
  clientes, 
  onClienteChange, 
  onDisponibilidadeChange,
  onInputTypesChange,
  onExportToFlowise 
}: AgentCardV2Props) => {
  // Implementação do componente...
});

AgentCardV2.displayName = 'AgentCardV2';
```

### 2.2. Virtualização de Listas
Para listas grandes de agentes, implementar virtualização:
```typescript
// Usar react-window ou react-virtual para renderização virtual
import { FixedSizeGrid as Grid } from 'react-window';

const AgentGrid = ({ agents, clientes }) => {
  const cellRenderer = ({ columnIndex, rowIndex, style }) => {
    const agent = agents[rowIndex * columnCount + columnIndex];
    if (!agent) return null;
    
    return (
      <div style={style}>
        <AgentCardV2 agent={agent} clientes={clientes} />
      </div>
    );
  };

  return (
    <Grid
      columnCount={columnCount}
      columnWidth={300}
      height={600}
      rowCount={Math.ceil(agents.length / columnCount)}
      rowHeight={400}
      width={1200}
    >
      {cellRenderer}
    </Grid>
  );
};
```

### 2.3. Debounce na Busca
```typescript
// Implementar debounce na função de busca
import { useState, useEffect, useCallback } from 'react';

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Na página principal:
const [searchQuery, setSearchQuery] = useState('');
const debouncedSearchQuery = useDebounce(searchQuery, 300);

useEffect(() => {
  // Filtrar agentes com base no debouncedSearchQuery
}, [debouncedSearchQuery]);
```

## 3. Melhorias na Experiência do Usuário

### 3.1. Ordenação por Colunas
```typescript
// Adicionar estado para ordenação
const [sortConfig, setSortConfig] = useState<{
  key: keyof Agent;
  direction: 'asc' | 'desc';
}>({ key: 'name', direction: 'asc' });

// Função para lidar com ordenação
const handleSort = (key: keyof Agent) => {
  let direction: 'asc' | 'desc' = 'asc';
  if (sortConfig.key === key && sortConfig.direction === 'asc') {
    direction = 'desc';
  }
  setSortConfig({ key, direction });
};

// Ordenar agentes
const sortedAgents = useMemo(() => {
  return [...filteredAgents].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}, [filteredAgents, sortConfig]);
```

### 3.2. Seleção Múltipla
```typescript
// Adicionar estado para seleção múltipla
const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

// Funções para manipular seleção
const toggleAgentSelection = (agentId: string) => {
  setSelectedAgents(prev => 
    prev.includes(agentId) 
      ? prev.filter(id => id !== agentId) 
      : [...prev, agentId]
  );
};

const selectAllAgents = () => {
  setSelectedAgents(agents.map(agent => agent.id));
};

const clearSelection = () => {
  setSelectedAgents([]);
};
```

### 3.3. Filtros Avançados
```typescript
// Interface para filtros avançados
interface AdvancedFilters {
  status: string[];
  type: string[];
  cliente: string[];
  disponivel: boolean | null;
  exportado: boolean | null;
}

// Componente de filtros avançados
const AdvancedFilterPanel = ({ 
  filters, 
  onFiltersChange 
}: { 
  filters: AdvancedFilters; 
  onFiltersChange: (filters: AdvancedFilters) => void; 
}) => {
  // Implementação do painel de filtros avançados
};
```

## 4. Funcionalidades Adicionais

### 4.1. Histórico de Exportações
```typescript
// Interface para histórico de exportações
interface ExportHistory {
  id: string;
  agentId: string;
  agentName: string;
  clienteId: string;
  clienteName: string;
  exportDate: Date;
  status: 'success' | 'error' | 'pending';
  errorMessage?: string;
}

// Componente para exibir histórico
const ExportHistoryPanel = ({ agentId }: { agentId: string }) => {
  const [history, setHistory] = useState<ExportHistory[]>([]);
  
  useEffect(() => {
    // Carregar histórico de exportações para o agente
    loadExportHistory(agentId).then(setHistory);
  }, [agentId]);
  
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Histórico de Exportações</h3>
      {history.map(entry => (
        <div key={entry.id} className="border-b py-2">
          <div className="flex justify-between">
            <span>{entry.agentName}</span>
            <Badge variant={entry.status === 'success' ? 'default' : 'destructive'}>
              {entry.status === 'success' ? 'Sucesso' : 'Erro'}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Exportado para {entry.clienteName} em {entry.exportDate.toLocaleString()}
          </div>
          {entry.errorMessage && (
            <div className="text-sm text-red-500 mt-1">
              Erro: {entry.errorMessage}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
```

### 4.2. Preview Antes da Exportação
```typescript
// Componente de preview
const ExportPreviewModal = ({ 
  agent, 
  cliente,
  onConfirm,
  onCancel
}: { 
  agent: Agent; 
  cliente: Cliente;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Preview da Exportação</DialogTitle>
          <DialogDescription>
            Revise as informações antes de exportar para o Flowise
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Agente</Label>
            <p className="font-medium">{agent.name}</p>
          </div>
          
          <div>
            <Label>Cliente</Label>
            <p className="font-medium">{cliente.name}</p>
          </div>
          
          <div>
            <Label>Dados a serem exportados</Label>
            <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-40">
              {JSON.stringify({
                name: agent.name,
                description: agent.description,
                type: 'CHATFLOW',
                flowData: agent.config,
                metadata: {
                  sourceV2: true,
                  clienteId: cliente.id,
                  clienteName: cliente.name,
                  disponivel: agent.disponivel,
                  inputTypes: agent.inputTypes
                }
              }, null, 2)}
            </pre>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>
            Confirmar Exportação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

### 4.3. Templates de Configuração
```typescript
// Interface para templates
interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  config: Partial<Agent>;
  createdBy: string;
  createdAt: Date;
}

// Componente para gerenciar templates
const TemplateManager = () => {
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Aplicar configuração do template ao agente
      setAgentConfig(prev => ({ ...prev, ...template.config }));
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Templates de Configuração</Label>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Novo Template
        </Button>
      </div>
      
      <Select value={selectedTemplate} onValueChange={applyTemplate}>
        <SelectTrigger>
          <SelectValue placeholder="Selecionar template" />
        </SelectTrigger>
        <SelectContent>
          {templates.map(template => (
            <SelectItem key={template.id} value={template.id}>
              {template.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
```

## 5. Tratamento de Erros

### 5.1. Retry Automático
```typescript
// Hook para retry automático
const useRetry = <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    for (let i = 0; i <= retries; i++) {
      try {
        const result = await fn();
        setData(result);
        setLoading(false);
        return result;
      } catch (err) {
        if (i === retries) {
          setError(err as Error);
          setLoading(false);
          throw err;
        }
        
        // Aguardar antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }, [fn, retries, delay]);

  return { loading, error, data, execute };
};

// Uso no componente:
const { loading, error, data, execute: loadAgents } = useRetry(
  () => fetch('/api/flowise-external-sync?action=get_workflows'),
  3,
  1000
);
```

### 5.2. Feedback Detalhado ao Usuário
```typescript
// Melhorar mensagens de erro
const handleExportToFlowise = async (agent: Agent) => {
  try {
    setIsExporting(true);
    
    const response = await fetch('/api/flowise-external-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'export_workflow',
        canvasId: agent.id,
        workflowData: exportData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro na exportação: ${response.status}`);
    }
    
    // Sucesso
    toast({
      title: "Exportação bem-sucedida!",
      description: `Agente "${agent.name}" exportado para o Flowise com sucesso`,
      variant: "default",
    });
  } catch (error) {
    // Erro detalhado
    toast({
      title: "Erro na exportação",
      description: `Não foi possível exportar o agente "${agent.name}" para o Flowise: ${(error as Error).message}`,
      variant: "destructive",
    });
  } finally {
    setIsExporting(false);
  }
};
```

## 6. Testes

### 6.1. Testes Unitários
```typescript
// Exemplo de teste para o componente AgentCardV2
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AgentCardV2 from './AgentCardV2';

describe('AgentCardV2', () => {
  const mockAgent = {
    id: '1',
    name: 'Test Agent',
    description: 'Test Description',
    type: 'workflow' as const,
    disponivel: false,
    inputTypes: []
  };
  
  const mockClientes = [
    { id: '1', name: 'Cliente 1', email: 'cliente1@test.com', status: 'active' }
  ];
  
  const mockHandlers = {
    onClienteChange: jest.fn(),
    onDisponibilidadeChange: jest.fn(),
    onInputTypesChange: jest.fn(),
    onExportToFlowise: jest.fn()
  };

  it('renders agent information correctly', () => {
    render(
      <AgentCardV2 
        agent={mockAgent} 
        clientes={mockClientes}
        {...mockHandlers}
      />
    );
    
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('calls onClienteChange when cliente is selected', async () => {
    const user = userEvent.setup();
    render(
      <AgentCardV2 
        agent={mockAgent} 
        clientes={mockClientes}
        {...mockHandlers}
      />
    );
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    const option = screen.getByText('Cliente 1');
    await user.click(option);
    
    expect(mockHandlers.onClienteChange).toHaveBeenCalledWith('1', '1');
  });
});
```

### 6.2. Testes de Integração
```typescript
// Exemplo de teste de integração para a API do Flowise
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fetch } from 'cross-fetch';

describe('Flowise API Integration', () => {
  beforeEach(() => {
    // Setup mock server or use test environment
  });

  afterEach(() => {
    // Cleanup
  });

  it('should fetch workflows from Flowise', async () => {
    const response = await fetch('/api/flowise-external-sync?action=get_workflows');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('workflows');
    expect(Array.isArray(data.workflows)).toBe(true);
  });

  it('should export workflow to Flowise', async () => {
    const workflowData = {
      name: 'Test Workflow',
      description: 'Test Description',
      type: 'CHATFLOW',
      flowData: '{}'
    };

    const response = await fetch('/api/flowise-external-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'export_workflow',
        canvasId: 'test-id',
        workflowData
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
  });
});
```

## 7. Roadmap de Implementação

### Fase 1 - Curto Prazo (1-2 semanas)
1. ✅ Integrar Cipher Memory System com registro automático de sessões
2. ✅ Implementar memoização de componentes (`React.memo`)
3. ✅ Adicionar debounce na busca
4. ✅ Melhorar tratamento de erros com mensagens detalhadas

### Fase 2 - Médio Prazo (2-4 semanas)
1. 🚧 Implementar ordenação por colunas
2. 🚧 Adicionar seleção múltipla
3. 🚧 Criar filtros avançados
4. 🚧 Implementar retry automático

### Fase 3 - Longo Prazo (1-2 meses)
1. 🚧 Adicionar histórico de exportações
2. 🚧 Implementar preview antes da exportação
3. 🚧 Criar sistema de templates de configuração
4. 🚧 Adicionar testes unitários e de integração

## 8. Benefícios Esperados

1. **Melhoria de Performance**: Redução de re-renderizações e tempo de carregamento
2. **Melhor Experiência do Usuário**: Mais opções de interação e feedback claro
3. **Maior Confiabilidade**: Tratamento de erros robusto e retry automático
4. **Manutenibilidade**: Código mais organizado e testável
5. **Persistência de Contexto**: Registro automático de decisões e progresso
6. **Colaboração**: Facilita o trabalho em equipe com histórico compartilhado

## 9. Considerações Finais

A implementação dessas melhorias transformará a página `/admin/agente-v2` em uma ferramenta ainda mais poderosa e eficiente para gerenciamento de agentes com integração Flowise. A integração com o Cipher Memory System especialmente adicionará um valor significativo ao permitir que o contexto de desenvolvimento seja preservado e acessado facilmente.