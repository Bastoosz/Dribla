// components/ModalNovoAluno.tsx

import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import type { Aluno } from '../types/aluno.ts';

interface ModalNovoAlunoProps {
  onClose: () => void;
  onAlunoAdicionado: () => void;
  contagemAtualAlunos: number;
  limiteAlunos: number; // TODO: Puxar isto do plano do treinador
}

// O tipo de status da BD
type StatusMensalidadeDB = Aluno['status_mensalidade']; // 'pago' | 'pendente'

const ModalNovoAluno: React.FC<ModalNovoAlunoProps> = ({ onClose, onAlunoAdicionado, contagemAtualAlunos, limiteAlunos }) => {
  const [nome, setNome] = useState('');
  const [nomePai, setNomePai] = useState('');
  const [emailPai, setEmailPai] = useState('');
  const [valor, setValor] = useState<number>(100); // Valor padrão
  
  // Define a data de vencimento padrão para 30 dias a partir de hoje
  const dataPadraoVencimento = new Date();
  dataPadraoVencimento.setDate(dataPadraoVencimento.getDate() + 30);
  const [vencimento, setVencimento] = useState(dataPadraoVencimento.toISOString().slice(0, 10));
  
  // NOVO ESTADO: O status é 'pago' ou 'pendente'? Padrão é 'pendente'
  const [statusInicial, setStatusInicial] = useState<StatusMensalidadeDB>('pendente');
  
  const [loadingModal, setLoadingModal] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // Verificação de Limite
  // TODO: Esta lógica precisa ser movida para o handleSubmit para buscar o limite real do treinador
  const isBloqueado = false; // contagemAtualAlunos >= limiteAlunos;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Adicionar verificação de limite real aqui (buscar dados do treinador)
    // if (isBloqueado) {
    //   setErrorModal(`Limite de ${limiteAlunos} alunos atingido. Faça upgrade.`);
    //   return;
    // }

    setLoadingModal(true);
    setErrorModal(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorModal('Utilizador não autenticado. Faça login novamente.');
      setLoadingModal(false);
      return;
    }
    
    const payload = {
      nome_aluno: nome,
      nome_pai: nomePai,
      email_pai: emailPai,
      data_matricula: new Date().toISOString(),
      // Garante que a data seja guardada como UTC meia-noite
      data_vencimento_mensalidade: new Date(vencimento + 'T00:00:00').toISOString(),
      status_mensalidade: statusInicial, // Guarda 'pago' ou 'pendente'
      valor_mensalidade: valor,
      id_treinador: user.id
    };

    const { error } = await supabase.from('alunos').insert([payload]);

    if (error) {
      console.error('Erro ao inserir aluno:', error);
      setErrorModal('Erro ao registar atleta. Verifique os dados e tente novamente.');
      setLoadingModal(false);
    } else {
      setLoadingModal(false);
      onAlunoAdicionado();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/60">
      <div className="bg-gray-800 p-8 rounded-xl z-10 w-full max-w-md border border-gray-700 shadow-xl">
        <h2 className="text-xl font-bold mb-6 text-white">Adicionar Novo Atleta</h2>

        {errorModal && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-lg border border-red-800 text-sm">
            {errorModal}
          </div>
        )}
        
        {isBloqueado && (
           <div className="mb-4 p-3 bg-dribla-orange/20 text-dribla-orange rounded-lg border border-dribla-orange text-sm">
            <b>Limite Atingido!</b> Não pode adicionar mais alunos no seu plano atual.
            <a href="/planos" className="font-bold underline ml-2">Fazer Upgrade</a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome-atleta" className="label-dribla">Nome do Atleta*</label>
            <input
              id="nome-atleta"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="input-dribla"
              placeholder="Nome completo do aluno"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="nome-pai" className="label-dribla">Nome do Responsável</label>
              <input
                id="nome-pai"
                value={nomePai}
                onChange={(e) => setNomePai(e.target.value)}
                className="input-dribla"
                placeholder="(Opcional)"
              />
            </div>
             <div>
              <label htmlFor="email-pai" className="label-dribla">Email do Responsável*</label>
              <input
                id="email-pai"
                value={emailPai}
                onChange={(e) => setEmailPai(e.target.value)}
                type="email"
                required
                className="input-dribla"
                placeholder="Para envio de cobranças"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="valor" className="label-dribla">Valor Mensalidade (R$)*</label>
              <input
                id="valor"
                value={valor}
                onChange={(e) => setValor(Number(e.target.value))}
                type="number"
                min="0"
                step="0.01"
                required
                className="input-dribla"
                placeholder="Ex: 100.00"
              />
            </div>
            <div>
              <label htmlFor="vencimento" className="label-dribla">Próximo Vencimento*</label>
              <input
                id="vencimento"
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
            <label className="label-dribla">Status da Mensalidade na Matrícula*</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="status-inicial"
                  value="pendente"
                  checked={statusInicial === 'pendente'}
                  onChange={() => setStatusInicial('pendente')}
                  className="w-4 h-4 text-dribla-green bg-gray-700 border-gray-600 focus:ring-dribla-green"
                />
                <span className="ml-2 text-sm">Pendente (Não Pago)</span>
              </label>
              <label className="flex items-center text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="status-inicial"
                  value="pago"
                  checked={statusInicial === 'pago'}
                  onChange={() => setStatusInicial('pago')}
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
              disabled={loadingModal || isBloqueado}
              className="btn-primary"
            >
              {loadingModal ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Adicionar Atleta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNovoAluno;

