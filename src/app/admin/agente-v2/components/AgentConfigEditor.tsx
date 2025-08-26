'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, Save, RotateCcw, Upload, Eye, 
  Plus, X, Building2, Target, Brain, FileText,
  Sparkles, Users, TrendingUp
} from 'lucide-react';

interface AgentConfigEditorProps {
  agent: any;
  onSave: (config: any) => void;
  onReExport: () => void;
  isSaving?: boolean;
  isExporting?: boolean;
}

export default function AgentConfigEditor({ 
  agent, 
  onSave, 
  onReExport, 
  isSaving = false, 
  isExporting = false 
}: AgentConfigEditorProps) {
  const [config, setConfig] = useState({
    name: agent.customConfig?.name || agent.name,
    description: agent.customConfig?.description || agent.description,
    category: agent.customConfig?.category || agent.studioMetadata?.category || 'general',
    tags: agent.customConfig?.tags || agent.studioMetadata?.tags || [],
    systemPrompt: agent.customConfig?.systemPrompt || '',
    welcomeMessage: agent.customConfig?.welcomeMessage || '',
    temperature: agent.customConfig?.temperature || 0.7,
    maxTokens: agent.customConfig?.maxTokens || 2000,
    model: agent.customConfig?.model || 'glm-4.5-flash',
    customInstructions: agent.customConfig?.customInstructions || '',
    businessContext: agent.customConfig?.businessContext || '',
    clientSpecificData: agent.customConfig?.clientSpecificData || {}
  });

  const [newTag, setNewTag] = useState('');
  const [customDataKey, setCustomDataKey] = useState('');
  const [customDataValue, setCustomDataValue] = useState('');

  const handleSave = () => {
    onSave({
      ...agent.customConfig,
      ...config
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !config.tags.includes(newTag.trim())) {
      setConfig(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setConfig(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddCustomData = () => {
    if (customDataKey.trim() && customDataValue.trim()) {
      setConfig(prev => ({
        ...prev,
        clientSpecificData: {
          ...prev.clientSpecificData,
          [customDataKey.trim()]: customDataValue.trim()
        }
      }));
      setCustomDataKey('');
      setCustomDataValue('');
    }
  };

  const handleRemoveCustomData = (keyToRemove: string) => {
    const newData = { ...config.clientSpecificData };
    delete newData[keyToRemove];
    setConfig(prev => ({
      ...prev,
      clientSpecificData: newData
    }));
  };

  const hasChanges = () => {
    return JSON.stringify(config) !== JSON.stringify({
      name: agent.customConfig?.name || agent.name,
      description: agent.customConfig?.description || agent.description,
      category: agent.customConfig?.category || agent.studioMetadata?.category || 'general',
      tags: agent.customConfig?.tags || agent.studioMetadata?.tags || [],
      systemPrompt: agent.customConfig?.systemPrompt || '',
      welcomeMessage: agent.customConfig?.welcomeMessage || '',
      temperature: agent.customConfig?.temperature || 0.7,
      maxTokens: agent.customConfig?.maxTokens || 2000,
      model: agent.customConfig?.model || 'glm-4.5-flash',
      customInstructions: agent.customConfig?.customInstructions || '',
      businessContext: agent.customConfig?.businessContext || '',
      clientSpecificData: agent.customConfig?.clientSpecificData || {}
    });
  };

  const isCustomized = agent.versionInfo?.isCustomized || hasChanges();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações Personalizadas
              {isCustomized && (
                <Badge variant="default" className="bg-purple-600">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Personalizado
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Modifique as configurações do workflow após a exportação do Flowise
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleSave}
              disabled={isSaving || !hasChanges()}
              size="sm"
            >
              <Save className="w-4 h-4 mr-1" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button 
              onClick={onReExport}
              disabled={isExporting || !isCustomized}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Upload className="w-4 h-4 mr-1" />
              {isExporting ? 'Exportando...' : 'Re-exportar para Flowise'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Básico
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-1">
              <Brain className="w-4 h-4" />
              Avançado
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              Negócio
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Personalizado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Agente</Label>
                <Input
                  id="name"
                  value={config.name}
                  onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do agente personalizado"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={config.category} onValueChange={(value) => setConfig(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Geral</SelectItem>
                    <SelectItem value="customer-service">Atendimento ao Cliente</SelectItem>
                    <SelectItem value="sales">Vendas</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="support">Suporte Técnico</SelectItem>
                    <SelectItem value="hr">Recursos Humanos</SelectItem>
                    <SelectItem value="finance">Financeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição personalizada do agente"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {config.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-500" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Adicionar tag"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button onClick={handleAddTag} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Modelo de IA</Label>
                <Select value={config.model} onValueChange={(value) => setConfig(prev => ({ ...prev, model: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="glm-4.5-flash">GLM-4.5-Flash</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5-Turbo</SelectItem>
                    <SelectItem value="claude-3">Claude-3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Temperatura ({config.temperature})</Label>
                <Input
                  id="temperature"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxTokens">Tokens Máximos</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={config.maxTokens}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemPrompt">System Prompt</Label>
              <Textarea
                id="systemPrompt"
                value={config.systemPrompt}
                onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                placeholder="Instruções de sistema para o agente"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">Mensagem de Boas-Vindas</Label>
              <Textarea
                id="welcomeMessage"
                value={config.welcomeMessage}
                onChange={(e) => setConfig(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                placeholder="Mensagem inicial para os usuários"
                rows={2}
              />
            </div>
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessContext">Contexto de Negócio</Label>
              <Textarea
                id="businessContext"
                value={config.businessContext}
                onChange={(e) => setConfig(prev => ({ ...prev, businessContext: e.target.value }))}
                placeholder="Descreva o contexto de negócio do cliente"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customInstructions">Instruções Personalizadas</Label>
              <Textarea
                id="customInstructions"
                value={config.customInstructions}
                onChange={(e) => setConfig(prev => ({ ...prev, customInstructions: e.target.value }))}
                placeholder="Instruções específicas para este cliente/agente"
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-2">
              <Label>Dados Específicos do Cliente</Label>
              <div className="space-y-2">
                {Object.entries(config.clientSpecificData).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="font-medium flex-1">{key}:</span>
                    <span className="flex-1 text-sm text-muted-foreground">{String(value)}</span>
                    <X 
                      className="w-4 h-4 cursor-pointer hover:text-red-500" 
                      onClick={() => handleRemoveCustomData(key)}
                    />
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input
                  value={customDataKey}
                  onChange={(e) => setCustomDataKey(e.target.value)}
                  placeholder="Chave"
                />
                <Input
                  value={customDataValue}
                  onChange={(e) => setCustomDataValue(e.target.value)}
                  placeholder="Valor"
                />
              </div>
              <Button onClick={handleAddCustomData} size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Dado Personalizado
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {agent.reExportStatus && (
          <div className="mt-4 p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Status da Re-exportação</span>
              <Badge variant={
                agent.reExportStatus.status === 'success' ? 'default' :
                agent.reExportStatus.status === 'error' ? 'destructive' :
                agent.reExportStatus.status === 'exporting' ? 'default' : 'secondary'
              }>
                {agent.reExportStatus.status === 'success' && '✅ Sucesso'}
                {agent.reExportStatus.status === 'error' && '❌ Erro'}
                {agent.reExportStatus.status === 'exporting' && '🔄 Exportando'}
                {agent.reExportStatus.status === 'pending' && '⏳ Pendente'}
              </Badge>
            </div>
            
            {agent.reExportStatus.newFlowiseId && (
              <p className="text-sm text-muted-foreground">
                <strong>Novo ID Flowise:</strong> {agent.reExportStatus.newFlowiseId}
              </p>
            )}
            
            {agent.reExportStatus.exportedAt && (
              <p className="text-sm text-muted-foreground">
                <strong>Exportado em:</strong> {new Date(agent.reExportStatus.exportedAt).toLocaleString('pt-BR')}
              </p>
            )}
            
            {agent.reExportStatus.error && (
              <p className="text-sm text-red-600">
                <strong>Erro:</strong> {agent.reExportStatus.error}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}