import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert';
import { Aluno } from '../types/aluno';
import { Mail, AlertCircle, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
interface ModalEnviarCobrancaProps {
  isOpen: boolean;
  onClose: () => void;
  alunosAtrasados: Aluno[];
}
interface EmailPersonalizado {
  alunoId: number;
  mensagem: string;
}
function ModalEnviarCobranca({
  isOpen,
  onClose,
  alunosAtrasados,
}: ModalEnviarCobrancaProps) {
  const [alunosSelecionados, setAlunosSelecionados] = useState<number[]>([]);
  const [mensagemGeral, setMensagemGeral] = useState(
    'Olá! Identificamos que a mensalidade está em atraso. Por favor, regularize o pagamento para manter o acesso às atividades da escolinha. Qualquer dúvida, estamos à disposição!'
  );
  const [emailsPersonalizados, setEmailsPersonalizados] = useState<EmailPersonalizado[]>([]);
  const [alunosPersonalizadosAbertos, setAlunosPersonalizadosAbertos] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const handleToggleAluno = (alunoId: number) => {
    setAlunosSelecionados((prev) =>
      prev.includes(alunoId)
        ? prev.filter((id) => id !== alunoId)
        : [...prev, alunoId]
    );
  };
  const handleToggleTodos = () => {
    if (alunosSelecionados.length === alunosAtrasados.length) {
      setAlunosSelecionados([]);
    } else {
      setAlunosSelecionados(alunosAtrasados.map((a) => a.id));
    }
  };
  const handlePersonalizarEmail = (alunoId: number) => {
    if (alunosPersonalizadosAbertos.includes(alunoId)) {
      setAlunosPersonalizadosAbertos(prev => prev.filter(id => id !== alunoId));
    } else {
      setAlunosPersonalizadosAbertos(prev => [...prev, alunoId]);
      if (!emailsPersonalizados.find((e) => e.alunoId === alunoId)) {
        setEmailsPersonalizados([
          ...emailsPersonalizados,
          { alunoId, mensagem: mensagemGeral },
        ]);
      }
    }
  };
  const handleUpdateEmailPersonalizado = (alunoId: number, mensagem: string) => {
    setEmailsPersonalizados((prev) => {
      const existing = prev.find((e) => e.alunoId === alunoId);
      if (existing) {
        return prev.map((e) => (e.alunoId === alunoId ? { ...e, mensagem } : e));
      } else {
        return [...prev, { alunoId, mensagem }];
      }
    });
  };
  const handleEnviarEmails = async () => {
    if (alunosSelecionados.length === 0) {
      setError('Selecione pelo menos um aluno para enviar o email');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      const { data: treinador } = await supabase
        .from('treinadores')
        .select('nome_escolinha')
        .eq('id', user.id)
        .single();
      const nomeEscolinha = treinador?.nome_escolinha || 'Escolinha';
      const emailsParaEnviar = alunosSelecionados.map(alunoId => {
        const aluno = alunosAtrasados.find(a => a.id === alunoId);
        const emailPersonalizado = emailsPersonalizados.find(e => e.alunoId === alunoId);
        return {
          alunoId,
          nomeAluno: aluno?.nome_aluno,
          emailResponsavel: aluno?.email_pai,
          mensagem: emailPersonalizado ? emailPersonalizado.mensagem : mensagemGeral
        };
      });
      const response = await fetch('/api/emails/enviar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          emails: emailsParaEnviar,
          treinadorId: user.id,
          nomeEscolinha: nomeEscolinha
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar emails');
      }
      setSuccess(data.message || `${alunosSelecionados.length} email(s) enviado(s) com sucesso!`);
      setTimeout(() => {
        setSuccess('');
        setAlunosSelecionados([]);
        setEmailsPersonalizados([]);
        setAlunosPersonalizadosAbertos([]);
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error('Erro ao enviar emails:', err);
      setError('Erro ao enviar emails. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  const getMensagemParaAluno = (alunoId: number): string => {
    const personalizado = emailsPersonalizados.find((e) => e.alunoId === alunoId);
    return personalizado ? personalizado.mensagem : mensagemGeral;
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enviar Cobrança"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {}
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success">
            {success}
          </Alert>
        )}
        {}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
          <p className="text-xs text-gray-400">
            <span className="text-dribla-green font-semibold">{alunosAtrasados.length}</span> aluno(s) com mensalidade atrasada
          </p>
        </div>
        {}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">
            Mensagem Padrão
          </label>
          <textarea
            value={mensagemGeral}
            onChange={(e) => setMensagemGeral(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-dribla-green focus:border-transparent resize-none"
            rows={3}
            placeholder="Digite a mensagem de cobrança..."
          />
        </div>
        {}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-300">
              Alunos ({alunosSelecionados.length}/{alunosAtrasados.length})
            </h3>
            <button
              onClick={handleToggleTodos}
              className="text-xs text-dribla-green hover:text-dribla-green-600 transition-colors font-medium"
            >
              {alunosSelecionados.length === alunosAtrasados.length
                ? 'Desmarcar'
                : 'Marcar Todos'}
            </button>
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-dribla-green scrollbar-track-gray-800">
            {alunosAtrasados.map((aluno) => {
              const isSelecionado = alunosSelecionados.includes(aluno.id);
              const isPersonalizado = alunosPersonalizadosAbertos.includes(aluno.id);
              return (
                <div
                  key={aluno.id}
                  className={`bg-gray-800 p-2.5 rounded-lg border transition-all duration-200 ${
                    isSelecionado
                      ? 'border-dribla-green'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {}
                    <div className="flex items-center pt-0.5">
                      <label className="relative cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelecionado}
                          onChange={() => handleToggleAluno(aluno.id)}
                          className="sr-only peer"
                        />
                        <div className="w-4 h-4 rounded border-2 border-gray-600 bg-gray-700 peer-checked:bg-dribla-green peer-checked:border-dribla-green transition-all duration-200 flex items-center justify-center">
                          {isSelecionado && (
                            <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </label>
                    </div>
                    {}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate">
                            {aluno.nome_aluno}
                          </h4>
                          <p className="text-xs text-gray-400 truncate">
                            {aluno.nome_pai || 'Responsável não informado'}
                          </p>
                        </div>
                        <button
                          onClick={() => handlePersonalizarEmail(aluno.id)}
                          className={`text-[10px] px-2 py-1 rounded font-medium transition-all duration-200 whitespace-nowrap ${
                            isPersonalizado
                              ? 'bg-dribla-green text-gray-900'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {isPersonalizado ? 'Fechar' : 'Personalizar'}
                        </button>
                      </div>
                      {}
                      {isPersonalizado && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <textarea
                            value={getMensagemParaAluno(aluno.id)}
                            onChange={(e) =>
                              handleUpdateEmailPersonalizado(aluno.id, e.target.value)
                            }
                            className="w-full px-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-dribla-green focus:border-transparent resize-none"
                            rows={2}
                            placeholder="Mensagem personalizada..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-gray-700">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="text-sm py-2 w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleEnviarEmails}
            disabled={loading || alunosSelecionados.length === 0}
            className="bg-dribla-green hover:bg-dribla-green-600 text-gray-900 font-bold shadow-lg shadow-dribla-green/20 flex items-center justify-center gap-1.5 text-sm py-2 w-full sm:w-auto"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="w-3.5 h-3.5" />
                Enviar ({alunosSelecionados.length})
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
export default ModalEnviarCobranca;
