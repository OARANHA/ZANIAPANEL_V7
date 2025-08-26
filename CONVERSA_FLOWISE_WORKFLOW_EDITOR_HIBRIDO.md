# Conversa: Editor Híbrido de Workflows Flowise

**Data:** 2025-06-18  
**Participantes:** OARANHA, Claude AI  
**Contexto:** Planejamento da evolução do `/admin/flowise-workflows`

---

## 🎯 **Fluxo de Valor Completo**

### **1. Ponto de Partida: Flowise (Fonte da Verdade)**
```
Flowise → Workflow Completo
├── System Prompt (definição do agente)
├── Context Prompt (contexto de negócio)
├── User Prompt (interação)
├── Learning Data (dados de treinamento)
├── Documents (RAG)
├── Agents (configuração)
└── API Config (integrações)
```

### **2. Estação Central: /admin/flowise-workflows (Edição Híbrida)**
```
Workflow Editor Híbrido
├── Canvas Visual (mostra a estrutura)
│   ├── Nodes visíveis (LLM, RAG, Tools, etc.)
│   ├── Conexões entre componentes
│   └── Fluxo de dados identificado
└── Formulários Detalhados (clica no node)
    ├── System Prompt Editor
    ├── Context Configuration
    ├── Document Management
    ├── Agent Settings
    └── Integration Parameters
```

### **3. Ponto de Chegada: /admin/agents (Publicação e Controle)**
```
Agent Management
├── Published Agents (do workflow editado)
├── Client Assignment (para quais clientes)
├── Usage Control (limites, permissões)
├── Performance Monitoring
└── API Endpoints (para integração cliente)
```

---

## 💡 **Lógica do Editor Híbrido - Como Funcionaria**

### **Canvas Visual (O "Onde")**
- **Mapa do Território**: Mostra "onde" as coisas estão conectadas
- **Identificação Rápida**: Visualiza gargalos, dependências, complexidade
- **Navegação Intuitiva**: Clica no node que quer editar
- **Contexto Constante**: Mesmo editando detalhes, vê o todo

### **Formulários Detalhados (O "O quê")**
- **Edição Precisa**: Configura "o quê" cada componente faz
- **Validação Inteligente**: Garante que prompts, configurações estão corretos
- **Contexto Específico**: Cada tipo de node tem seu formulário adequado

---

### **Exemplo Prático de Fluxo:**

#### **1. Importação do Flowise:**
```javascript
// Vem do Flowise:
{
  "nodes": [
    {
      "id": "llm_1",
      "type": "LLMChain",
      "data": {
        "systemPrompt": "Você é um assistente especializado em...",
        "model": "gpt-4",
        "temperature": 0.7
      }
    },
    {
      "id": "rag_1", 
      "type": "RetrievalQA",
      "data": {
        "documents": ["doc_1", "doc_2"],
        "retriever": "vector_store"
      }
    }
  ],
  "connections": [
    {"from": "rag_1", "to": "llm_1", "type": "context"}
  ]
}
```

#### **2. Experiência de Edição Híbrida:**
```
Usuário vê no Canvas:
[LLM Chain] → [Retrieval QA]
    ↓            ↓
 (System      (Documents
  Prompt)      Management)

Clica no LLM Chain → Abre formulário:
├── System Prompt (textarea grande)
├── Model Selection (dropdown)
├── Temperature (slider)
├── Max Tokens (number)
└── Test Prompt (botão para testar)

Clica no Retrieval QA → Abre formulário:
├── Document Upload (drag & drop)
├── Vector Store Config (campos)
├── Chunk Size (number)
├── Similarity Threshold (slider)
└── Test Retrieval (botão)
```

#### **3. Publicação para /admin/agents:**
```javascript
// Envia para agents:
{
  "agentId": "agent_123",
  "source": "workflow_editor",
  "configuration": {
    "systemPrompt": "...",  // editado no formulário
    "ragConfig": {...},     // editado no formulário
    "apiEndpoint": "/api/v1/agents/agent_123/chat",
    "workflowId": "flow_456"
  },
  "clients": ["client_1", "client_2"],
  "status": "published"
}
```

---

## 🔄 **Benefícios Estratégicos dessa Abordagem**

### **1. Controle Total:**
- **O que funciona**: Importamos exatamente o que está funcionando no Flowise
- **Edição Precisa**: Modificamos apenas o necessário, sem quebrar
- **Publicação Controlada**: Decidimos quando e para quem publicar

### **2. Experiência do Usuário:**
- **Visual para Entendimento**: Canvas mostra como tudo se conecta
- **Detalhe para Precisão**: Formulários garantem configuração correta
- **Confiança**: Usuário vê o todo e edita as partes com segurança

### **3. Integração Perfeita:**
- **Flowise → Editor**: Importamos a verdade que funciona
- **Editor → Agents**: Publicamos o que está validado
- **Agents → Clientes**: Entregamos valor controlado

---

## 🎯 **Perguntas para Alinhamento Final:**

1. **O canvas precisa ser interativo (arrastar nodes) ou apenas visual?**
2. **Os formulários devem ser modais ou painel lateral?**
3. **Queremos testar os prompts durante a edição?**
4. **A publicação para agents deve ser manual ou automática?**

---

## 📋 **Decisões Tomadas:**

### **Abordagem Escolhida:** Híbrida (Canvas Visual + Formulários Detalhados)

### **Justificativa:**
- **Valor Imediato**: Aproveita infraestrutura existente
- **Risco Controlado**: Implementação mais previsível
- **Caminho Evolutivo**: Permite evoluir para IDE visual completo
- **Experiência Balanceada**: Melhor de ambos os mundos

### **Fases de Implementação:**
1. **Fase 1**: Canvas visual + formulários detalhados (3-4 semanas)
2. **Fase 2**: Adicionar edição visual básica (2-3 semanas)
3. **Fase 3**: Edição avançada e colaboração (4-6 semanas)

---

## 🔗 **Conexão com Outros Sistemas:**

- **Flowise**: Fonte da verdade dos workflows
- **/admin/learning**: Sistema de aprendizado baseado em padrões
- **/admin/agents**: Publicação e controle de agentes
- **Clientes**: Entrega final do valor

---

**Status:** Alinhado ✅  
**Próximos Passos:** Implementar Fase 1 do Editor Híbrido