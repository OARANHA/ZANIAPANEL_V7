# 🚀 Guia de Primeira Instalação - Zanai AI Platform

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn

## 🛠️ Instalação Completa

Siga estes passos para configurar a aplicação do zero:

### 1. Clonar o Repositório
```bash
git clone <repository-url>
cd zanai-platform
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` (se existir) ou crie um arquivo `.env`:
```bash
cp .env.example .env  # se existir
# ou crie manualmente: nano .env
```

Adicione as seguintes variáveis ao arquivo `.env`:
```bash
# Banco de Dados
DATABASE_URL=file:./dev.db

# Z.ai SDK
ZAI_BASE_URL=https://api.z.ai/api/paas/v4/
ZAI_API_KEY=sua-chave-api-aqui

# Flowise Configuration
FLOWISE_BASE_URL=https://aaranha-zania.hf.space
FLOWISE_API_KEY=wNFL5HJcOA3RwJdKiVTUWqdzigK7OCUwRKo9KEgjenw
NEXT_PUBLIC_FLOWISE_URL=https://aaranha-zania.hf.space

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua-chave-secreta-aqui
```

### 4. Executar Setup Completo
```bash
npm run setup:complete
```

Este script irá:
- ✅ Atualizar o schema do banco de dados
- ✅ Gerar o Prisma Client
- ✅ Criar usuários administrativos
- ✅ Popular o banco com dados iniciais

### 5. Iniciar o Servidor
```bash
npm run dev
```

## 🔐 Credenciais de Acesso

Após o setup completo, você poderá acessar o sistema com:

### Superadmin
- **Email**: `superadmin@zanai.com`
- **Senha**: qualquer senha não vazia
- **Painel**: http://localhost:3000/admin
- **Função**: SUPER_ADMIN (acesso total ao sistema)

### Admin
- **Email**: `admin@zanai.com`
- **Senha**: qualquer senha não vazia
- **Painel**: http://localhost:3000/admin
- **Função**: admin (acesso administrativo)

## 🚨 Solução de Problemas Comuns

### Problema: "Não foi possível conectar com superadmin@zanai.com"

**Causa**: O usuário superadmin não existe no banco de dados.

**Solução**:
```bash
# Criar apenas o usuário superadmin
npm run db:create-superadmin
```

### Problema: "Banco de dados não encontrado"

**Causa**: O schema do banco não foi atualizado.

**Solução**:
```bash
# Atualizar schema do banco
npm run db:push

# Gerar Prisma Client
npm run db:generate

# Criar superadmin
npm run db:create-superadmin
```

### Problema: "Erro de permissão ao acessar /admin"

**Causa**: O usuário não tem a role correta ou não está autenticado.

**Solução**:
1. Faça logout clearing os cookies
2. Faça login novamente com `superadmin@zanai.com`
3. Verifique se o cookie `userId` está sendo definido

### Problema: "Middleware bloqueando acesso"

**Causa**: Os cookies de autenticação não estão sendo definidos corretamente.

**Solução**:
1. Verifique o console do navegador por erros
2. Limpe os cookies do navegador
3. Tente fazer login novamente

## 📁 Estrutura de Arquivos Importantes

```
prisma/
├── schema.prisma          # Schema do banco de dados
├── seed.ts               # Seed completo com dados de exemplo
├── create-superadmin.ts   # Script para criar superadmin
└── setup-complete.js      # Script de setup completo

src/
├── lib/
│   ├── auth.ts           # Sistema de autenticação
│   ├── db.ts             # Cliente Prisma
│   └── config.ts         # Configurações da API
├── middleware.ts         # Middleware de rotas
└── app/
    ├── admin/
    │   ├── login/page.tsx           # Página de login admin
    │   └── api/auth/login/route.ts  # API de login
    └── api/health/route.ts          # Health check
```

## 🔧 Scripts Úteis

```bash
# Banco de Dados
npm run db:push          # Atualizar schema
npm run db:generate      # Gerar Prisma Client
npm run db:reset         # Resetar banco
npm run db:seed          # Popular com dados
npm run db:create-superadmin  # Criar usuário superadmin

# Setup
npm run setup:complete   # Setup completo do zero
npm run setup           # Setup básico

# Desenvolvimento
npm run dev             # Servidor de desenvolvimento
npm run build           # Build para produção
npm run start           # Servidor de produção
npm run lint            # Verificar código
```

## 🌐 Acessos Úteis

- **Aplicação**: http://localhost:3000
- **Painel Admin**: http://localhost:3000/admin
- **Health Check**: http://localhost:3000/api/health
- **API Docs**: http://localhost:3000/doc

## 📞 Suporte

Se encontrar problemas durante a instalação:

1. Verifique os logs do console
2. Execute `npm run lint` para verificar erros de código
3. Limpe o banco e execute o setup novamente:
   ```bash
   npm run db:reset
   npm run setup:complete
   ```

---

**Importante**: Em ambiente de produção, sempre use senhas fortes e variáveis de ambiente seguras!