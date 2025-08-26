import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Zap, 
  Users, 
  Database, 
  Code, 
  BarChart3, 
  Target, 
  AlertTriangle 
} from 'lucide-react';
import type { FlowiseWorkflow } from '../types';

interface CapabilitiesTabProps {
  workflowData: FlowiseWorkflow;
}

const capabilities = [
  {
    key: 'canHandleFileUpload',
    label: 'Upload de Arquivos',
    icon: FileText,
    color: 'text-blue-600'
  },
  {
    key: 'hasStreaming',
    label: 'Streaming',
    icon: Zap,
    color: 'text-green-600'
  },
  {
    key: 'supportsMultiLanguage',
    label: 'Multi-idioma',
    icon: Users,
    color: 'text-purple-600'
  },
  {
    key: 'hasMemory',
    label: 'Memória',
    icon: Database,
    color: 'text-orange-600'
  },
  {
    key: 'usesExternalAPIs',
    label: 'APIs Externas',
    icon: Code,
    color: 'text-red-600'
  },
  {
    key: 'hasAnalytics',
    label: 'Analytics',
    icon: BarChart3,
    color: 'text-indigo-600'
  },
  {
    key: 'supportsParallelProcessing',
    label: 'Processamento Paralelo',
    icon: Target,
    color: 'text-teal-600'
  },
  {
    key: 'hasErrorHandling',
    label: 'Tratamento de Erros',
    icon: AlertTriangle,
    color: 'text-yellow-600'
  }
];

export default function CapabilitiesTab({ workflowData }: CapabilitiesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Capacidades do Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {capabilities.map(({ key, label, icon: Icon, color }) => (
            <div key={key} className="flex items-center gap-3 p-3 border rounded-lg">
              <Icon className={`w-8 h-8 ${color}`} />
              <div>
                <div className="font-medium">{label}</div>
                <div className="text-sm text-gray-600">
                  {workflowData.capabilities[key as keyof typeof workflowData.capabilities] ? 'Sim' : 'Não'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}