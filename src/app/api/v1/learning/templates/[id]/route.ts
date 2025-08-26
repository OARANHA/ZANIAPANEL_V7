import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const template = await db.learnedTemplate.findUnique({
      where: { id: params.id }
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        category: template.category,
        complexity: template.complexity,
        patterns: JSON.parse(template.patterns),
        zanaiConfig: JSON.parse(template.zanaiConfig),
        validated: template.validated,
        usageCount: template.usageCount,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        sourceWorkflowId: template.sourceWorkflowId
      }
    });

  } catch (error) {
    console.error('Erro ao buscar template:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { name, category, complexity, patterns, zanaiConfig, validated } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (complexity !== undefined) updateData.complexity = complexity;
    if (patterns !== undefined) updateData.patterns = JSON.stringify(patterns);
    if (zanaiConfig !== undefined) updateData.zanaiConfig = JSON.stringify(zanaiConfig);
    if (validated !== undefined) updateData.validated = validated;

    const template = await db.learnedTemplate.update({
      where: { id: params.id },
      data: updateData
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
    console.error('Erro ao atualizar template:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.learnedTemplate.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Template deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar template:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}