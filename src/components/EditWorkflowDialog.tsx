"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  RefreshCw, 
  Download, 
  Settings, 
  Zap, 
  Users, 
  Edit,
  Save,
  FileText,
  Code,
  Share2,
  Copy,
  ExternalLink
} from 'lucide-react';

interface FlowiseWorkflow {
  id: string;
  flowiseId: string;
  name: string;
  description?: string;
  type: 'CHATFLOW' | 'AGENTFLOW' | 'MULTIAGENT' | 'ASSISTANT';
  deployed: boolean;
  isPublic: boolean;
  category?: string;
  complexityScore: number;
  nodeCount: number;
  createdAt: string;
}

interface EditWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingWorkflow: FlowiseWorkflow | null;
  editForm: {
    name: string;
    description: string;
    category: string;
    deployed: boolean;
    isPublic: boolean;
  };
  onFormChange: (field: string, value: string | boolean) => void;
  onSave: () => void;
  isEditing: boolean;
  onOpenCanvas: (workflow: FlowiseWorkflow) => void;
  onExportToFlowise: (workflow: FlowiseWorkflow) => void;
  exporting: string | null;
  onExportAsJSON?: (workflow: FlowiseWorkflow) => void;
  onExportAsConfig?: (workflow: FlowiseWorkflow) => void;
  onCopyToClipboard?: (workflow: FlowiseWorkflow) => void;
}

export default function EditWorkflowDialog({
  open,
  onOpenChange,
  editingWorkflow,
  editForm,
  onFormChange,
  onSave,
  isEditing,
  onOpenCanvas,
  onExportToFlowise,
  exporting,
  onExportAsJSON,
  onExportAsConfig,
  onCopyToClipboard
}: EditWorkflowDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            Editar Workflow
          </DialogTitle>
          <DialogDescription>
            Edite as informações do workflow "{editingWorkflow?.name}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Informações básicas */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">Nome do Workflow</Label>
              <Input
                id="workflow-name"
                value={editForm.name}
                onChange={(e) => onFormChange('name', e.target.value)}
                placeholder="Digite o nome do workflow"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workflow-description">Descrição</Label>
              <Textarea
                id="workflow-description"
                value={editForm.description}
                onChange={(e) => onFormChange('description', e.target.value)}
                placeholder="Digite a descrição do workflow"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workflow-category">Categoria</Label>
              <Input
                id="workflow-category"
                value={editForm.category}
                onChange={(e) => onFormChange('category', e.target.value)}
                placeholder="Digite a categoria do workflow"
              />
            </div>
          </div>
          
          {/* Opções de configuração */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Configurações</h4>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="workflow-deployed"
                checked={editForm.deployed}
                onCheckedChange={(checked) => 
                  onFormChange('deployed', checked as boolean)
                }
              />
              <Label htmlFor="workflow-deployed" className="flex items-center gap-2 cursor-pointer">
                <Zap className="w-4 h-4" />
                Workflow está implantado (deployed)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="workflow-public"
                checked={editForm.isPublic}
                onCheckedChange={(checked) => 
                  onFormChange('isPublic', checked as boolean)
                }
              />
              <Label htmlFor="workflow-public" className="flex items-center gap-2 cursor-pointer">
                <Users className="w-4 h-4" />
                Workflow é público
              </Label>
            </div>
          </div>
          
          {/* Informações do sistema */}
          {editingWorkflow && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700">Informações do Sistema</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">ID:</span>
                  <p className="text-gray-600 font-mono text-xs">{editingWorkflow.id}</p>
                </div>
                <div>
                  <span className="font-medium">Flowise ID:</span>
                  <p className="text-gray-600 font-mono text-xs">{editingWorkflow.flowiseId}</p>
                </div>
                <div>
                  <span className="font-medium">Tipo:</span>
                  <p className="text-gray-600">{editingWorkflow.type}</p>
                </div>
                <div>
                  <span className="font-medium">Complexidade:</span>
                  <p className="text-gray-600">{editingWorkflow.complexityScore}/100</p>
                </div>
                <div>
                  <span className="font-medium">Nodes:</span>
                  <p className="text-gray-600">{editingWorkflow.nodeCount}</p>
                </div>
                <div>
                  <span className="font-medium">Criado em:</span>
                  <p className="text-gray-600">{new Date(editingWorkflow.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Ações rápidas */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Ações Rápidas</h4>
            
            {/* Ações principais */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => editingWorkflow && onOpenCanvas(editingWorkflow)}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Abrir no Canvas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => editingWorkflow && onExportToFlowise(editingWorkflow)}
                disabled={exporting === editingWorkflow?.id}
                className="flex items-center gap-2"
              >
                {exporting === editingWorkflow?.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Exportar para Flowise
              </Button>
            </div>
            
            {/* Opções de exportação avançada */}
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-muted-foreground">Exportação Avançada</h5>
              <div className="flex flex-wrap gap-2">
                {onExportAsJSON && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editingWorkflow && onExportAsJSON(editingWorkflow)}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Exportar JSON
                  </Button>
                )}
                {onExportAsConfig && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editingWorkflow && onExportAsConfig(editingWorkflow)}
                    className="flex items-center gap-2"
                  >
                    <Code className="w-4 h-4" />
                    Exportar Config
                  </Button>
                )}
                {onCopyToClipboard && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editingWorkflow && onCopyToClipboard(editingWorkflow)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar ID
                  </Button>
                )}
              </div>
            </div>
            
            {/* Links diretos */}
            {editingWorkflow && (
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-muted-foreground">Links Diretos</h5>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const chatUrl = `https://aaranha-zania.hf.space/chat/${editingWorkflow.flowiseId}`;
                      window.open(chatUrl, '_blank');
                    }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Chat
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const editUrl = `https://aaranha-zania.hf.space/canvas/${editingWorkflow.flowiseId}`;
                      window.open(editUrl, '_blank');
                    }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const apiUrl = `https://aaranha-zania.hf.space/api/v1/chatflows/${editingWorkflow.flowiseId}`;
                      navigator.clipboard.writeText(apiUrl);
                    }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Copy className="w-3 h-3" />
                    API URL
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isEditing}
          >
            Cancelar
          </Button>
          <Button
            onClick={onSave}
            disabled={isEditing || !editForm.name.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isEditing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}