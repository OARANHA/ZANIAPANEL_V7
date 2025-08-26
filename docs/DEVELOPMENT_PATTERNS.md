# Guia de Desenvolvimento - Padrões Modulares

## 🎯 Objetivo

Este guia estabelece padrões e melhores práticas para desenvolvimento de componentes modulares, baseado na refatoração bem-sucedida do `HybridWorkflowEditor`.

## 📋 Princípios Fundamentais

### 1. **Single Responsibility Principle (SRP)**
Cada arquivo/componente deve ter uma única responsabilidade:

```typescript
// ❌ Evitar - Componente fazendo muitas coisas
function ComplexComponent() {
  // Lógica de API
  // Estado de UI
  // Validação
  // Cálculos
  // Renderização
}

// ✅ Preferir - Responsabilidades separadas
function MyComponent() {
  const { data, loading } = useApiData();
  const { validation } = useValidation(data);
  const { calculations } = useCalculations(data);
  
  return <UI data={data} validation={validation} />;
}
```

### 2. **Separation of Concerns**
Separar lógica por tipo de responsabilidade:

```
components/MyFeature/
├── index.tsx              # Componente principal
├── hooks/                 # Lógica de negócio
├── components/           # Componentes de UI
├── utils/                # Funções utilitárias
└── types/                # Definições de tipos
```

### 3. **Composição sobre Herança**
Preferir composição de componentes:

```typescript
// ✅ Composição
function FeatureEditor() {
  return (
    <div>
      <FeatureHeader />
      <FeatureTabs>
        <TabContent1 />
        <TabContent2 />
      </FeatureTabs>
      <FeatureActions />
    </div>
  );
}
```

## 🏗️ Estrutura de Diretórios

### Template Base
```
src/components/[area]/[ComponentName]/
├── index.tsx                    # Componente principal
├── types/
│   └── index.ts                 # Types e interfaces
├── hooks/                       # Hooks personalizados
│   ├── use[Component]State.ts   # Estado principal
│   ├── use[Component]Api.ts     # Lógica de API
│   └── use[Component]Logic.ts   # Lógica de negócio
├── components/                  # Sub-componentes
│   ├── [Component]Header.tsx    # Header/cabeçalho
│   ├── [Component]Content.tsx   # Conteúdo principal
│   ├── [Component]Actions.tsx   # Ações/botões
│   └── [Component]Tabs.tsx      # Sistema de abas
├── utils/                       # Utilitários
│   ├── [component]Helpers.ts    # Funções auxiliares
│   ├── [component]Validation.ts # Validações
│   └── [component]Constants.ts  # Constantes
└── __tests__/                   # Testes (opcional)
    ├── [Component].test.tsx
    └── hooks/
```

## 🎣 Padrões de Hooks

### 1. **Hook de Estado Principal**
```typescript
// hooks/useFeatureState.ts
export function useFeatureState(initialData: FeatureData) {
  const [data, setData] = useState(initialData);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsEditing(true);
  };

  const handleSave = async (updates: any) => {
    // Lógica de salvamento
    setIsEditing(false);
  };

  return {
    data,
    setData,
    selectedItem,
    isEditing,
    setIsEditing,
    handleEdit,
    handleSave
  };
}
```

### 2. **Hook de API**
```typescript
// hooks/useFeatureApi.ts
export function useFeatureApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/feature/${id}`);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (data: FeatureData) => {
    // Lógica de salvamento
  };

  return {
    loading,
    error,
    fetchData,
    saveData
  };
}
```

### 3. **Hook de Validação**
```typescript
// hooks/useFeatureValidation.ts
export function useFeatureValidation(data: FeatureData) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState(true);

  const validate = useCallback(() => {
    const newErrors: ValidationErrors = {};
    
    if (!data.name) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
    
    return Object.keys(newErrors).length === 0;
  }, [data]);

  useEffect(() => {
    validate();
  }, [validate]);

  return {
    errors,
    isValid,
    validate
  };
}
```

## 🧩 Padrões de Componentes

### 1. **Componente Principal**
```typescript
// index.tsx
export default function FeatureEditor({
  initialData,
  onSave,
  onCancel
}: FeatureEditorProps) {
  // Hooks de lógica
  const { data, handleSave } = useFeatureState(initialData);
  const { loading, saveData } = useFeatureApi();
  const { errors, isValid } = useFeatureValidation(data);

  // Handlers
  const handleSubmit = async () => {
    if (isValid) {
      await saveData(data);
      onSave?.(data);
    }
  };

  // Renderização modular
  return (
    <div className="feature-editor">
      <FeatureHeader data={data} />
      <FeatureContent 
        data={data} 
        errors={errors}
        onChange={setData}
      />
      <FeatureActions 
        onSave={handleSubmit}
        onCancel={onCancel}
        disabled={!isValid || loading}
      />
    </div>
  );
}
```

### 2. **Sub-componentes Especializados**
```typescript
// components/FeatureHeader.tsx
interface FeatureHeaderProps {
  data: FeatureData;
  actions?: React.ReactNode;
}

export default function FeatureHeader({ 
  data, 
  actions 
}: FeatureHeaderProps) {
  return (
    <header className="feature-header">
      <div className="feature-title">
        <h1>{data.title}</h1>
        <Badge variant="outline">{data.status}</Badge>
      </div>
      {actions && (
        <div className="feature-actions">
          {actions}
        </div>
      )}
    </header>
  );
}
```

## 📝 Convenções de Nomenclatura

### Arquivos e Diretórios
```
PascalCase     - Componentes (FeatureEditor.tsx)
camelCase      - Hooks (useFeatureState.ts)
camelCase      - Utilitários (featureHelpers.ts)
kebab-case     - Diretórios multi-palavra (feature-editor/)
UPPER_CASE     - Constantes (FEATURE_CONSTANTS.ts)
```

### Funções e Variáveis
```typescript
// Hooks
const useFeatureLogic = () => {};

// Handlers
const handleSubmit = () => {};
const handleChange = () => {};

// Estados booleanos
const [isLoading, setIsLoading] = useState(false);
const [hasError, setHasError] = useState(false);

// Callbacks
const onSave = () => {};
const onCancel = () => {};
```

## 🔧 Utilitários e Helpers

### Estrutura de Utils
```typescript
// utils/featureHelpers.ts
export const calculateComplexity = (data: FeatureData): number => {
  // Lógica de cálculo
};

export const validateFeature = (data: FeatureData): ValidationResult => {
  // Lógica de validação
};

export const formatFeatureData = (raw: RawData): FeatureData => {
  // Formatação de dados
};
```

### Constantes
```typescript
// utils/featureConstants.ts
export const FEATURE_TYPES = {
  BASIC: 'basic',
  ADVANCED: 'advanced',
  PREMIUM: 'premium'
} as const;

export const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500
} as const;
```

## 🧪 Testes

### Estrutura de Testes
```
__tests__/
├── FeatureEditor.test.tsx       # Testes do componente principal
├── components/                  # Testes de sub-componentes
│   ├── FeatureHeader.test.tsx
│   └── FeatureContent.test.tsx
├── hooks/                       # Testes de hooks
│   ├── useFeatureState.test.ts
│   └── useFeatureApi.test.ts
└── utils/                       # Testes de utilitários
    └── featureHelpers.test.ts
```

### Exemplo de Teste de Hook
```typescript
// __tests__/hooks/useFeatureState.test.ts
import { renderHook, act } from '@testing-library/react';
import { useFeatureState } from '../../hooks/useFeatureState';

describe('useFeatureState', () => {
  it('should initialize with provided data', () => {
    const initialData = { name: 'Test', status: 'active' };
    const { result } = renderHook(() => useFeatureState(initialData));
    
    expect(result.current.data).toEqual(initialData);
    expect(result.current.isEditing).toBe(false);
  });

  it('should handle edit action', () => {
    const { result } = renderHook(() => useFeatureState({}));
    
    act(() => {
      result.current.handleEdit({ id: '1', name: 'Item' });
    });
    
    expect(result.current.selectedItem).toEqual({ id: '1', name: 'Item' });
    expect(result.current.isEditing).toBe(true);
  });
});
```

## 📊 Métricas de Qualidade

### Limites Recomendados
- **Linhas por arquivo**: Máximo 200 linhas
- **Complexidade ciclomática**: Máximo 10
- **Número de props**: Máximo 8 props por componente
- **Profundidade de nesting**: Máximo 4 níveis

### Checklist de Qualidade
- [ ] Componente tem responsabilidade única
- [ ] Props são tipadas com TypeScript
- [ ] Hooks são reutilizáveis
- [ ] Componentes são testáveis
- [ ] Documentação está atualizada
- [ ] Performance é adequada
- [ ] Acessibilidade é considerada

## 🚀 Migração de Componentes Existentes

### Processo de Refatoração
1. **Análise**: Identificar responsabilidades do componente
2. **Planejamento**: Definir estrutura modular
3. **Extração**: Criar hooks para lógica de negócio
4. **Decomposição**: Dividir UI em sub-componentes
5. **Testes**: Implementar testes para cada módulo
6. **Documentação**: Atualizar documentação

### Template de PR para Refatoração
```markdown
## Refatoração: [ComponentName]

### Resumo
- Dividido componente de XXX linhas em estrutura modular
- Extraído X hooks personalizados
- Criado X sub-componentes especializados

### Estrutura
- [ ] index.tsx (componente principal)
- [ ] hooks/ (lógica de negócio)
- [ ] components/ (sub-componentes)
- [ ] utils/ (utilitários)
- [ ] types/ (definições de tipos)

### Benefícios
- Melhoria na manutenibilidade
- Facilitação de testes
- Reutilização de código
- Melhor organização

### Breaking Changes
- [ ] Nenhum (compatibilidade mantida via proxy)
- [ ] Alguns imports foram alterados
```

---

**Versão**: 1.0  
**Última atualização**: 2025-01-24  
**Status**: 📋 Ativo