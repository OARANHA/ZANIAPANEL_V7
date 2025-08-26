'use client';

import React from 'react';
import ElegantCard from '@/components/ui/ElegantCard';
import { Brain, CheckCircle, Building2, Cloud } from 'lucide-react';

interface AgentStatsProps {
  total: number;
  available: number;
  withClient: number;
  exported: number;
}

export default function AgentStats({
  total,
  available,
  withClient,
  exported
}: AgentStatsProps) {
  if (total === 0) return null;

  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
      <ElegantCard
        title="Total de Agentes"
        value={total}
        description="Agentes disponíveis"
        icon={Brain}
        iconColor="text-blue-600"
        bgColor="bg-blue-100 dark:bg-blue-900/20"
      />
      <ElegantCard
        title="Disponíveis"
        value={available}
        description="Prontos para uso"
        icon={CheckCircle}
        iconColor="text-green-600"
        bgColor="bg-green-100 dark:bg-green-900/20"
      />
      <ElegantCard
        title="Com Cliente"
        value={withClient}
        description="Agentes associados"
        icon={Building2}
        iconColor="text-purple-600"
        bgColor="bg-purple-100 dark:bg-purple-900/20"
      />
      <ElegantCard
        title="Exportados"
        value={exported}
        description="No Flowise"
        icon={Cloud}
        iconColor="text-orange-600"
        bgColor="bg-orange-100 dark:bg-orange-900/20"
      />
    </div>
  );
}