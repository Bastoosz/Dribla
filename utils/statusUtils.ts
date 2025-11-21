import { ElementType } from 'react';
import { AlertTriangle, Clock, CheckCircle, Hourglass } from 'lucide-react';
import type { Aluno } from '../types/aluno';
export type RealtimeStatus = 'vencida' | 'proximo' | 'paga' | 'pendente';
export const statusMap: Record<RealtimeStatus, { 
  texto: string; 
  corFundo: string; 
  corTexto: string; 
  icone: ElementType 
}> = {
  vencida: {
    texto: 'Vencido',
    corFundo: 'bg-red-100 dark:bg-dribla-orange/20',
    corTexto: 'text-red-800 dark:text-dribla-orange',
    icone: AlertTriangle,
  },
  proximo: {
    texto: 'Próximo',
    corFundo: 'bg-yellow-100 dark:bg-yellow-500/20',
    corTexto: 'text-yellow-800 dark:text-yellow-400',
    icone: Clock,
  },
  paga: {
    texto: 'Pago',
    corFundo: 'bg-green-100 dark:bg-dribla-green/20',
    corTexto: 'text-green-800 dark:text-dribla-green',
    icone: CheckCircle,
  },
  pendente: {
    texto: 'Pendente',
    corFundo: 'bg-gray-100 dark:bg-gray-600/50',
    corTexto: 'text-gray-800 dark:text-gray-300',
    icone: Hourglass,
  },
};
export const getRealtimeStatus = (aluno: Aluno, hoje: Date = new Date()): RealtimeStatus => {
  hoje.setHours(0, 0, 0, 0);
  if (aluno.status_mensalidade === 'pago') {
    return 'paga';
  }
  const vencimento = new Date(aluno.data_vencimento_mensalidade + 'T00:00:00');
  vencimento.setHours(0, 0, 0, 0);
  if (vencimento < hoje) {
    return 'vencida';
  }
  const cincoDias = new Date(hoje);
  cincoDias.setDate(hoje.getDate() + 5);
  if (vencimento >= hoje && vencimento <= cincoDias) {
    return 'proximo';
  }
  return 'pendente';
};
export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      timeZone: 'UTC' 
    };
    return date.toLocaleDateString('pt-BR', options);
  } catch (e) { 
    return 'Data Inválida'; 
  }
};
export const formatCurrency = (value: number | null) => {
  if (value === null) return 'N/A';
  return value.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });
};