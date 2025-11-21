import React from 'react';
import { Card } from './ui/Card';
import { Aluno } from '../types/aluno';
import { ElencoTableRow } from './ElencoTableRow';
interface ElencoTableProps {
  alunos: Aluno[];
  onEdit: (aluno: Aluno) => void;
  onDelete: (aluno: Aluno) => void;
}
export const ElencoTable = React.memo(function ElencoTable({ alunos, onEdit, onDelete }: ElencoTableProps) {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
        <thead className="bg-gray-900/50">
          <tr>
            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Aluno
            </th>
            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Responsável
            </th>
            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Vencimento
            </th>
            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Valor
            </th>
            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="relative px-4 sm:px-6 py-3">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {alunos.map((aluno) => (
            <ElencoTableRow key={aluno.id} aluno={aluno} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
});
