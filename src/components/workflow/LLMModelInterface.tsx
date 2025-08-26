'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Brain, 
  Zap, 
  DollarSign, 
  Settings, 
  TrendingUp, 
  Lightbulb,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Filter,
  Star,
  Clock,
  Globe,
  Target,
  BarChart3,
  Cpu,
  MemoryStick,
  Eye,
  Code,
  MessageSquare
} from 'lucide-react';
import { LLMModel, LLMRecommendation } from '@/lib/llm-model-service';

interface LLMModelInterfaceProps {
  onModelSelected?: (model: LLMModel, configuration: Record<string, any>) => void;
  initialModelId?: string;
  initialConfiguration?: Record<string, any>;
}

export default function LLMModelInterface({
  onModelSelected,
  initialModelId,
  initialConfiguration
}: LLMModelInterfaceProps) {
  
  const [models, setModels] = useState<LLMModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<LLMModel | null>(null);
  const [configuration, setConfiguration] = useState<Record<string, any>>({});
  const [recommendations, setRecommendations] = useState<LLMRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    provider: '',
    category: '',
    maxPrice: ''
  });
  const [context, setContext] = useState({
    useCase: 'general',
    budget: 'medium' as 'low' | 'medium' | 'high',
    performance: 'balanced' as 'speed' | 'quality' | 'balanced',
    requiredCapabilities: [] as string[],
    expectedLoad: 'medium' as 'low' | 'medium' | 'high'
  });
  const [validation, setValidation] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);
  const [costEstimate, setCostEstimate] = useState<any>(null);

  useEffect(() => {
    loadModels();
    if (initialModelId) {
      loadModel(initialModelId);
    }
  }, []);

  useEffect(() => {
    if (selectedModel) {
      generateRecommendations();
      if (initialConfiguration) {
        setConfiguration(initialConfiguration);
      } else {
        generateOptimalConfiguration();
      }
    }
  }, [selectedModel]);

  useEffect(() => {
    if (selectedModel && Object.keys(configuration).length > 0) {
      validateConfiguration();
      estimateCost();
    }
  }, [configuration, selectedModel]);

  const loadModels = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.provider) params.append('provider', filters.provider);
      if (filters.category) params.append('category', filters.category);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

      const response = await fetch(`/admin/api/llm-models?action=list&${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setModels(data.models);
          if (data.models.length > 0 && !selectedModel) {
            setSelectedModel(data.models[0]);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar modelos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadModel = async (modelId: string) => {
    try {
      const response = await fetch(`/admin/api/llm-models?action=get&modelId=${modelId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSelectedModel(data.model);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar modelo:', error);
    }
  };

  const generateRecommendations = async () => {
    if (!selectedModel) return;

    try {
      const params = new URLSearchParams({
        useCase: context.useCase,
        budget: context.budget,
        performance: context.performance,
        expectedLoad: context.expectedLoad,
        requiredCapabilities: context.requiredCapabilities.join(',')
      });

      const response = await fetch(`/admin/api/llm-models?action=recommend&${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRecommendations(data.recommendations);
        }
      }
    } catch (error) {
      console.error('Erro ao gerar recomendações:', error);
    }
  };

  const generateOptimalConfiguration = async () => {
    if (!selectedModel) return;

    try {
      const response = await fetch('/admin/api/llm-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-config',
          data: {
            modelId: selectedModel.id,
            context
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setConfiguration(data.configuration);
        }
      }
    } catch (error) {
      console.error('Erro ao gerar configuração:', error);
    }
  };

  const validateConfiguration = async () => {
    if (!selectedModel) return;

    try {
      const response = await fetch('/admin/api/llm-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate',
          data: {
            modelId: selectedModel.id,
            configuration
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setValidation(data.validation);
        }
      }
    } catch (error) {
      console.error('Erro ao validar configuração:', error);
    }
  };

  const estimateCost = async () => {
    if (!selectedModel) return;

    try {
      const response = await fetch('/admin/api/llm-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'estimate-cost',
          data: {
            modelId: selectedModel.id,
            configuration,
            usage: {
              requestsPerDay: 1000,
              averageInputTokens: 1000,
              averageOutputTokens: 500,
              days: 30
            }
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCostEstimate(data.costEstimate);
        }
      }
    } catch (error) {
      console.error('Erro ao estimar custo:', error);
    }
  };

  const handleConfigurationChange = (paramName: string, value: any) => {
    setConfiguration(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleModelSelect = (model: LLMModel) => {
    setSelectedModel(model);
    setConfiguration({});
    setValidation(null);
    setCostEstimate(null);
  };

  const handleApplyModel = () => {
    if (selectedModel && onModelSelected) {
      onModelSelected(selectedModel, configuration);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return <Brain className="h-4 w-4" />;
      case 'anthropic': return <MessageSquare className="h-4 w-4" />;
      case 'google': return <Target className="h-4 w-4" />;
      case 'meta': return <Cpu className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'very-high': return 'text-green-600';
      case 'high': return 'text-blue-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'very-fast': return 'text-green-600';
      case 'fast': return 'text-blue-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-red-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Configuração de Modelos LLM</span>
          </CardTitle>
          <CardDescription>
            Selecione e configure modelos de linguagem para seus workflows
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="models" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="models" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Modelos</span>
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configuração</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Análise</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Provider</label>
                  <Select value={filters.provider} onValueChange={(value) => setFilters(prev => ({ ...prev, provider: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="meta">Meta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chat">Chat</SelectItem>
                      <SelectItem value="completion">Completion</SelectItem>
                      <SelectItem value="embedding">Embedding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Preço Máx (por 1K tokens)</label>
                  <Input
                    type="number"
                    placeholder="0.01"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={loadModels} disabled={isLoading}>
                  {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Filter className="h-4 w-4 mr-2" />}
                  Aplicar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Modelos */}
          <Card>
            <CardHeader>
              <CardTitle>Modelos Disponíveis</CardTitle>
              <CardDescription>
                Selecione um modelo para configurar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {models.map((model) => (
                  <Card 
                    key={model.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedModel?.id === model.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleModelSelect(model)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getProviderIcon(model.provider)}
                          <div>
                            <CardTitle className="text-base">{model.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {model.provider} • {model.category}
                            </CardDescription>
                          </div>
                        </div>
                        {selectedModel?.id === model.id && (
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Preço */}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Preço:</span>
                          <span className="font-medium">
                            ${model.pricing.input.toFixed(4)} / ${model.pricing.output.toFixed(4)} per 1K
                          </span>
                        </div>
                        
                        {/* Performance */}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Qualidade:</span>
                          <span className={`font-medium ${getQualityColor(model.performance.quality)}`}>
                            {model.performance.quality}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Velocidade:</span>
                          <span className={`font-medium ${getSpeedColor(model.performance.speed)}`}>
                            {model.performance.speed}
                          </span>
                        </div>
                        
                        {/* Capacidades */}
                        <div className="flex flex-wrap gap-1">
                          {model.capabilities.slice(0, 3).map((capability) => (
                            <Badge key={capability} variant="outline" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                          {model.capabilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{model.capabilities.length - 3}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Features */}
                        <div className="flex flex-wrap gap-1">
                          {model.features.streaming && (
                            <Badge variant="secondary" className="text-xs">
                              Streaming
                            </Badge>
                          )}
                          {model.features.functionCalling && (
                            <Badge variant="secondary" className="text-xs">
                              Functions
                            </Badge>
                          )}
                          {model.features.vision && (
                            <Badge variant="secondary" className="text-xs">
                              Vision
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          {selectedModel ? (
            <>
              {/* Informações do Modelo Selecionado */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getProviderIcon(selectedModel.provider)}
                    <span>{selectedModel.name}</span>
                  </CardTitle>
                  <CardDescription>
                    {selectedModel.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">${selectedModel.pricing.input.toFixed(4)}</div>
                      <div className="text-xs text-muted-foreground">Input por 1K tokens</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">${selectedModel.pricing.output.toFixed(4)}</div>
                      <div className="text-xs text-muted-foreground">Output por 1K tokens</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedModel.performance.contextLength.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Context Length</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold capitalize">{selectedModel.performance.quality}</div>
                      <div className="text-xs text-muted-foreground">Qualidade</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parâmetros de Configuração */}
              <Card>
                <CardHeader>
                  <CardTitle>Parâmetros de Configuração</CardTitle>
                  <CardDescription>
                    Ajuste os parâmetros do modelo conforme sua necessidade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedModel.parameters.map((param) => (
                      <div key={param.name} className="space-y-2">
                        <label className="text-sm font-medium">
                          {param.label}
                          {param.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {param.description}
                        </p>
                        
                        {param.type === 'select' && (
                          <Select
                            value={configuration[param.name] || param.defaultValue || ''}
                            onValueChange={(value) => handleConfigurationChange(param.name, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Selecione ${param.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {param.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        
                        {param.type === 'string' && (
                          <Textarea
                            value={configuration[param.name] || param.defaultValue || ''}
                            onChange={(e) => handleConfigurationChange(param.name, e.target.value)}
                            placeholder={`Digite ${param.label}`}
                          />
                        )}
                        
                        {param.type === 'number' && (
                          <Input
                            type="number"
                            value={configuration[param.name] || param.defaultValue || ''}
                            onChange={(e) => handleConfigurationChange(param.name, parseFloat(e.target.value))}
                            placeholder={`Digite ${param.label}`}
                            min={param.min}
                            max={param.max}
                            step={param.step}
                          />
                        )}
                        
                        {param.type === 'boolean' && (
                          <Select
                            value={String(configuration[param.name] ?? param.defaultValue ?? false)}
                            onValueChange={(value) => handleConfigurationChange(param.name, value === 'true')}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Sim</SelectItem>
                              <SelectItem value="false">Não</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Validação e Ações */}
              {validation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {validation.valid ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span>Validação da Configuração</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {validation.errors.length > 0 && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Erros encontrados:</AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc list-inside">
                            {validation.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {validation.warnings.length > 0 && (
                      <Alert className="mb-4">
                        <AlertTitle>Avisos:</AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc list-inside">
                            {validation.warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {validation.errors.length === 0 && validation.warnings.length === 0 && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Configuração válida!</AlertTitle>
                        <AlertDescription>
                          Todos os parâmetros estão configurados corretamente.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={handleApplyModel}
                  disabled={!validation?.valid}
                  className="px-8"
                >
                  Aplicar Modelo
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Selecione um modelo</h3>
                  <p className="text-muted-foreground">
                    Escolha um modelo na aba "Modelos" para configurá-lo
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {selectedModel ? (
            <>
              {/* Recomendações */}
              {recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5" />
                      <span>Recomendações</span>
                    </CardTitle>
                    <CardDescription>
                      Modelos recomendados baseados no seu contexto de uso
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recommendations.map((rec, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start justify-between space-x-2">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium">{rec.modelId}</h4>
                                <Badge variant="outline">
                                  {Math.round(rec.confidence * 100)}% compatível
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {rec.reason}
                              </p>
                              
                              {Object.keys(rec.expectedImprovement).length > 0 && (
                                <div className="bg-blue-50 p-3 rounded text-sm">
                                  <div className="font-medium text-blue-800 mb-1">Melhoria Esperada:</div>
                                  <div className="text-blue-700 space-y-1">
                                    {rec.expectedImprovement.cost && (
                                      <div>💰 Custo: {rec.expectedImprovement.cost}% mais barato</div>
                                    )}
                                    {rec.expectedImprovement.performance && (
                                      <div>⚡ Performance: {rec.expectedImprovement.performance}% mais rápido</div>
                                    )}
                                    {rec.expectedImprovement.quality && (
                                      <div>🎯 Qualidade: {rec.expectedImprovement.quality}% melhor</div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const model = models.find(m => m.id === rec.modelId);
                                if (model) {
                                  handleModelSelect(model);
                                  setConfiguration(rec.configuration);
                                }
                              }}
                            >
                              Usar este
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Estimativa de Custo */}
              {costEstimate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span>Estimativa de Custo</span>
                    </CardTitle>
                    <CardDescription>
                      Custo estimado para 1000 requisições por dia durante 30 dias
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">${costEstimate.totalCost.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">Custo Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">${costEstimate.breakdown.inputCost.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">Custo Input</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">${costEstimate.breakdown.outputCost.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">Custo Output</div>
                      </div>
                    </div>
                    
                    {costEstimate.optimization.potentialSavings > 0 && (
                      <Alert className="mt-4">
                        <AlertTitle>Oportunidade de Economia</AlertTitle>
                        <AlertDescription>
                          <div className="space-y-2">
                            <div>
                              <strong>Potencial de economia:</strong> ${costEstimate.optimization.potentialSavings.toFixed(2)}
                            </div>
                            <div>
                              <strong>Sugestões:</strong>
                              <ul className="list-disc list-inside ml-4">
                                {costEstimate.optimization.suggestions.map((suggestion: string, index: number) => (
                                  <li key={index}>{suggestion}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Contexto */}
              <Card>
                <CardHeader>
                  <CardTitle>Contexto de Uso</CardTitle>
                  <CardDescription>
                    Configure o contexto para obter recomendações mais precisas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Caso de Uso</label>
                      <Select value={context.useCase} onValueChange={(value) => setContext(prev => ({ ...prev, useCase: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">Uso Geral</SelectItem>
                          <SelectItem value="chat">Chatbot</SelectItem>
                          <SelectItem value="code">Geração de Código</SelectItem>
                          <SelectItem value="analysis">Análise de Texto</SelectItem>
                          <SelectItem value="translation">Tradução</SelectItem>
                          <SelectItem value="creative">Criação de Conteúdo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Orçamento</label>
                      <Select value={context.budget} onValueChange={(value) => setContext(prev => ({ ...prev, budget: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixo</SelectItem>
                          <SelectItem value="medium">Médio</SelectItem>
                          <SelectItem value="high">Alto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Performance</label>
                      <Select value={context.performance} onValueChange={(value) => setContext(prev => ({ ...prev, performance: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="speed">Velocidade</SelectItem>
                          <SelectItem value="quality">Qualidade</SelectItem>
                          <SelectItem value="balanced">Equilibrado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Carga Esperada</label>
                      <Select value={context.expectedLoad} onValueChange={(value) => setContext(prev => ({ ...prev, expectedLoad: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="text-sm font-medium">Capacidades Requeridas</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {['reasoning', 'coding', 'multilingual', 'function-calling', 'vision', 'streaming', 'json-mode'].map((capability) => (
                        <label key={capability} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={context.requiredCapabilities.includes(capability)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setContext(prev => ({
                                  ...prev,
                                  requiredCapabilities: [...prev.requiredCapabilities, capability]
                                }));
                              } else {
                                setContext(prev => ({
                                  ...prev,
                                  requiredCapabilities: prev.requiredCapabilities.filter(c => c !== capability)
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{capability.replace('-', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button onClick={generateRecommendations}>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Gerar Recomendações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Selecione um modelo</h3>
                  <p className="text-muted-foreground">
                    Escolha um modelo para ver análises e recomendações
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}