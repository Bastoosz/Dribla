import React from 'react';
import { Aluno } from '../types/aluno';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Edit, Trash2 } from 'lucide-react';
import { RealtimeStatus, statusMap, formatDate, formatCurrency } from '../utils/statusUtils';
interface ElencoTableRowProps {
  aluno: Aluno;
  onEdit: (aluno: Aluno) => void;
  onDelete: (aluno: Aluno) => void;
}
export const ElencoTableRow = React.memo(function ElencoTableRow({ aluno, onEdit, onDelete }: ElencoTableRowProps) {
  const statusInfo = statusMap[aluno.realtimeStatus as RealtimeStatus];
  return (
    <tr className="hover:bg-gray-700/50 transition duration-150">
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-white">{aluno.nome_aluno}</div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-300">{aluno.nome_pai || 'N/A'}</div>
        <div className="text-xs text-gray-500">{aluno.email_pai}</div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-300">{formatDate(aluno.data_vencimento_mensalidade)}</div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-300">{formatCurrency(aluno.valor_mensalidade)}</div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <Badge
          status={aluno.realtimeStatus as RealtimeStatus}
          icon={React.createElement(statusInfo.icone)}
        >
          {statusInfo.texto}
        </Badge>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        <Button
          onClick={() => onEdit(aluno)}
          variant="ghost"
          size="icon"
          className="text-blue-400 hover:text-blue-300"
        >
          <Edit className="w-5 h-5" />
          <span className="sr-only">Editar</span>
        </Button>
        <Button
          onClick={() => onDelete(aluno)}
          variant="ghost"
          size="icon"
          className="text-red-400 hover:text-red-300"
        >
          <Trash2 className="w-5 h-5" />
          <span className="sr-only">Excluir</span>
        </Button>
      </td>
    </tr>
  );
});
