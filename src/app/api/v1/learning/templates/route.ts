import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validated = searchParams.get('validated');
    const category = searchParams.get('category');

    const where: any = {};
    if (validated === 'true') where.validated = true;
    if (validated === 'false') where.validated = false;
    if (category) where.category = category;

    const templates = await db.learnedTemplate.findMany({
      where,
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      templates: templates.map(template => ({
        id: template.id,
        name: template.name,
        category: template.category,
        complexity: template.complexity,
        validated: template.validated,
        usageCount: template.usageCount,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        sourceWorkflowId: template.sourceWorkflowId
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, complexity, patterns, zanaiConfig, sourceWorkflowId } = body;

    if (!name || !category || !complexity || !patterns || !zanaiConfig) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    const template = await db.learnedTemplate.create({
      data: {
        name,
        category,
        complexity,
        patterns: JSON.stringify(patterns),
        zanaiConfig: JSON.stringify(zanaiConfig),
        sourceWorkflowId,
        validated: false,
        usageCount: 0
      }
    });

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        category: template.category,
        complexity: template.complexity,
        validated: template.validated,
        usageCount: template.usageCount,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
      }
    });

  } catch (error) {
    console.error('Erro ao criar template:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}