import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('🚀 Criando usuário Superadmin...');

    // Verificar se o superadmin já existe
    const existingSuperAdmin = await prisma.user.findUnique({
      where: { email: 'superadmin@zanai.com' }
    });

    if (existingSuperAdmin) {
      console.log('✅ Superadmin já existe:', existingSuperAdmin.email);
      return existingSuperAdmin;
    }

    // Criar o superadmin
    const superadmin = await prisma.user.create({
      data: {
        email: 'superadmin@zanai.com',
        name: 'Super Administrador',
        role: 'SUPER_ADMIN',
      }
    });

    console.log('✅ Superadmin criado com sucesso:', superadmin.email);
    console.log('📧 Email:', superadmin.email);
    console.log('👤 Nome:', superadmin.name);
    console.log('🔑 Role:', superadmin.role);
    console.log('🆔 ID:', superadmin.id);

    return superadmin;
  } catch (error) {
    console.error('❌ Erro ao criar superadmin:', error);
    throw error;
  }
}

async function createAdmin() {
  try {
    console.log('🚀 Criando usuário Admin...');

    // Verificar se o admin já existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@zanai.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin já existe:', existingAdmin.email);
      return existingAdmin;
    }

    // Criar o admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin@zanai.com',
        name: 'Administrador Zanai',
        role: 'admin',
      }
    });

    console.log('✅ Admin criado com sucesso:', admin.email);
    console.log('📧 Email:', admin.email);
    console.log('👤 Nome:', admin.name);
    console.log('🔑 Role:', admin.role);
    console.log('🆔 ID:', admin.id);

    return admin;
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🌱 Iniciando criação de usuários administrativos...');
    
    const superadmin = await createSuperAdmin();
    const admin = await createAdmin();

    console.log('\n🎉 Usuários criados com sucesso!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 CREDENCIAIS PARA LOGIN:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Superadmin:', superadmin.email);
    console.log('🔑 Senha: qualquer senha não vazia');
    console.log('🎯 Função: SUPER_ADMIN');
    console.log('');
    console.log('📧 Admin:', admin.email);
    console.log('🔑 Senha: qualquer senha não vazia');
    console.log('🎯 Função: admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Falha na criação de usuários:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();