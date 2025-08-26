#!/usr/bin/env node

/**
 * Script de Setup Inicial do Zanai
 * Garante que todos os usuários necessários sejam criados
 * e que o banco de dados esteja pronto para uso
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando setup do Zanai AI Platform...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

try {
  // 1. Verificar se o .env existe
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ Arquivo .env não encontrado!');
    console.log('📝 Por favor, crie um arquivo .env com as variáveis de ambiente necessárias.');
    process.exit(1);
  }

  console.log('✅ Arquivo .env encontrado');

  // 2. Rodar push do banco de dados
  console.log('📊 Atualizando schema do banco de dados...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Schema do banco atualizado');

  // 3. Gerar Prisma client
  console.log('🔧 Gerando Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client gerado');

  // 4. Criar usuários administrativos
  console.log('👤 Criando usuários administrativos...');
  execSync('npm run db:create-superadmin', { stdio: 'inherit' });
  console.log('✅ Usuários administrativos criados');

  // 5. Rodar seed completo (opcional)
  console.log('🌱 Rodando seed completo...');
  try {
    execSync('npm run db:seed', { stdio: 'inherit' });
    console.log('✅ Seed completo executado');
  } catch (seedError) {
    console.log('⚠️  Seed completo falhou, mas usuários administrativos foram criados');
    console.log('   Isso é normal se o banco já tiver dados');
  }

  console.log('');
  console.log('🎉 SETUP CONCLUÍDO COM SUCESSO!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 CREDENCIAIS DE ACESSO:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Superadmin: superadmin@zanai.com');
  console.log('🔑 Senha: qualquer senha não vazia');
  console.log('🎯 Painel: http://localhost:3000/admin');
  console.log('');
  console.log('📧 Admin: admin@zanai.com');
  console.log('🔑 Senha: qualquer senha não vazia');
  console.log('🎯 Painel: http://localhost:3000/admin');
  console.log('');
  console.log('🌐 Aplicação: http://localhost:3000');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Execute "npm run dev" para iniciar o servidor de desenvolvimento');

} catch (error) {
  console.error('❌ Erro durante o setup:', error.message);
  process.exit(1);
}