import { useState, useEffect } from 'react';
import { Cliente } from '../types';

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const loadClientes = async () => {
    try {
      const response = await fetch('/admin/api/clients');
      
      if (response.ok) {
        const data = await response.json() as any;
        setClientes(data.clients || data || []);
      } else {
        // Dados de exemplo
        const exemploClientes: Cliente[] = [
          {
            id: 'client-1',
            name: 'TechCorp Solutions',
            email: 'contato@techcorp.com',
            status: 'active',
            company: 'TechCorp Solutions Ltda',
            sector: 'Tecnologia'
          },
          {
            id: 'client-2', 
            name: 'Consultoria Empresarial ABC',
            email: 'admin@consultoriaabc.com',
            status: 'active',
            company: 'Consultoria ABC Ltda',
            sector: 'Consultoria'
          },
          {
            id: 'client-3',
            name: 'StartupXYZ',
            email: 'hello@startupxyz.io',
            status: 'pending',
            company: 'StartupXYZ Inc.',
            sector: 'Inovação'
          }
        ];
        setClientes(exemploClientes);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setClientes([]);
    }
  };

  return {
    clientes,
    loadClientes,
    setClientes
  };
};