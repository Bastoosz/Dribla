// pages/api/cron/enviar-cobrancas.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient'; 
import { Resend } from 'resend'; 

// Configura o Resend
const resendApiKey = process.env.RESEND_API_KEY; // <-- Lendo do .env.local
let resend: Resend | null = null;

if (resendApiKey) {
  resend = new Resend(resendApiKey); 
} else {
  console.warn("RESEND_API_KEY não definida. Verifique seu arquivo .env.local e reinicie o servidor.");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  // --- MUDANÇA PARA TESTE LOCAL ---
  // Permite GET (para teste no navegador) ou POST (para produção)
  if (req.method !== 'POST' && req.method !== 'GET') { 
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!resend) {
    return res.status(500).json({ error: 'Serviço de e-mail (Resend) não configurado no servidor. Verifique o .env.local' });
  }

  try {
    // 1. Define a data de corte (para evitar spam)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // 2. Busca alunos vencidos no Supabase
    const { data: alunosParaCobrar, error: fetchError } = await supabase
      .from('alunos')
      .select('id, nome_aluno, nome_pai, email_pai, valor_mensalidade, id_treinador, treinadores (nome, plano_atual)') 
      .eq('status_mensalidade', 'vencida')
      .lt('data_ultima_cobranca_email', sevenDaysAgo); 

    if (fetchError) throw fetchError; 

    if (!alunosParaCobrar || alunosParaCobrar.length === 0) {
      return res.status(200).json({ message: 'Nenhum aluno para cobrar hoje (status "vencida" não encontrado ou já notificado).' });
    }

    const emailPromises = alunosParaCobrar.map(async (aluno) => {
      // @ts-ignore (Tipagem do Join)
      const plano = aluno.treinadores?.plano_atual;
      let corpoEmail = `Olá ${aluno.nome_pai}, notamos que a mensalidade de ${aluno.nome_aluno} está vencida. Por favor, regularize a situação.`;
      
      if (plano === 'premium') {
        corpoEmail = `[Mensagem Premium] Olá ${aluno.nome_pai}, (Assunto: ${aluno.nome_aluno}) - Mensalidade vencida.`;
      }
      
      const htmlBody = `<p>${corpoEmail}</p><p>Valor: R$ ${aluno.valor_mensalidade.toFixed(2)}</p>`;
      
      // 4. Enviar o e-mail usando Resend
      const data = await resend!.emails.send({
        from: 'Dribla <contato@seusite-verificado.com>', // IMPORTANTE: Use seu domínio verificado no Resend
        to: [aluno.email_pai], 
        subject: `Dribla - Cobrança Pendente: ${aluno.nome_aluno}`,
        html: htmlBody,
      });

      // Se o email foi enviado com sucesso, atualiza o Supabase
      if(data.data?.id) {
          await supabase
            .from('alunos')
            .update({ data_ultima_cobranca_email: new Date().toISOString() })
            .eq('id', aluno.id);
      }
      
      return aluno.id; 
    });

    const resultados = await Promise.all(emailPromises);

    res.status(200).json({ 
      message: `Processo de cobrança (Resend) finalizado.`,
      emailsEnviados: resultados.length,
      alunosProcessados: resultados
    });

  } catch (error: any) {
    console.error("Erro no Cron de E-mail (Resend):", error);
    // Se o Resend falhar (ex: domínio não verificado), o erro aparecerá aqui
    res.status(500).json({ error: 'Erro ao processar cobranças.', details: error.message });
  }
}

