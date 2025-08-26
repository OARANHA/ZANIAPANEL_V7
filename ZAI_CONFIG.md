# Configuração da ZAI API Key

## Problema
O sistema de execução de agentes requer a variável de ambiente `ZAI_API_KEY` para funcionar corretamente com a API de IA real. Quando esta variável não está configurada, o sistema entra em modo de fallback e retorna respostas simuladas.

## Solução

### 1. Configurar a variável de ambiente

Adicione a seguinte linha ao seu arquivo `.env`:

```bash
ZAI_API_KEY=sua_chave_de_api_aqui
```

### 2. Obter uma chave de API

Para obter uma chave de API ZAI:

1. Entre em contato com o administrador do sistema
2. Acesse o portal de desenvolvedores ZAI
3. Registre sua aplicação e gere uma chave de API

### 3. Reiniciar o servidor

Após configurar a variável de ambiente, reinicie o servidor:

```bash
npm run dev
```

## Comportamento do sistema

### Com ZAI_API_KEY configurada:
- ✅ Execução real de agentes com API de IA
- ✅ Respostas inteligentes e contextualizadas
- ✅ Aprendizado contínuo baseado nas execuções
- ✅ Integração completa com o ecossistema ZAI

### Sem ZAI_API_KEY (modo fallback):
- ⚠️ Respostas simuladas com mensagens informativas
- ⚠️ Sistema continua funcionando para testes
- ⚠️ Avisa o usuário que a API não está configurada
- ⚠️ Permite testar a interface sem custos

## Exemplo de resposta em modo fallback

```
[Resposta Simulada - ZAI não configurado]

Agente: Assistente Virtual
Input: Olá, como você está?

Esta é uma resposta simulada porque a ZAI_API_KEY não está configurada no ambiente. Para habilitar a execução real, configure a variável de ambiente ZAI_API_KEY.
```

## Validação da configuração

O sistema valida a configuração da ZAI API Key nos seguintes pontos:

1. **Inicialização do serviço**: Verifica se a chave existe e tem comprimento mínimo
2. **Execução de agentes**: Tenta inicializar a API antes de cada execução
3. **Fallback automático**: Se a API falhar, usa modo simulado

## Logs úteis

Quando o ZAI está sendo inicializado, você verá logs como:

```
Inicializando ZAI com configuração...
Configuração ZAI: {"apiKey":"***","baseUrl":...,"model":"glm-4.5-flash"}
ZAI inicializado com sucesso
```

Em modo fallback, os logs serão:

```
Inicializando ZAI com configuração...
Erro ao inicializar ZAI: ZAI_API_KEY não está configurada
ZAI não disponível, usando modo de fallback
ZAI não disponível, usando resposta simulada
```

## Segurança

⚠️ **Importante**: Nunca commit seu arquivo `.env` com chaves de API reais. O arquivo `.env` já está no `.gitignore` para proteger suas credenciais.

## Desenvolvimento

Para desenvolvimento e testes, você pode usar o modo fallback sem problemas. Para produção, certifique-se de configurar a ZAI_API_KEY corretamente.