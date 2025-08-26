import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  FileText,
  Database,
  MessageSquare,
  Settings,
  Wrench
} from 'lucide-react';

interface ValidationMessage {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  nodeId?: string;
  nodeName?: string;
  fix?: string;
  suggestion?: string;
}

interface WorkflowValidationMessagesProps {
  messages: ValidationMessage[];
  onNodeSelect?: (nodeId: string) => void;
}

export function WorkflowValidationMessages({ messages, onNodeSelect }: WorkflowValidationMessagesProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'warning';
      case 'info': return 'default';
      case 'success': return 'default';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNodeIcon = (nodeName?: string) => {
    if (!nodeName) return <Settings className="h-4 w-4" />;
    
    if (nodeName.includes('File') || nodeName.includes('file')) {
      return <FileText className="h-4 w-4" />;
    }
    
    if (nodeName.includes('Embed') || nodeName.includes('Pinecone') || nodeName.includes('Vector')) {
      return <Database className="h-4 w-4" />;
    }
    
    if (nodeName.includes('Chat') || nodeName.includes('OpenAI')) {
      return <MessageSquare className="h-4 w-4" />;
    }
    
    return <Settings className="h-4 w-4" />;
  };

  // Função para determinar se uma mensagem é temporariamente opcional
  const isTemporarilyOptionalMessage = (message: ValidationMessage): boolean => {
    // Verificar se é um erro de parâmetro ausente para nós que podem ser configurados depois
    if (message.type === 'error' && message.title.includes('Parâmetro obrigatório ausente')) {
      const nodeName = message.nodeName?.toLowerCase() || '';
      const tempOptionalNodes = [
        'text file',
        'openai embedding',
        'pinecone',
        'chatopenai'
      ];
      
      return tempOptionalNodes.some(node => nodeName.includes(node));
    }
    
    return false;
  };

  // Função para transformar mensagens temporariamente opcionais em avisos
  const transformMessages = (msgs: ValidationMessage[]): ValidationMessage[] => {
    return msgs.map(msg => {
      if (isTemporarilyOptionalMessage(msg)) {
        return {
          ...msg,
          type: 'warning',
          title: msg.title.replace('Parâmetro obrigatório ausente', 'Parâmetro opcional pendente'),
          description: msg.description + '. Este parâmetro pode ser configurado posteriormente.',
          suggestion: 'Você pode configurar este parâmetro mais tarde. Por enquanto, o workflow é válido.'
        };
      }
      return msg;
    });
  };

  const transformedMessages = transformMessages(messages);

  if (transformedMessages.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Workflow válido</AlertTitle>
        <AlertDescription className="text-green-700">
          Não foram encontrados problemas de validação neste workflow.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      {transformedMessages.map((message) => (
        <Alert 
          key={message.id} 
          variant={getVariant(message.type) as any}
          className="relative"
        >
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 p-1 rounded-full ${getTypeColor(message.type)}`}>
              {getIcon(message.type)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <AlertTitle className="text-sm font-medium">
                  {message.title}
                </AlertTitle>
                
                {message.nodeId && message.nodeName && (
                  <button
                    onClick={() => onNodeSelect?.(message.nodeId!)}
                    className="inline-flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 transition-colors"
                  >
                    {getNodeIcon(message.nodeName)}
                    <span>{message.nodeName}</span>
                  </button>
                )}
                
                <Badge 
                  variant={message.type === 'error' ? 'destructive' : message.type === 'warning' ? 'secondary' : 'default'}
                  className="text-xs"
                >
                  {message.type === 'error' ? 'Erro' : message.type === 'warning' ? 'Aviso' : message.type === 'info' ? 'Info' : 'Sucesso'}
                </Badge>
                
                {isTemporarilyOptionalMessage(message) && (
                  <Badge variant="secondary" className="text-xs">
                    <Wrench className="h-3 w-3 mr-1" />
                    Configurar depois
                  </Badge>
                )}
              </div>
              
              <AlertDescription className="mt-1 text-sm">
                {message.description}
              </AlertDescription>
              
              {(message.fix || message.suggestion) && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                  <span className="font-medium">
                    {message.fix ? 'Como corrigir:' : 'Sugestão:'}
                  </span>{' '}
                  {message.fix || message.suggestion}
                </div>
              )}
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}