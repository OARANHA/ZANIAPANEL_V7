import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings, 
  Eye, 
  Download, 
  Upload, 
  Save, 
  RefreshCw, 
  BarChart3,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import WorkflowComplexityBadge from '../../WorkflowComplexityBadge';
import type { FlowiseWorkflow } from '../types';
import type { AutoSaveState } from '@/lib/auto-save';

interface WorkflowHeaderProps {
  workflowData: FlowiseWorkflow;
  autoSaveState: AutoSaveState;
  isAnalyzing: boolean;
  isSaving: boolean;
  onAnalyze: () => void;
  onPreview?: () => void;
  onExport?: () => void;
  onPublishToAgents?: () => void;
  onSave: () => void;
}

export default function WorkflowHeader({
  workflowData,
  autoSaveState,
  isAnalyzing,
  isSaving,
  onAnalyze,
  onPreview,
  onExport,
  onPublishToAgents,
  onSave
}: WorkflowHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <CardTitle className="text-xl flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600" />
            Editor Híbrido de Workflow
          </CardTitle>
          <div className="flex items-center gap-4">
            <Badge variant="outline">{workflowData.type}</Badge>
            <Badge variant="secondary">{workflowData.category || 'general'}</Badge>
            <WorkflowComplexityBadge score={workflowData.complexityScore} />
          </div>
        </div>
        
        {/* Auto-save Status */}
        <div className="flex items-center gap-2">
          {autoSaveState.isSaving && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Salvando...</span>
            </div>
          )}
          
          {autoSaveState.lastSaved && !autoSaveState.isSaving && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>
                Salvo {autoSaveState.lastSaved.toLocaleTimeString()}
              </span>
            </div>
          )}
          
          {autoSaveState.error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span>Erro ao salvar</span>
            </div>
          )}
          
          {autoSaveState.isDirty && !autoSaveState.isSaving && (
            <div className="flex items-center gap-2 text-sm text-yellow-600">
              <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse" />
              <span>Não salvo</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <BarChart3 className="w-4 h-4 mr-2" />
            )}
            Analisar
          </Button>
          
          {onPreview && (
            <Button variant="outline" size="sm" onClick={onPreview}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          )}
          
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          )}
          
          {onPublishToAgents && (
            <Button variant="outline" size="sm" onClick={onPublishToAgents}>
              <Upload className="w-4 h-4 mr-2" />
              Publicar
            </Button>
          )}
          
          <Button 
            size="sm" 
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}