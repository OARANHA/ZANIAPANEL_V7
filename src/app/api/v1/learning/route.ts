import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'stats') {
      // Retornar estatísticas gerais do sistema de aprendizado
      const [agentsCount, templatesCount, validatedTemplatesCount] = await Promise.all([
        db.agent.count({ where: { status: 'active' } }),
        db.learnedTemplate.count(),
        db.learnedTemplate.count({ where: { validated: true } })
      ]);

      return NextResponse.json({
        success: true,
        stats: {
          activeAgents: agentsCount,
          learnedTemplates: templatesCount,
          validatedTemplates: validatedTemplatesCount
        }
      });
    }

    if (type === 'recent') {
      // Retornar atividades recentes
      const recentTemplates = await db.learnedTemplate.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 10,
        include: {
          agent: true
        }
      });

      return NextResponse.json({
        success: true,
        activities: recentTemplates.map(template => ({
          id: template.id,
          type: 'template',
          title: `Template ${template.validated ? 'validado' : 'criado'}`,
          description: `${template.name} - ${template.category}`,
          timestamp: template.updatedAt,
          status: template.validated ? 'success' : 'pending'
        }))
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Sistema de aprendizado operacional',
      types: ['stats', 'recent', 'flowise', 'agents']
    });

  } catch (error) {
    console.error('Erro na API de aprendizado:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}