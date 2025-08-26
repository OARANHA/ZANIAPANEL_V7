'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Brain, Settings, Eye, Building2, 
  CheckCircle, AlertTriangle, Cloud, Target, Edit, Sparkles
} from 'lucide-react';
import AgentConfigEditor from './AgentConfigEditor';

// Interfaces
interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'template' | 'custom' | 'composed' | 'workflow';
  status?: 'active' | 'inactive' | 'training';
  studioMetadata?: {
    nodeCount?: number;
    edgeCount?: number;
    complexityScore?: number;
    workflowId?: string;
    category?: string;
    tags?: string[];
  };
  cliente?: { id: string; name: string; };
  disponivel?: boolean;
  inputTypes?: ('prompt' | 'prompt_system')[];
  flowiseConfig?: {
    exported: boolean;
    flowiseId?: string;
    exportedAt?: string;
    syncStatus?: 'pending' | 'synced' | 'error';
  };
  // Additional Flowise-specific fields
  chatflowUrl?: string;
  exportedToFlowise?: boolean;
  config?: string;
  originalFlowiseData?: any;
  
  // Campos editáveis pós-exportação
  customConfig?: {
    name?: string;
    description?: string;
    category?: string;
    tags?: string[];
    systemPrompt?: string;
    welcomeMessage?: string;
    temperature?: number;
    maxTokens?: number;
    model?: string;
    customInstructions?: string;
    businessContext?: string;
    clientSpecificData?: {
      [key: string]: any;
    };
  };
  
  // Controle de versões e modificações
  versionInfo?: {
    originalFlowiseId?: string;
    modifiedAt?: string;
    modifiedBy?: string;
    version?: number;
    parentVersion?: string;
    isCustomized?: boolean;
  };
  
  // Status de re-exportação
  reExportStatus?: {
    status: 'pending' | 'exporting' | 'success' | 'error';
    newFlowiseId?: string;
    exportedAt?: string;
    error?: string;
  };
}

interface Cliente {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  company?: string;
  sector?: string;
  
  // Campos adicionais para personalização
  customSettings?: {
    industry?: string;
    companySize?: string;
    targetAudience?: string;
    brandVoice?: string;
    specificRequirements?: string[];
  };
}

interface AgentCardV2Props {
  agent: Agent;
  clientes: Cliente[];
  onClienteChange: (agentId: string, clienteId: string) => void;
  onDisponibilidadeChange: (agentId: string, disponivel: boolean) => void;
  onInputTypesChange: (agentId: string, inputTypes: ('prompt' | 'prompt_system')[]) => void;
  onExportToFlowise: (agent: Agent) => void;
  onSaveCustomConfig: (agentId: string, config: any) => void;
  onReExportToFlowise: (agentId: string) => void;
  isSaving?: boolean;
  isExporting?: boolean;
}

// Componente de Card do Agente V2
export default function AgentCardV2({ 
  agent, 
  clientes, 
  onClienteChange, 
  onDisponibilidadeChange,
  onInputTypesChange,
  onExportToFlowise,
  onSaveCustomConfig,
  onReExportToFlowise,
  isSaving = false,
  isExporting = false
}: AgentCardV2Props) {
  const [selectedCliente, setSelectedCliente] = useState<string>(agent.cliente?.id || '');
  const [disponivel, setDisponivel] = useState<boolean>(agent.disponivel || false);
  const [inputTypes, setInputTypes] = useState<('prompt' | 'prompt_system')[]>(agent.inputTypes || []);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  const handleClienteSelect = (clienteId: string) => {
    setSelectedCliente(clienteId);
    onClienteChange(agent.id, clienteId);
  };

  const handleDisponibilidadeToggle = () => {
    const newValue = !disponivel;
    setDisponivel(newValue);
    onDisponibilidadeChange(agent.id, newValue);
  };

  const handleInputTypeToggle = (type: 'prompt' | 'prompt_system') => {
    const newTypes = inputTypes.includes(type) 
      ? inputTypes.filter(t => t !== type)
      : [...inputTypes, type];
    setInputTypes(newTypes);
    onInputTypesChange(agent.id, newTypes);
  };

  const handleSaveConfig = (config: any) => {
    onSaveCustomConfig(agent.id, config);
  };

  const handleReExport = () => {
    onReExportToFlowise(agent.id);
  };

  const getFlowiseStatusBadge = () => {
    if (!agent.flowiseConfig) {
      return <Badge variant="outline">Não Exportado</Badge>;
    }

    switch (agent.flowiseConfig.syncStatus) {
      case 'synced':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sincronizado
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-700">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Sincronizando
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Erro
          </Badge>
        );
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const getReExportStatusBadge = () => {
    if (!agent.reExportStatus) {
      return null;
    }

    switch (agent.reExportStatus.status) {
      case 'success':
        return (
          <Badge variant="default" className="bg-purple-600">
            <Sparkles className="w-3 h-3 mr-1" />
            Re-exportado
          </Badge>
        );
      case 'exporting':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Re-exportando...
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Erro na Re-exportação
          </Badge>
        );
      default:
        return null;
    }
  };

  const isCustomized = agent.versionInfo?.isCustomized || Boolean(agent.customConfig);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold line-clamp-1 flex items-center gap-2">
                {agent.customConfig?.name || agent.name}
                {isCustomized && (
                  <Badge variant="default" className="bg-purple-600 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Personalizado
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {agent.customConfig?.description || agent.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge variant={agent.type === 'workflow' ? 'default' : 'secondary'}>
              {agent.type === 'workflow' ? 'Workflow' : agent.type}
            </Badge>
            {getFlowiseStatusBadge()}
            {getReExportStatusBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Campo Cliente */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Cliente
          </Label>
          <Select value={selectedCliente} onValueChange={handleClienteSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecionar cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{cliente.name}</span>
                    <Badge
                      variant={cliente.status === 'active' ? 'default' : 'secondary'}
                      className="ml-2 text-xs"
                    >
                      {cliente.status}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Campo Disponível */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4" />
            Disponibilidade
          </Label>
          
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={disponivel}
              onCheckedChange={handleDisponibilidadeToggle}
              id={`disponivel-${agent.id}`}
            />
            <Label htmlFor={`disponivel-${agent.id}`} className="text-sm">
              Agente disponível para uso
            </Label>
          </div>

          {disponivel && (
            <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Label className="text-sm font-medium">Tipos de entrada aceitos:</Label>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={inputTypes.includes('prompt')}
                    onCheckedChange={() => handleInputTypeToggle('prompt')}
                    id={`prompt-${agent.id}`}
                  />
                  <Label htmlFor={`prompt-${agent.id}`} className="text-sm">
                    Prompt (workflows padrão)
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={inputTypes.includes('prompt_system')}
                    onCheckedChange={() => handleInputTypeToggle('prompt_system')}
                    id={`prompt-system-${agent.id}`}
                  />
                  <Label htmlFor={`prompt-system-${agent.id}`} className="text-sm">
                    Prompt System (workflows de sistema)
                  </Label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Informações técnicas */}
        {agent.studioMetadata && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Informações Técnicas</Label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nodes:</span>
                <span>{agent.studioMetadata.nodeCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Edges:</span>
                <span>{agent.studioMetadata.edgeCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Complexidade:</span>
                <span>{agent.studioMetadata.complexityScore || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={agent.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                  {agent.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
            {agent.flowiseConfig?.flowiseId && (
              <div className="text-xs text-muted-foreground mt-2">
                <span className="font-medium">ID Flowise:</span> {agent.flowiseConfig.flowiseId}
              </div>
            )}
            {agent.reExportStatus?.newFlowiseId && (
              <div className="text-xs text-purple-600 mt-1">
                <span className="font-medium">Novo ID:</span> {agent.reExportStatus.newFlowiseId}
              </div>
            )}
            {agent.versionInfo?.version && (
              <div className="text-xs text-muted-foreground mt-1">
                <span className="font-medium">Versão:</span> v{agent.versionInfo.version}
              </div>
            )}
            {agent.flowiseConfig?.exportedAt && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Última atualização:</span>{' '}
                {new Date(agent.flowiseConfig.exportedAt).toLocaleString('pt-BR')}
              </div>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-1" />
              Detalhes
            </Button>
            
            <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-1" />
                  Configurar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Configurar Agente - {agent.name}</DialogTitle>
                  <DialogDescription>
                    Personalize as configurações do workflow após a exportação do Flowise
                  </DialogDescription>
                </DialogHeader>
                <AgentConfigEditor
                  agent={agent}
                  onSave={handleSaveConfig}
                  onReExport={handleReExport}
                  isSaving={isSaving}
                  isExporting={isExporting}
                />
              </DialogContent>
            </Dialog>
          </div>
          
          <Button 
            onClick={() => onExportToFlowise(agent)}
            className="bg-purple-600 hover:bg-purple-700"
            size="sm"
            disabled={!selectedCliente || !disponivel}
          >
            <Cloud className="w-4 h-4 mr-1" />
            Exportar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}