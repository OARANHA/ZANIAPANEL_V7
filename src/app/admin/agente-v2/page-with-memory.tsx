'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, Settings, Loader2, Search, Filter, Target, Eye, Building2, 
  CheckCircle, AlertTriangle, Cloud, Workflow, ToggleLeft, RefreshCw
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import AgentCardV2 from './components/AgentCardV2';
import AgentFilters from './components/AgentFilters';
import AgentStats from './components/AgentStats';
import { useAgents } from './hooks/useAgents';
import { useClientes } from './hooks/useClientes';
import { filterAgents, getAgentStats } from './utils/agentHelpers';

// Import the Cipher Memory System
import { useCipherMemory } from '@/lib/cipher-memory/useCipherMemory';

// Memoizar o componente para melhorar performance
const MemoizedAgentCardV2 = React.memo(AgentCardV2);

export default function AgenteV2PageWithMemory() {
  const { toast } = useToast();
  
  // Initialize the Cipher Memory System
  const { 
    memoryContext, 
    isInitialized: isMemoryInitialized, 
    recordTask, 
    recordDecision, 
    recordCodeSnippet,
    getTasks,
    getDecisions,
    getCodeSnippets
  } = useCipherMemory('Agente V2 Development Session');
  
  const {
    agents,
    isLoading,
    isRefreshing,
    lastUpdate,
    flowiseConnectionStatus,
    loadAgents,
    refreshData,
    handleClienteChange,
    handleDisponibilidadeChange,
    handleInputTypesChange,
    handleExportToFlowise,
    setIsLoading,
    setFlowiseConnectionStatus,
    setLastUpdate
  } = useAgents();

  const {
    clientes,
    loadClientes,
    setClientes
  } = useClientes();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryImmediate, setSearchQueryImmediate] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Função de busca com debounce
  const handleSearchChange = (value: string) => {
    setSearchQueryImmediate(value);
  };
  
  // Efeito para debounce da busca
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchQueryImmediate);
    }, 300); // 300ms de debounce
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchQueryImmediate]);

  const handleSearchChangeCallback = useCallback((value: string) => {
    handleSearchChange(value);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadAgents(), loadClientes()]);
      
      // Record this action in memory
      if (isMemoryInitialized) {
        await recordTask({
          title: 'Load agent and client data',
          description: 'Loaded agents from Flowise and clients from database',
          status: 'completed',
          priority: 2
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      
      // Record this error in memory
      if (isMemoryInitialized) {
        await recordDecision({
          context: 'Failed to load agent and client data',
          decision: 'Show error message to user',
          rationale: 'User needs to know that data loading failed'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredAgents = filterAgents(agents, searchQuery, filterType);
  const agentStats = getAgentStats(agents);

  // Function to handle export with memory recording
  const handleExportToFlowiseWithMemory = async (agent: any) => {
    // Record the decision to export
    if (isMemoryInitialized) {
      await recordDecision({
        context: `Preparing to export agent ${agent.name} to Flowise`,
        decision: 'Validate agent before export',
        rationale: 'Ensure agent has required fields before exporting'
      });
    }
    
    // Perform the export
    await handleExportToFlowise(agent);
    
    // Record the result
    if (isMemoryInitialized) {
      await recordTask({
        title: `Export agent ${agent.name}`,
        description: `Successfully exported agent ${agent.name} to Flowise`,
        status: 'completed',
        priority: 3
      });
      
      // Save the code snippet
      await recordCodeSnippet({
        filename: 'agent-export-data.json',
        language: 'json',
        content: JSON.stringify(agent, null, 2),
        description: `Export data for agent ${agent.name}`
      });
    }
  };

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Agentes V2 - Integração Flowise (Com Memória)
              </h1>
              <div className="flex items-center space-x-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Gerenciamento expandido de agentes com integração avançada ao Flowise
                </p>
                {flowiseConnectionStatus === 'connected' && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 dark:text-green-400">Conectado ao Flowise</span>
                  </div>
                )}
                {flowiseConnectionStatus === 'disconnected' && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-600 dark:text-red-400">Desconectado do Flowise</span>
                  </div>
                )}
                {flowiseConnectionStatus === 'checking' && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-yellow-600 dark:text-yellow-400">Verificando conexão...</span>
                  </div>
                )}
              </div>
              {lastUpdate && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Última atualização: {lastUpdate.toLocaleString('pt-BR')}
                </p>
              )}
              {isMemoryInitialized && (
                <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">
                  Memória Cipher ativada - Sessão ID: {memoryContext.sessionId?.substring(0, 8)}...
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={refreshData}
                disabled={isRefreshing}
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Atualizando...' : 'Atualizar do Flowise'}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/agents">
                  <Brain className="w-4 h-4 mr-2" />
                  Agentes V1
                </Link>
              </Button>
              <Button asChild>
                <Link href="/admin/studio">
                  <Target className="w-4 h-4 mr-2" />
                  Ir para Studio
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <AgentFilters
          searchQuery={searchQueryImmediate}
          onSearchChange={handleSearchChangeCallback}
          filterType={filterType}
          onFilterTypeChange={setFilterType}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Carregando agentes e clientes...</p>
            </div>
          </div>
        )}

        {/* Agents Grid */}
        {!isLoading && filteredAgents.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <MemoizedAgentCardV2
                key={agent.id}
                agent={agent}
                clientes={clientes}
                onClienteChange={(agentId, clienteId) => handleClienteChange(agentId, clienteId, clientes)}
                onDisponibilidadeChange={handleDisponibilidadeChange}
                onInputTypesChange={handleInputTypesChange}
                onExportToFlowise={handleExportToFlowiseWithMemory}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredAgents.length === 0 && (
          <div className="text-center py-16">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-200 to-blue-300 dark:from-purple-700 dark:to-blue-800 rounded-2xl flex items-center justify-center">
                <Workflow className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-3">
              Nenhum agente V2 encontrado
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || filterType !== 'all' 
                ? 'Nenhum agente corresponde aos seus filtros.'
                : 'Esta página exibe agentes prontos para integração com clientes.'
              }
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/admin/studio">
                  <Target className="w-4 h-4 mr-2" />
                  Ir para Studio
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/agents">
                  <Brain className="w-4 h-4 mr-2" />
                  Ver Agentes V1
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        {!isLoading && agents.length > 0 && (
          <AgentStats
            total={agentStats.total}
            available={agentStats.available}
            withClient={agentStats.withClient}
            exported={agentStats.exported}
          />
        )}
      </div>
    </MainLayout>
  );
}