export interface Aluno {
    id: number;
    nome_aluno: string;
    nome_pai: string | null; 
    email_pai: string;
    data_matricula: string;
    data_vencimento_mensalidade: string;
    status_mensalidade: 'pago' | 'pendente'; 
    valor_mensalidade: number | null; 
    id_treinador?: string;
    data_criacao_aluno?: string;
    data_ultima_cobranca_email?: string | null;
    realtimeStatus?: string;
}
