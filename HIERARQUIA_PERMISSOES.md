# 🏆 Hierarquia de Permissões do Sistema Zanai

## 📋 Níveis de Acesso

### 👑 **Nível 1: SUPER_ADMIN** (superadmin@zanai.com)
- **Descrição**: Acesso total e irrestrito ao sistema
- **Permissões**:
  - ✅ Acesso completo ao painel administrativo (`/admin`)
  - ✅ Gerenciamento de todos os usuários do sistema
  - ✅ Criação e exclusão de administradores
  - ✅ Configuração global do sistema
  - ✅ Acesso a todas as APIs administrativas
  - ✅ Visualização de todos os dados e relatórios
  - ✅ Gerenciamento de empresas e clientes
  - ✅ Controle total sobre agentes e workspaces
  - ✅ Acesso ao Flowise e integrações

### 🥇 **Nível 2: admin** (admin@zanai.com)
- **Descrição**: Administrador do sistema com acesso quase total
- **Permissões**:
  - ✅ Acesso completo ao painel administrativo (`/admin`)
  - ✅ Gerenciamento de usuários comuns
  - ✅ Acesso a APIs administrativas
  - ✅ Visualização de relatórios e dados
  - ✅ Gerenciamento de empresas e clientes
  - ✅ Controle sobre agentes e workspaces
  - ❌ **Não pode gerenciar outros administradores**
  - ❌ **Não pode acessar configurações globais críticas**

### 🥈 **Nível 3: COMPANY_ADMIN** (company.admin@empresa.com)
- **Descrição**: Administrador de nível empresarial
- **Permissões**:
  - ✅ Acesso ao painel empresarial (`/enterprise`)
  - ✅ Gerenciamento de usuários da sua empresa
  - ✅ Visualização de relatórios da empresa
  - ✅ Gestão de projetos e clientes da empresa
  - ❌ **Não acessa o painel administrativo principal**
  - ❌ **Não gerencia usuários de outras empresas**

### 🥉 **Nível 4: company_admin** (maria.santos@techcorp.com)
- **Descrição**: Administrador de empresa (variante alternativa)
- **Permissões**: Mesmo que COMPANY_ADMIN

### 🎖️ **Nível 5: PROFISSIONAL** (profissional.user@zanai.com)
- **Descrição**: Usuário com acesso profissional
- **Permissões**:
  - ✅ Acesso ao painel de usuário (`/painel`)
  - ✅ Criação e gestão de agentes
  - ✅ Acesso a workspaces pessoais
  - ✅ Uso de funcionalidades avançadas
  - ❌ **Não acessa painéis administrativos**

### 🎖️ **Nível 6: INICIANTE** (iniciante.user@zanai.com)
- **Descrição**: Usuário com acesso básico
- **Permissões**:
  - ✅ Acesso ao painel de usuário (`/painel`)
  - ✅ Criação limitada de agentes
  - ✅ Acesso a workspaces básicos
  - ❌ **Não acessa funcionalidades avançadas**

### 🎖️ **Nível 7: user** (joao.silva@empresa.com)
- **Descrição**: Usuário padrão do sistema
- **Permissões**:
  - ✅ Acesso básico ao painel de usuário
  - ✅ Uso de agentes existentes
  - ❌ **Não pode criar novos agentes**

### 🎖️ **Nível 8: FREE** (free.user@zanai.com)
- **Descrição**: Usuário gratuito com limitações
- **Permissões**:
  - ✅ Acesso limitado ao painel de usuário
  - ✅ Uso básico do sistema
  - ❌ **Funcionalidades limitadas**

### 🎖️ **Nível 9: COMPANY_USER** (company.user@empresa.com)
- **Descrição**: Usuário vinculado a uma empresa
- **Permissões**:
  - ✅ Acesso ao painel empresarial (`/enterprise`)
  - ✅ Participação em projetos da empresa
  - ❌ **Não acessa painel administrativo principal**

## 🌐 Rotas de Acesso por Nível

### `/admin` - Painel Administrativo
- **Acesso**: SUPER_ADMIN, admin
- **Descrição**: Controle total do sistema

### `/enterprise` - Painel Empresarial  
- **Acesso**: COMPANY_ADMIN, company_admin, COMPANY_USER
- **Descrição**: Gestão empresarial

### `/painel` - Painel de Usuário
- **Acesso**: FREE, INICIANTE, PROFISSIONAL
- **Descrição**: Área pessoal do usuário

## 🔑 Credenciais de Teste

```bash
# Superadmin (Nível Máximo)
Email: superadmin@zanai.com
Senha: qualquer senha não vazia
Acesso: http://localhost:3000/admin

# Admin (Nível Alto)
Email: admin@zanai.com  
Senha: qualquer senha não vazia
Acesso: http://localhost:3000/admin

# Admin de Empresa
Email: company.admin@empresa.com
Senha: qualquer senha não vazia
Acesso: http://localhost:3000/enterprise

# Usuário Profissional
Email: profissional.user@zanai.com
Senha: qualquer senha não vazia
Acesso: http://localhost:3000/painel
```

## 🛡️ Segurança e Controle de Acesso

- **Middleware**: Verificação automática de permissões por rota
- **JWT Tokens**: Autenticação segura com tokens assinados
- **Cookies**: Sessões seguras com HttpOnly e SameSite
- **Audit Logs**: Registro de todas as ações administrativas
- **Role-based Access**: Controle granular por nível de acesso

## 📊 Resumo da Hierarquia

```
👑👑👑👑 SUPER_ADMIN    - Controle total do sistema
👑👑👑 admin           - Administração do sistema  
👑👑 COMPANY_ADMIN    - Administração empresarial
👑 company_admin     - Administração empresarial (alt)
👑 PROFISSIONAL      - Usuário profissional
👑 INICIANTE         - Usuário iniciante
👑 user              - Usuário padrão
👑 FREE              - Usuário gratuito
👑 COMPANY_USER      - Usuário de empresa
```

**Sim**, `superadmin@zanai.com` é efetivamente o **nível superior** ao `admin@zanai.com`, com acesso total e irrestrito a todo o sistema, enquanto o `admin@zanai.com` tem acesso quase total, mas com algumas limitações em relação ao gerenciamento de outros administradores e configurações globais críticas.