import { Agent } from '../types';

export const filterAgents = (
  agents: Agent[], 
  searchQuery: string, 
  filterType: string
): Agent[] => {
  return agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                          (filterType === 'available' && agent.disponivel) ||
                          (filterType === 'with_client' && agent.cliente) ||
                          (filterType === 'exported' && agent.flowiseConfig?.exported) ||
                          (filterType === 'workflow' && agent.type === 'workflow');

    return matchesSearch && matchesFilter;
  });
};

export const getAgentStats = (agents: Agent[]) => {
  return {
    total: agents.length,
    available: agents.filter(a => a.disponivel).length,
    withClient: agents.filter(a => a.cliente).length,
    exported: agents.filter(a => a.flowiseConfig?.exported).length
  };
};