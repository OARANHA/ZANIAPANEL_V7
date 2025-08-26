'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AgentNodeConfigDialog } from '@/components/agents/AgentNodeConfigDialog';

export default function TestNodeConfigDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const testAgent = {
    id: 'test-agent-1',
    name: 'Agente de Teste',
    description: 'Agente para testar a configuração de nodes',
    type: 'template' as const,
    config: '{}',
    knowledge: ''
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste do Diálogo de Configuração de Nodes</h1>
      <p className="text-gray-600 mb-6">
        Clique no botão abaixo para testar se o diálogo de configuração de nodes Flowise está funcionando corretamente.
      </p>
      
      <Button 
        onClick={() => {
          console.log('🧪 Test button clicked, opening dialog...');
          setIsDialogOpen(true);
        }}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Abrir Diálogo de Configuração
      </Button>

      <AgentNodeConfigDialog
        agent={testAgent}
        isOpen={isDialogOpen}
        onClose={() => {
          console.log('🧪 Test dialog closed');
          setIsDialogOpen(false);
        }}
        onSave={(selectedNodes, config) => {
          console.log('🧪 Test dialog saved:', { selectedNodes, config });
          setIsDialogOpen(false);
        }}
        onExport={(selectedNodes, config) => {
          console.log('🧪 Test dialog exported:', { selectedNodes, config });
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
}