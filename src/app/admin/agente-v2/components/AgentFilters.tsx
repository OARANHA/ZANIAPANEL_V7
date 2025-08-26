'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface AgentFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onFilterTypeChange: (value: string) => void;
}

export default function AgentFilters({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange
}: AgentFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar agentes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={filterType} onValueChange={onFilterTypeChange}>
        <SelectTrigger className="w-full sm:w-56">
          <SelectValue placeholder="Filtrar por..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Agentes</SelectItem>
          <SelectItem value="available">Disponíveis</SelectItem>
          <SelectItem value="with_client">Com Cliente</SelectItem>
          <SelectItem value="exported">Exportados</SelectItem>
          <SelectItem value="workflow">Workflows</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}