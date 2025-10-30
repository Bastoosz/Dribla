// types/index.ts

// Define a estrutura de dados para um Aluno
// O status agora é apenas 'pago' ou 'pendente'
export interface Aluno {
    id: number;
    nome_aluno: string;
    nome_pai: string | null; // Permite nulo
    email_pai: string;
    data_matricula: string;
    data_vencimento_mensalidade: string;
    status_mensalidade: 'pago' | 'pendente'; // <-- MUDANÇA IMPORTANTE
    valor_mensalidade: number | null; // Permite nulo
    id_treinador?: string;
    data_criacao_aluno?: string;
    data_ultima_cobranca_email?: string | null; // Permite nulo
}

