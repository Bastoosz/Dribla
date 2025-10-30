// components/ModalEditarAluno.tsx

import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import type { Aluno } from '../types';

// O tipo de status da BD
type StatusMensalidadeDB = Aluno['status_mensalidade']; // 'pago' | 'pendente'

interface ModalEditarAlunoProps {
  aluno: Aluno;
  onClose: () => void;
  onAlunoEditado: () => void;
}

const ModalEditarAluno: React.FC<ModalEditarAlunoProps> = ({ aluno, onClose, onAlunoEditado }) => {
  
  // Inicializa os estados com os dados do 'aluno'
  const [nome, setNome] = useState(aluno.nome_aluno);
  const [nomePai, setNomePai] = useState(aluno.nome_pai || '');
  const [emailPai, setEmailPai] = useState(aluno.email_pai);
  const [valor, setValor] = useState(aluno.valor_mensalidade || 0);
  
  const [vencimento, setVencimento] = useState(
    aluno.data_vencimento_mensalidade ? new Date(aluno.data_vencimento_mensalidade + 'T00:00:00').toISOString().slice(0, 10) : ''
  );
  
  // --- LÓGICA DE STATUS SIMPLIFICADA ---
  // O estado 'statusMensalidade' agora começa com o status atual do aluno ('pago' ou 'pendente')
  const [statusMensalidade, setStatusMensalidade] = useState<StatusMensalidadeDB>(aluno.status_mensalidade);
  
  const [loadingModal, setLoadingModal] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingModal(true);
    setErrorModal(null);

    const payload = {
      nome_aluno: nome,
      nome_pai: nomePai,
      email_pai: emailPai,
      valor_mensalidade: valor,
      data_vencimento_mensalidade: new Date(vencimento + 'T00:00:00').toISOString(),
      status_mensalidade: statusMensalidade, // Guarda 'pago' ou 'pendente'
    };

    const { error } = await supabase
      .from('alunos')
      .update(payload)
      .eq('id', aluno.id);

    if (error) {
      console.error('Erro ao atualizar aluno:', error);
      setErrorModal('Erro ao atualizar atleta. Verifique os dados e tente novamente.');
      setLoadingModal(false);
    } else {
      setLoadingModal(false);
      onAlunoEditado();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/60">
      <div className="bg-gray-800 p-8 rounded-xl z-10 w-full max-w-md border border-gray-700 shadow-xl">
        <h2 className="text-xl font-bold mb-6 text-white">Editar Atleta</h2>
        
        {errorModal && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-lg border border-red-800 text-sm">
            {errorModal}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label htmlFor="edit-nome-atleta" className="label-dribla">Nome do Atleta*</label>
            <input
              id="edit-nome-atleta"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="input-dribla"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-nome-pai" className="label-dribla">Nome do Responsável</label>
              <input
                id="edit-nome-pai"
                value={nomePai}
                onChange={(e) => setNomePai(e.target.value)}
                className="input-dribla"
              />
            </div>
             <div>
              <label htmlFor="edit-email-pai" className="label-dribla">Email do Responsável*</label>
              <input
                id="edit-email-pai"
                value={emailPai}
                onChange={(e) => setEmailPai(e.target.value)}
                type="email"
                required
                className="input-dribla"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-valor" className="label-dribla">Valor Mensalidade (R$)*</label>
              <input
                id="edit-valor"
                value={valor}
                onChange={(e) => setValor(Number(e.target.value))}
                type="number"
                min="0"
                step="0.01"
                required
                className="input-dribla"
              />
            </div>
            <div>
              <label htmlFor="edit-vencimento" className="label-dribla">Próximo Vencimento*</label>
              <input
                id="edit-vencimento"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
                type="date"
                required
                className="input-dribla"
              />
            </div>
          </div>

          {/* --- CAMPO DE STATUS (SIMPLIFICADO) --- */}
          <div>
            <label className="label-dribla">Status da Mensalidade</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="status-mensalidade"
                  value="pendente"
                  checked={statusMensalidade === 'pendente'}
                  onChange={() => setStatusMensalidade('pendente')}
                  className="w-4 h-4 text-dribla-green bg-gray-700 border-gray-600 focus:ring-dribla-green"
                />
                <span className="ml-2 text-sm">Pendente (Não Pago)</span>
              </label>
              <label className="flex items-center text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="status-mensalidade"
                  value="pago"
                  checked={statusMensalidade === 'pago'}
                  onChange={() => setStatusMensalidade('pago')}
                  className="w-4 h-4 text-dribla-green bg-gray-700 border-gray-600 focus:ring-dribla-green"
                />
                <span className="ml-2 text-sm">Pago</span>
              </label>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loadingModal}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loadingModal}
              className="btn-primary"
            >
              {loadingModal ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ModalEditarAluno;

