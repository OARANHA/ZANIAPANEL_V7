import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // Criar usuário superadmin
  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@zanai.com' },
    update: {},
    create: {
      email: 'superadmin@zanai.com',
      name: 'Super Administrador',
      role: 'SUPER_ADMIN',
    },
  });

  // Criar usuário admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@zanai.com' },
    update: {},
    create: {
      email: 'admin@zanai.com',
      name: 'Administrador Zanai',
      role: 'admin',
    },
  });

  // Criar workspace de teste
  const workspace = await prisma.workspace.upsert({
    where: { id: 'default-workspace' },
    update: {},
    create: {
      id: 'default-workspace',
      name: 'Workspace Padrão',
      description: 'Workspace principal para demonstração',
      config: JSON.stringify({
        theme: 'default',
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo'
      }),
      userId: superadmin.id,
    },
  });

  // Nota: Agentes serão criados apenas através do fluxo Flowise→Learning→Studio→Agents
  // Não criamos agentes pré-definidos no seed

  console.log('Seed concluído com sucesso!');
  console.log(`Superadmin: ${superadmin.email}`);
  console.log(`Admin: ${admin.email}`);
  console.log(`Workspace: ${workspace.name}`);
  console.log('Agentes: Apenas através do fluxo Flowise→Learning→Studio→Agents');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });