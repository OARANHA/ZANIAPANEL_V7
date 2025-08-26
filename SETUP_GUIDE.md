# 🚀 Guia de Configuração Inicial

## Passo a Passo para Iniciar o Projeto Limpo

### 1. Clonar o Repositório
```bash
git clone <url-do-repositorio>
cd <nome-do-projeto>
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie o arquivo `.env.local` na raiz do projeto:

```bash
# Banco de Dados
DATABASE_URL="file:./dev.db"

# Autenticação (opcional - o sistema usa cookies)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"

# Flowise (configure quando tiver instância)
FLOWISE_API_URL="http://localhost:3000/api/v1"
FLOWISE_API_KEY="sua-api-key-flowise"

# Outras variáveis
NODE_ENV="development"
```

### 4. Configurar o Banco de Dados
```bash
# Gerar Prisma Client
npx prisma generate

# Fazer push do schema para o banco
npm run db:push

# (Opcional) Visualizar o banco
npx prisma studio
```

### 5. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

### 6. Acessar o Sistema
- **URL:** http://localhost:3000
- **Login:** Use o Super Admin que já existe no banco

### 7. Fazer Login como Super Admin
O sistema já tem um usuário Super Admin criado:
- **Email:** superadmin@zanai.com
- **Nome:** Super Administrador
- **Role:** SUPER_ADMIN

**Como fazer login:**
1. Acesse http://localhost:3000
2. Clique em "Login" ou "Entrar"
3. Use o email `superadmin@zanai.com`
4. O sistema vai criar os cookies de autenticação automaticamente

### 8. Verificar o Sistema
Após login, verifique se tudo está funcionando:

#### 🏢 Dashboard Principal
- Deve mostrar estatísticas do sistema
- Workspaces e agentes devem estar visíveis

#### 🤖 Página de Agentes (/admin/agents)
- Deve mostrar os 2 agentes do Super Admin:
  - Analista de Negócios
  - Especialista em Marketing Digital

#### 🎨 Página Studio (/admin/studio)
- Deve estar funcionando
- Pode importar workflows do Learning

#### 🧠 Página Learning (/admin/learning)
- Deve mostrar os 2 workflows Flowise para análise:
  - Combinação Soft.Eng.+Revisor Codigo
  - Fluxo de bate-Papo

### 9. Importar Workflows do Flowise (Opcional)
Se você tiver uma instância do Flowise rodando:

#### Configure a conexão Flowise
No arquivo `.env.local`:
```bash
FLOWISE_API_URL="http://localhost:3000/api/v1"
FLOWISE_API_KEY="sua-api-key"
```

#### Sincronize os workflows
Acesse a página de administração e use as ferramentas de sincronização.

### 10. Estrutura do Projeto
```
src/
├── app/                    # Páginas e API routes
│   ├── admin/             # Páginas de administração
│   │   ├── agents/        # Gerenciamento de agentes
│   │   ├── studio/        # Studio de workflows
│   │   └── learning/      # Sistema de aprendizado
│   └── api/               # Endpoints API
│       └── v1/            # API versionada
├── components/            # Componentes React
├── lib/                  # Bibliotecas e utilitários
│   ├── auth.ts           # Sistema de autenticação
│   └── db.ts             # Conexão com banco de dados
└── prisma/               # Schema e migrations
```

### 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Iniciar servidor dev
npm run build        # Build para produção
npm run start        # Iniciar servidor produção

# Banco de Dados
npm run db:push      # Sincronizar schema com banco
npm run db:studio    # Abrir Prisma Studio
npx prisma generate  # Gerar Prisma Client

# Código
npm run lint         # Verificar código
npm run format       # Formatar código (se tiver Prettier)
```

### 🐛 Solução de Problemas Comuns

#### Problema: "Banco de dados não encontrado"
```bash
# Execute o push do schema
npm run db:push
```

#### Problema: "Autenticação não funciona"
```bash
# Verifique se os cookies estão sendo criados
# Limpe os cookies do navegador e tente fazer login novamente
```

#### Problema: "APIs não respondem"
```bash
# Verifique se o servidor está rodando
npm run dev
```

#### Problema: "Workflows Flowise não aparecem"
```bash
# Os workflows já estão no banco, verifique a página /admin/learning
# Se não aparecerem, pode ser um problema de permissão
```

### 📱 Fluxo de Trabalho Recomendado

1. **Login** como Super Admin
2. **Explorar** os agentes existentes
3. **Acessar** o Learning para ver os workflows Flowise
4. **Analisar** os workflows disponíveis
5. **Exportar** workflows interessantes para o Studio
6. **Criar** novos agentes baseados nos padrões aprendidos

### 🎯 Próximos Passos Após Configuração

1. **Conectar ao Flowise real** se tiver uma instância
2. **Importar mais workflows** para análise
3. **Criar novos templates** baseados nos padrões
4. **Desenvolver novos agentes** usando os templates
5. **Testar o sistema** com fluxos de trabalho reais

---

O sistema está limpo, configurado e pronto para uso! 🚀