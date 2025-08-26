import { NextRequest, NextResponse } from 'next/server';
import { llmModelService } from '@/lib/llm-model-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'list') {
      const provider = searchParams.get('provider') || undefined;
      const category = searchParams.get('category') || undefined;
      const capabilities = searchParams.get('capabilities')?.split(',') || undefined;
      const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;

      console.log('📋 Listando modelos LLM:', {
        provider,
        category,
        capabilities,
        maxPrice
      });

      const models = llmModelService.listModels({
        provider,
        category,
        capabilities,
        maxPrice
      });

      return NextResponse.json({
        success: true,
        models,
        count: models.length,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'get') {
      const modelId = searchParams.get('modelId');

      if (!modelId) {
        return NextResponse.json(
          { error: 'Model ID is required' },
          { status: 400 }
        );
      }

      console.log('🔍 Buscando modelo LLM:', modelId);

      const model = llmModelService.getModel(modelId);

      if (!model) {
        return NextResponse.json(
          { error: 'Model not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        model,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'recommend') {
      const useCase = searchParams.get('useCase') || 'general';
      const budget = searchParams.get('budget') as 'low' | 'medium' | 'high' || 'medium';
      const performance = searchParams.get('performance') as 'speed' | 'quality' | 'balanced' || 'balanced';
      const requiredCapabilities = searchParams.get('requiredCapabilities')?.split(',') || [];
      const expectedLoad = searchParams.get('expectedLoad') as 'low' | 'medium' | 'high' || 'medium';
      const region = searchParams.get('region') || undefined;

      console.log('💡 Gerando recomendações de modelos:', {
        useCase,
        budget,
        performance,
        requiredCapabilities,
        expectedLoad,
        region
      });

      const recommendations = llmModelService.recommendModels({
        useCase,
        budget,
        performance,
        requiredCapabilities,
        expectedLoad,
        region
      });

      return NextResponse.json({
        success: true,
        recommendations,
        count: recommendations.length,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Action not supported' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Erro na API de modelos LLM:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (action === 'validate') {
      const { modelId, configuration } = data;

      if (!modelId || !configuration) {
        return NextResponse.json(
          { error: 'Model ID and configuration are required' },
          { status: 400 }
        );
      }

      console.log('✅ Validando configuração do modelo:', {
        modelId,
        configurationKeys: Object.keys(configuration)
      });

      const validation = llmModelService.validateConfiguration(modelId, configuration);

      return NextResponse.json({
        success: true,
        validation,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'estimate-cost') {
      const { modelId, configuration, usage } = data;

      if (!modelId || !configuration || !usage) {
        return NextResponse.json(
          { error: 'Model ID, configuration, and usage are required' },
          { status: 400 }
        );
      }

      console.log('💰 Estimando custo do modelo:', {
        modelId,
        usage
      });

      const costEstimate = llmModelService.estimateCost(modelId, configuration, usage);

      return NextResponse.json({
        success: true,
        costEstimate,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'generate-config') {
      const { modelId, context } = data;

      if (!modelId || !context) {
        return NextResponse.json(
          { error: 'Model ID and context are required' },
          { status: 400 }
        );
      }

      console.log('⚙️ Gerando configuração otimizada:', {
        modelId,
        context
      });

      const model = llmModelService.getModel(modelId);
      if (!model) {
        return NextResponse.json(
          { error: 'Model not found' },
          { status: 404 }
        );
      }

      const configuration = llmModelService.generateOptimalConfiguration(model, context);

      return NextResponse.json({
        success: true,
        configuration,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Action not supported' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Erro na API de modelos LLM:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}