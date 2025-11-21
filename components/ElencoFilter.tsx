import React from 'react';
import { Button } from './ui/Button';
import { RealtimeStatus } from '../utils/statusUtils';
type StatusFiltro = 'todos' | RealtimeStatus;
interface ElencoFilterProps {
  currentFilter: StatusFiltro;
  filterCounts: {
    todos: number;
    vencida: number;
    proximo: number;
    paga: number;
    pendente: number;
  };
  onFilterChange: (filter: StatusFiltro) => void;
}
export function ElencoFilter({ currentFilter, filterCounts, onFilterChange }: ElencoFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        onClick={() => onFilterChange('todos')}
        variant={currentFilter === 'todos' ? 'success' : 'secondary'}
        size="sm"
      >
        Todos ({filterCounts.todos})
      </Button>
      <Button
        onClick={() => onFilterChange('vencida')}
        variant={currentFilter === 'vencida' ? 'danger' : 'secondary'}
        size="sm"
      >
        Atrasados ({filterCounts.vencida})
      </Button>
      <Button
        onClick={() => onFilterChange('pendente')}
        variant={currentFilter === 'pendente' ? 'warning' : 'secondary'}
        size="sm"
      >
        Pendentes ({filterCounts.pendente})
      </Button>
      <Button
        onClick={() => onFilterChange('proximo')}
        variant={currentFilter === 'proximo' ? 'info' : 'secondary'}
        size="sm"
      >
        Próximos ({filterCounts.proximo})
      </Button>
      <Button
        onClick={() => onFilterChange('paga')}
        variant={currentFilter === 'paga' ? 'success' : 'secondary'}
        size="sm"
      >
        Em Dia ({filterCounts.paga})
      </Button>
    </div>
  );
}
