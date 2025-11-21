import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, User, Mail, CreditCard, Calendar } from 'lucide-react';
import type { Aluno } from '../types/aluno';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Alert } from './ui/Alert';
import { cn } from '../utils/cn';
interface ModalNovoAlunoProps {
  onClose: () => void;
  onAlunoAdicionado: () => void;
  contagemAtualAlunos: number;
  limiteAlunos: number;
}
type StatusMensalidadeDB = Aluno['status_mensalidade'];
const ModalNovoAluno: React.FC<ModalNovoAlunoProps> = ({ onClose, onAlunoAdicionado, contagemAtualAlunos, limiteAlunos }) => {
  const [nome, setNome] = useState('');
  const [nomePai, setNomePai] = useState('');
  const [emailPai, setEmailPai] = useState('');
  const [valor, setValor] = useState<number>(100);
  const dataPadraoVencimento = new Date();
  dataPadraoVencimento.setDate(dataPadraoVencimento.getDate() + 30);
  const [vencimento, setVencimento] = useState(dataPadraoVencimento.toISOString().slice(0, 10));
  const [statusInicial, setStatusInicial] = useState<StatusMensalidadeDB>('pendente');
  const [loadingModal, setLoadingModal] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const isBloqueado = contagemAtualAlunos >= limiteAlunos;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBloqueado) {
      setErrorModal(`Limite de ${limiteAlunos} alunos atingido. Faça upgrade.`);
      return;
    }
    setLoadingModal(true);
    setErrorModal(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorModal('Sessão expirada. Por favor, faça login novamente.');
      setLoadingModal(false);
      return;
    }
    const payload = {
      id_treinador: user.id,
      nome_aluno: nome,
      nome_pai: nomePai,
      email_pai: emailPai,
      valor_mensalidade: valor,
      data_vencimento_mensalidade: new Date(vencimento + 'T00:00:00').toISOString(),
      status_mensalidade: statusInicial,
    };
    const { error } = await supabase
      .from('alunos')
      .insert(payload);
    if (error) {
      setErrorModal(error.message);
      setLoadingModal(false);
      return;
    }
    onAlunoAdicionado();
    onClose();
  };
  return (
    <form onSubmit={handleSubmit}>
      <Modal 
        isOpen={true} 
        onClose={onClose}
        title="Novo Aluno"
        footer={
          <>
            <Button 
              variant="ghost" 
              type="button"
              onClick={onClose}
              disabled={loadingModal}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={loadingModal || isBloqueado}
            >
              {loadingModal ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adicionando...
                </>
              ) : (
                'Adicionar Aluno'
              )}
            </Button>
          </>
        }
      >
        {errorModal && (
          <Alert 
            variant="error"
            title="Erro ao adicionar aluno"
            className="mb-6"
          >
            {errorModal}
          </Alert>
        )}
        {isBloqueado && (
          <Alert
            variant="warning"
            title="Limite Atingido!"
            className="mb-6"
          >
            Não pode adicionar mais alunos no seu plano atual.{' '}
            <a href="/planos" className="font-bold underline">Fazer Upgrade</a>
          </Alert>
        )}
        {}
        <div className="space-y-4">
          <Input
            label="Nome do Aluno"
            icon={<User className="h-4 w-4" />}
            type="text"
            value={nome}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value)}
            placeholder="Nome completo do aluno"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nome do Responsável"
              icon={<User className="h-4 w-4" />}
              type="text"
              value={nomePai}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNomePai(e.target.value)}
              placeholder="(Opcional)"
            />
            <Input
              label="Email do Responsável"
              icon={<Mail className="h-4 w-4" />}
              type="email"
              value={emailPai}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailPai(e.target.value)}
              placeholder="Para envio de cobranças"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor da Mensalidade"
              icon={<CreditCard className="h-4 w-4" />}
              type="number"
              value={valor}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValor(Number(e.target.value))}
              placeholder="Ex: 100.00"
              required
              min="0"
              step="0.01"
            />
            <Input
              label="Data de Vencimento"
              icon={<Calendar className="h-4 w-4" />}
              type="date"
              value={vencimento}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVencimento(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Status Inicial
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatusInicial('pendente')}
                className={cn(
                  "flex-1 p-3 rounded-lg border transition-colors",
                  statusInicial === 'pendente' 
                    ? "bg-gray-800 border-dribla-green text-white" 
                    : "border-gray-700 text-gray-400 hover:border-gray-600"
                )}
              >
                <Badge className="w-full" variant="warning">Pendente</Badge>
              </button>
              <button
                type="button"
                onClick={() => setStatusInicial('pago')}
                className={cn(
                  "flex-1 p-3 rounded-lg border transition-colors",
                  statusInicial === 'pago'
                    ? "bg-gray-800 border-dribla-green text-white"
                    : "border-gray-700 text-gray-400 hover:border-gray-600"
                )}
              >
                <Badge className="w-full" variant="success">Pago</Badge>
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </form>
  );
};
export default ModalNovoAluno;