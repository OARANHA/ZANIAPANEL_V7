# 🗑️ Sistema de Exclusão Avançada com Backup

## Visão Geral

O Sistema de Exclusão Avançada com Backup é uma funcionalidade robusta que permite aos usuários excluir workflows de forma segura e controlada, com opções de backup e controle granular sobre quais sistemas são afetados pela operação.

## 🎯 Objetivos

- **Segurança**: Prevenir perda acidental de dados com backups automáticos
- **Controle**: Permitir escolha granular do que será excluído
- **Flexibilidade**: Suportar diferentes cenários de exclusão
- **Transparência**: Fornecer feedback detalhado das operações
- **Recuperação**: Permitir restauração a partir de backups

## 🏗️ Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   Component     │◄──►│   API Route     │◄──►│   Flowise API   │
│                 │    │                 │    │                 │
│ • Delete Dialog │    │ • Delete Logic  │    │ • DELETE /api/  │
│ • Backup UI     │    │ • Error Handling│    │   v1/chatflows/ │
│ • Progress      │    │ • Response      │    │                 │
│ • Feedback      │    │   Formatting    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                │
                    ┌─────────────────┐
                    │   Database      │
                    │                 │
                    │ • FlowiseWorkflow│
                    │ • Backup Logs   │
                    │ • Audit Trail   │
                    └─────────────────┘
```

## 🔧 Componentes do Sistema

### 1. DeleteConfirmationModal (Componente UI)

Modal de confirmação com múltiplas opções de exclusão:

```typescript
interface DeleteOptions {
  deleteFromZanAI: boolean;    // Excluir do banco local
  deleteFromFlowise: boolean;  // Excluir do Flowise externo
  createBackup: boolean;       // Criar backup antes de excluir
}

const DeleteConfirmationModal = () => {
  const [deleteOptions, setDeleteOptions] = useState<DeleteOptions>({
    deleteFromZanAI: true,
    deleteFromFlowise: false,
    createBackup: false
  });

  return (
    <AlertDialog>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão do Workflow</AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a excluir o workflow <strong>"{workflow.name}"</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          {/* Opções de exclusão */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="delete-zanai"
                checked={deleteOptions.deleteFromZanAI}
                onCheckedChange={(checked) => 
                  setDeleteOptions(prev => ({ ...prev, deleteFromZanAI: checked as boolean }))
                }
              />
              <Label htmlFor="delete-zanai" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Excluir do banco ZanAI
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="delete-flowise"
                checked={deleteOptions.deleteFromFlowise}
                onCheckedChange={(checked) => 
                  setDeleteOptions(prev => ({ ...prev, deleteFromFlowise: checked as boolean }))
                }
              />
              <Label htmlFor="delete-flowise" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Excluir do motor ZanAI (Flowise)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create-backup"
                checked={deleteOptions.createBackup}
                onCheckedChange={(checked) => 
                  setDeleteOptions(prev => ({ ...prev, createBackup: checked as boolean }))
                }
              />
              <Label htmlFor="create-backup" className="flex items-center gap-2">
                <Archive className="w-4 h-4" />
                Criar backup antes de excluir
              </Label>
            </div>
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={executeAdvancedDelete}>
            Confirmar Exclusão
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
```

### 2. BackupService (Serviço de Backup)

Serviço responsável por criar backups completos dos workflows:

```typescript
export class BackupService {
  static async createWorkflowBackup(workflow: FlowiseWorkflow): Promise<boolean> {
    try {
      const backupData = {
        // Metadados do backup
        backupInfo: {
          createdAt: new Date().toISOString(),
          version: "1.0",
          createdBy: "system",
          description: `Backup automático do workflow ${workflow.name}`
        },
        
        // Dados completos do workflow
        workflow: {
          id: workflow.id,
          flowiseId: workflow.flowiseId,
          name: workflow.name,
          description: workflow.description,
          type: workflow.type,
          flowData: workflow.flowData,
          deployed: workflow.deployed,
          isPublic: workflow.isPublic,
          category: workflow.category,
          workspaceId: workflow.workspaceId,
          
          // Métricas e complexidade
          complexityScore: workflow.complexityScore,
          nodeCount: workflow.nodeCount,
          edgeCount: workflow.edgeCount,
          maxDepth: workflow.maxDepth,
          
          // Capacidades e configurações
          capabilities: workflow.capabilities,
          nodes: workflow.nodes,
          connections: workflow.connections,
          
          // Timestamps
          createdAt: workflow.createdAt,
          updatedAt: workflow.updatedAt
        },
        
        // Contexto adicional
        context: {
          systemVersion: process.env.npm_package_version,
          environment: process.env.NODE_ENV,
          backupReason: "deletion"
        }
      };

      // Criar blob para download
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow_backup_${workflow.name}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('✅ Backup criado com sucesso:', backupData.backupInfo);
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao criar backup:', error);
      return false;
    }
  }
}
```

### 3. AdvancedDeleteService (Serviço de Exclusão)

Serviço principal que coordena as operações de exclusão:

```typescript
export class AdvancedDeleteService {
  static async executeAdvancedDelete({
    workflow,
    options
  }: {
    workflow: FlowiseWorkflow;
    options: DeleteOptions;
  }): Promise<DeleteResult> {
    const result: DeleteResult = {
      success: false,
      deletedFromZanAI: false,
      deletedFromFlowise: false,
      backupCreated: false,
      errors: [],
      warnings: []
    };

    try {
      // Etapa 1: Criar backup se solicitado
      if (options.createBackup) {
        const backupSuccess = await BackupService.createWorkflowBackup(workflow);
        result.backupCreated = backupSuccess;
        
        if (!backupSuccess) {
          result.warnings.push("O backup falhou, mas a exclusão continuará");
        }
      }

      // Etapa 2: Excluir do Flowise se solicitado
      if (options.deleteFromFlowise) {
        const flowiseResult = await this.deleteFromFlowise(workflow.flowiseId);
        result.deletedFromFlowise = flowiseResult.success;
        
        if (!flowiseResult.success) {
          result.errors.push(flowiseResult.error || "Falha ao excluir do Flowise");
        }
      }

      // Etapa 3: Excluir do ZanAI se solicitado
      if (options.deleteFromZanAI) {
        const zanaiResult = await this.deleteFromZanAI(workflow.flowiseId, options.deleteFromFlowise);
        result.deletedFromZanAI = zanaiResult.success;
        
        if (!zanaiResult.success) {
          result.errors.push(zanaiResult.error || "Falha ao excluir do ZanAI");
        }
      }

      // Determinar sucesso geral
      result.success = this.determineOverallSuccess(result, options);

      return result;

    } catch (error) {
      result.errors.push(`Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return result;
    }
  }

  private static async deleteFromFlowise(flowiseId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const flowiseBaseUrl = "https://aaranha-zania.hf.space";
      const deleteUrl = `${flowiseBaseUrl}/api/v1/chatflows/${flowiseId}`;
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.FLOWISE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ Workflow excluído com sucesso do Flowise externo');
        return { success: true };
      } else {
        const errorText = await response.text();
        const error = `Falha ao excluir do Flowise: ${response.status} - ${errorText}`;
        console.warn('⚠️', error);
        return { success: false, error };
      }
    } catch (error) {
      const errorMsg = `Erro ao excluir do Flowise: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      console.error('❌', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  private static async deleteFromZanAI(flowiseId: string, skipFlowiseDelete: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/v1/flowise-workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_workflow',
          data: { 
            flowiseId,
            skipFlowiseDelete
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('✅ Workflow excluído com sucesso do ZanAI');
          return { success: true };
        } else {
          return { success: false, error: result.error || 'Falha ao excluir do ZanAI' };
        }
      } else {
        const errorText = await response.text();
        const error = `Falha na API do ZanAI: ${response.status} - ${errorText}`;
        console.error('❌', error);
        return { success: false, error };
      }
    } catch (error) {
      const errorMsg = `Erro ao excluir do ZanAI: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      console.error('❌', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  private static determineOverallSuccess(result: DeleteResult, options: DeleteOptions): boolean {
    const requestedOperations = [
      options.deleteFromZanAI,
      options.deleteFromFlowise
    ].filter(Boolean).length;

    const successfulOperations = [
      result.deletedFromZanAI,
      result.deletedFromFlowise
    ].filter(Boolean).length;

    // Sucesso se todas as operações solicitadas foram bem-sucedidas
    // ou se não houve operações solicitadas (apenas backup)
    return successfulOperations === requestedOperations || requestedOperations === 0;
  }
}
```

### 4. DeleteResult (Tipo de Resposta)

Interface para padronizar as respostas de exclusão:

```typescript
interface DeleteResult {
  success: boolean;
  deletedFromZanAI: boolean;
  deletedFromFlowise: boolean;
  backupCreated: boolean;
  errors: string[];
  warnings: string[];
}

interface DeleteResultDetails {
  deletedFromZanAI: boolean;
  deletedFromFlowise: boolean;
  skipFlowiseDelete: boolean;
  flowiseError?: string;
  flowiseId: string;
}
```

## 🚀 Fluxo de Execução

### 1. Inicialização
```
Usuário clica em "Excluir" → 
Abre DeleteConfirmationModal → 
Usuário configura as opções → 
Clica em "Confirmar Exclusão"
```

### 2. Execução do Backup (se solicitado)
```
Verifica se createBackup = true →
Chama BackupService.createWorkflowBackup() →
Gera arquivo JSON com todos os dados →
Baixa arquivo automaticamente →
Registra sucesso/falha
```

### 3. Exclusão do Flowise (se solicitado)
```
Verifica se deleteFromFlowise = true →
Chama API externa do Flowise →
Envia requisição DELETE →
Processa resposta →
Registra sucesso/falha
```

### 4. Exclusão do ZanAI (se solicitado)
```
Verifica se deleteFromZanAI = true →
Chama API interna do ZanAI →
Envia requisição com skipFlowiseDelete →
Processa resposta →
Registra sucesso/falha
```

### 5. Processamento Final
```
Agrega todos os resultados →
Determina sucesso geral →
Gera mensagem apropriada →
Exibe feedback para usuário →
Recarrega dados da interface
```

## 📊 Cenários de Uso

### Cenário 1: Exclusão Completa com Backup
```typescript
const options = {
  deleteFromZanAI: true,
  deleteFromFlowise: true,
  createBackup: true
};

// Resultado esperado:
// - Backup criado e baixado
// - Workflow excluído do ZanAI
// - Workflow excluído do Flowise
// - Mensagem: "✅ Exclusão completa com backup!"
```

### Cenário 2: Exclusão Apenas do Banco Local
```typescript
const options = {
  deleteFromZanAI: true,
  deleteFromFlowise: false,
  createBackup: false
};

// Resultado esperado:
// - Workflow excluído apenas do ZanAI
// - Workflow mantido no Flowise
// - Mensagem: "✅ Excluído do banco ZanAI"
```

### Cenário 3: Backup sem Exclusão
```typescript
const options = {
  deleteFromZanAI: false,
  deleteFromFlowise: false,
  createBackup: true
};

// Resultado esperado:
// - Backup criado e baixado
// - Nenhuma exclusão realizada
// - Mensagem: "✅ Backup criado com sucesso!"
```

### Cenário 4: Exclusão Parcial com Erro
```typescript
const options = {
  deleteFromZanAI: true,
  deleteFromFlowise: true,
  createBackup: false
};

// Se Flowise falhar:
// - Workflow excluído do ZanAI
// - Workflow não excluído do Flowise
// - Mensagem: "⚠️ Exclusão parcial: ZanAI ok, Flowise falhou"
```

## 🔍 Tratamento de Erros

### Tipos de Erros

1. **Erros de Rede**
   - Falha de conexão com API externa
   - Timeout de requisição
   - Erros de DNS/resolução

2. **Erros de API**
   - Respostas 4xx/5xx
   - Formato de resposta inválido
   - Tokens de autenticação inválidos

3. **Erros de Backup**
   - Falha ao gerar blob
   - Falha ao baixar arquivo
   - Dados corrompidos

4. **Erros de Banco de Dados**
   - Registro não encontrado
   - Violação de constraints
   - Conflitos de concorrência

### Estratégias de Recuperação

1. **Retry Automático**
   ```typescript
   const retryOperation = async (operation, maxRetries = 3) => {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await operation();
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
       }
     }
   };
   ```

2. **Fallback Parcial**
   ```typescript
   // Se uma operação falhar, continuar com as outras
   const results = await Promise.allSettled([
     deleteFromFlowise(),
     deleteFromZanAI(),
     createBackup()
   ]);
   ```

3. **Rollback Manual**
   ```typescript
   // Se falhar após algumas operações, oferecer opção de desfazer
   if (partialSuccess && hasFailures) {
     const shouldRollback = confirm("Algumas operações falharam. Deseja tentar desfazer as alterações?");
     if (shouldRollback) {
       await rollbackOperations();
     }
   }
   ```

## 📈 Métricas e Monitoramento

### Métricas Coletadas

1. **Métricas de Sucesso**
   - Taxa de sucesso geral
   - Taxa de sucesso por operação (ZanAI, Flowise, Backup)
   - Tempo médio de execução

2. **Métricas de Erro**
   - Tipos de erros mais comuns
   - Sistemas com maior falha
   - Tempo médio de recuperação

3. **Métricas de Uso**
   - Opções mais utilizadas
   - Frequência de backups
   - Tamanho médio dos backups

### Monitoramento

```typescript
// Exemplo de métricas
const deletionMetrics = {
  totalOperations: 0,
  successfulOperations: 0,
  failedOperations: 0,
  averageExecutionTime: 0,
  backupSuccessRate: 0,
  flowiseSuccessRate: 0,
  zanaiSuccessRate: 0,
  mostUsedOptions: {
    deleteFromZanAI: 0,
    deleteFromFlowise: 0,
    createBackup: 0
  }
};
```

## 🔒 Segurança

### Validações de Segurança

1. **Permissões**
   ```typescript
   const checkDeletePermissions = (user: User, workflow: FlowiseWorkflow) => {
     return user.role === 'admin' || 
            user.workspaceId === workflow.workspaceId ||
            user.id === workflow.createdBy;
   };
   ```

2. **CSRF Protection**
   ```typescript
   const csrfToken = getCSRFToken();
   headers.append('X-CSRF-Token', csrfToken);
   ```

3. **Rate Limiting**
   ```typescript
   const rateLimitKey = `delete_${user.id}_${Date.now()}`;
   if (await rateLimiter.isLimited(rateLimitKey)) {
     throw new Error('Too many delete requests');
   }
   ```

### Auditoria

```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: 'delete_workflow';
  targetId: string;
  targetType: 'workflow';
  timestamp: Date;
  details: {
    options: DeleteOptions;
    result: DeleteResult;
    ipAddress: string;
    userAgent: string;
  };
}
```

## 🧪 Testes

### Testes Unitários

```typescript
describe('BackupService', () => {
  it('should create backup with correct structure', async () => {
    const mockWorkflow = createMockWorkflow();
    const result = await BackupService.createWorkflowBackup(mockWorkflow);
    
    expect(result).toBe(true);
    // Verificar se o download foi chamado
    expect(mockDownload).toHaveBeenCalled();
  });

  it('should handle backup creation failure', async () => {
    const mockWorkflow = createMockWorkflow();
    mockBlobCreation.mockImplementation(() => { throw new Error('Blob error'); });
    
    const result = await BackupService.createWorkflowBackup(mockWorkflow);
    expect(result).toBe(false);
  });
});
```

### Testes de Integração

```typescript
describe('AdvancedDeleteService', () => {
  it('should execute complete deletion with backup', async () => {
    const options = {
      deleteFromZanAI: true,
      deleteFromFlowise: true,
      createBackup: true
    };
    
    const result = await AdvancedDeleteService.executeAdvancedDelete({
      workflow: mockWorkflow,
      options
    });
    
    expect(result.success).toBe(true);
    expect(result.backupCreated).toBe(true);
    expect(result.deletedFromZanAI).toBe(true);
    expect(result.deletedFromFlowise).toBe(true);
  });
});
```

## 🚀 Implantação

### Pré-requisitos

1. **Variáveis de Ambiente**
   ```bash
   FLOWISE_API_KEY=your-flowise-api-key
   FLOWISE_BASE_URL=https://your-flowise-instance.com
   BACKUP_STORAGE_PATH=./backups
   ```

2. **Dependências**
   ```bash
   npm install lucide-react @radix-ui/react-alert-dialog @radix-ui/react-checkbox
   ```

### Configuração

1. **Importar Componentes**
   ```typescript
   import { DeleteConfirmationModal } from '@/components/workflow/DeleteConfirmationModal';
   import { AdvancedDeleteService } from '@/lib/services/AdvancedDeleteService';
   import { BackupService } from '@/lib/services/BackupService';
   ```

2. **Adicionar ao Componente Principal**
   ```typescript
   const FlowiseWorkflowManager = () => {
     // ... existing code ...
     
     const handleDelete = (workflow: FlowiseWorkflow) => {
       setSelectedWorkflow(workflow);
       setDeleteDialogOpen(true);
     };
     
     return (
       <div>
         {/* ... existing components ... */}
         <DeleteConfirmationModal />
       </div>
     );
   };
   ```

## 📚 Melhorias Futuras

### Planejado

1. **Restauração de Workflows**
   - Interface para upload de backups
   - Validação de integridade
   - Merge de dados

2. **Agendamento de Exclusão**
   - Exclusão programada
   - Notificações prévias
   - Cancelamento

3. **Backup em Nuvem**
   - Integração com AWS S3
   - Backup automático periódico
   - Versionamento

4. **Analytics Avançado**
   - Dashboard de métricas
   - Análise de padrões
   - Alertas proativos

### Otimizações

1. **Performance**
   - Execução paralela
   - Cache inteligente
   - Compressão de backups

2. **Experiência do Usuário**
   - Animções mais suaves
   - Feedback mais detalhado
   - Modo escuro

3. **Segurança**
   - Criptografia de backups
   - Assinatura digital
   - Controle de acesso granular

## 🎉 Conclusão

O Sistema de Exclusão Avançada com Backup representa uma evolução significativa na gestão de workflows, proporcionando:

- ✅ **Segurança**: Backup automático e controle granular
- ✅ **Flexibilidade**: Múltiplos cenários de exclusão
- ✅ **Transparência**: Feedback detalhado e auditável
- ✅ **Recuperação**: Capacidade de restauração a partir de backups
- ✅ **Performance**: Operações otimizadas e paralelas
- ✅ **Experiência do Usuário**: Interface intuitiva e responsiva

Esta implementação estabelece um novo padrão de qualidade e segurança para operações críticas no sistema, servindo como base para futuras melhorias e funcionalidades.