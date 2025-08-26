// Sistema de autenticação baseado em cookies para compatibilidade
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export interface Session {
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
}

export async function auth(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get('isAuthenticated')?.value === 'true';
    const userId = cookieStore.get('userId')?.value;
    const userEmail = cookieStore.get('userEmail')?.value;
    const userName = cookieStore.get('userName')?.value;
    const userRole = cookieStore.get('userRole')?.value;

    console.log('🔍 Auth Debug:', {
      isAuthenticated,
      userId,
      userEmail,
      userName,
      userRole,
      hasCookieStore: !!cookieStore
    });

    // Se não tiver os cookies essenciais, não está autenticado
    if (!isAuthenticated || !userId || !userEmail || !userRole) {
      console.log('❌ Auth failed: missing required fields', {
        isAuthenticated: !!isAuthenticated,
        userId: !!userId,
        userEmail: !!userEmail,
        userRole: !!userRole
      });
      return null;
    }

    // Verificar se o usuário existe no banco de dados
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.log('❌ Auth failed: user not found in database');
      return null;
    }

    // Verificar se o email do cookie corresponde ao do banco
    if (user.email !== userEmail) {
      console.log('❌ Auth failed: email mismatch');
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  return await auth();
}

export async function getCurrentUser(): Promise<Session['user'] | null> {
  const session = await auth();
  return session?.user || null;
}