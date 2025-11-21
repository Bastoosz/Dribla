import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from 'lib/supabaseClient';
type EmailType = 'lembrete' | 'cobranca';
type Aluno = {
  id: string | number;
  nome_aluno: string;
  nome_pai?: string | null;
  email_pai?: string | null;
  status_mensalidade?: string | null;
  data_vencimento_mensalidade?: string | null;
  data_ultima_cobranca_email?: string | null;
  valor_mensalidade?: number | null;
};
type AlunoComTreinador = Aluno & {
  treinadores: {
    nome: string;
    plano_atual: 'free' | 'vip' | 'premium';
  } | null;
};
const formatarMoeda = (valor?: number | null): string => {
  if (!valor) return 'Valor não informado';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
const formatarData = (data?: string | null): string => {
  if (!data) return 'Data não informada';
  const dataObj = new Date(data + 'T00:00:00');
  return dataObj.toLocaleDateString('pt-BR');
};
const criarEmailLembrete = (aluno: AlunoComTreinador) => {
  const nomeTreinador = aluno.treinadores?.nome || 'O Treinador';
  const dataVencimento = formatarData(aluno.data_vencimento_mensalidade);
  const valor = formatarMoeda(aluno.valor_mensalidade);
  return {
    subject: `Lembrete de Mensalidade - ${aluno.nome_aluno}`,
    text: `
      Olá, ${aluno.nome_pai || 'Responsável'}!
      Este é um lembrete amigável sobre a próxima mensalidade de ${aluno.nome_aluno}.
      📅 Data de Vencimento: ${dataVencimento}
      💰 Valor: ${valor}
      Por favor, certifique-se de realizar o pagamento até a data de vencimento.
      Em caso de dúvidas, entre em contato com ${nomeTreinador}.
      Atenciosamente,
      Equipe Dribla
    `
  };
};
const criarEmailCobranca = (aluno: AlunoComTreinador) => {
  const nomeTreinador = aluno.treinadores?.nome || 'O Treinador';
  const dataVencimento = formatarData(aluno.data_vencimento_mensalidade);
  const valor = formatarMoeda(aluno.valor_mensalidade);
  return {
    subject: `Mensalidade Vencida - ${aluno.nome_aluno}`,
    text: `
      Olá, ${aluno.nome_pai || 'Responsável'}!
      Identificamos que a mensalidade de ${aluno.nome_aluno} está vencida.
      📅 Data de Vencimento: ${dataVencimento}
      💰 Valor: ${valor}
      ⚠️ Status: VENCIDO
      Por favor, regularize a situação o quanto antes para evitar qualquer interrupção nos treinos.
      Entre em contato com ${nomeTreinador} para mais informações ou para notificar o pagamento.
      Atenciosamente,
      Equipe Dribla
    `
  };
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' && process.env.NODE_ENV === 'development') {
     console.log("\n--- [CRON JOB SIMULADO INICIADO MANUALMENTE] ---");
  } 
  else if (req.method !== 'POST') {
     return res.status(405).setHeader('Allow', 'POST').json({ error: 'Método não permitido' });
  }
  const hojeISO = new Date().toISOString().slice(0, 10);
  const tresDiasFrenteISO = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const seteDiasAtrasISO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  let emailsSimulados = 0;
  const resultados = [];
  try {
  const simularEnvioEmail = (tipo: EmailType, aluno: AlunoComTreinador, detalhes: { subject: string; text: string }) => {
    const horarioEnvio = new Date().toLocaleTimeString('pt-BR');
    console.log('\n' + '='.repeat(80));
    console.log(`=== SIMULAÇÃO DE E-MAIL (${tipo.toUpperCase()}) - ${horarioEnvio} ===`);
    console.log('='.repeat(80));
    console.log(`ID do Aluno: ${aluno.id}`);
    console.log(`Aluno: ${aluno.nome_aluno}`);
    console.log(`Destinatário: ${aluno.email_pai || 'Email não cadastrado'}`);
    console.log(`Plano do Treinador: ${aluno.treinadores?.plano_atual?.toUpperCase()}`);
    console.log('-'.repeat(80));
    console.log('ASSUNTO:', detalhes.subject);
    console.log('-'.repeat(80));
    console.log('MENSAGEM:\n', detalhes.text.trim());
    console.log('='.repeat(80) + '\n');
  };
  const { data: alunosVencidos, error: vencidosError } = await supabase
    .from('alunos')
    .select(`*, treinadores ( nome, plano_atual )`)
    .eq('status_mensalidade', 'pendente')
    .lte('data_vencimento_mensalidade', hojeISO)
    .or(`data_ultima_cobranca_email.is.null,data_ultima_cobranca_email.lt.${seteDiasAtrasISO}`);
  if (vencidosError) throw new Error(`Erro ao buscar Vencidos: ${vencidosError.message}`);
  const alunosVencidosTipados = alunosVencidos as AlunoComTreinador[] | null;
  if (alunosVencidosTipados && alunosVencidosTipados.length > 0) {
    console.log(`\n[📬 JOB COBRANÇA] Encontrados ${alunosVencidosTipados.length} alunos VENCIDOS para notificar.`);
    for (const aluno of alunosVencidosTipados) {
      if (aluno.treinadores?.plano_atual === 'free') {
        console.log(`[⚠️ PLANO FREE] Pulando ${aluno.nome_aluno} - Cobranças não disponíveis no plano gratuito.`);
        continue;
      }
      const emailDetails = criarEmailCobranca(aluno);
      simularEnvioEmail('cobranca', aluno, emailDetails);
        await supabase
          .from('alunos')
          .update({ data_ultima_cobranca_email: new Date().toISOString() })
          .eq('id', aluno.id);
        emailsSimulados++;
        resultados.push({ alunoId: aluno.id, status: 'Simulado (Cobrança Logada)' });
      }
    }
    const { data: alunosProximos, error: proximosError } = await supabase
      .from('alunos')
      .select(`*, treinadores ( nome, plano_atual )`)
      .eq('status_mensalidade', 'pendente')
      .eq('data_vencimento_mensalidade', tresDiasFrenteISO) 
      .is('data_ultima_cobranca_email', null);
    if (proximosError) throw new Error(`Erro ao buscar Próximos: ${proximosError.message}`);
    const alunosProximosTipados = alunosProximos as AlunoComTreinador[] | null;
    if (alunosProximosTipados && alunosProximosTipados.length > 0) {
      console.log(`\n[📬 JOB COBRANÇA] Encontrados ${alunosProximosTipados.length} alunos PRÓXIMOS para notificar.`);
      for (const aluno of alunosProximosTipados) {
        if (aluno.treinadores?.plano_atual === 'free') {
          console.log(`[⚠️ PLANO FREE] Pulando ${aluno.nome_aluno} - Lembretes não disponíveis no plano gratuito.`);
          continue;
        }
        const emailDetails = criarEmailLembrete(aluno);
        simularEnvioEmail('lembrete', aluno, emailDetails);
         await supabase.from('alunos').update({ data_ultima_cobranca_email: new Date().toISOString() }).eq('id', aluno.id);
         emailsSimulados++;
         resultados.push({ alunoId: aluno.id, status: 'Simulado (Lembrete Logado)' });
       }
    }
    if (emailsSimulados === 0) {
      const msg = "✨ Nenhum e-mail a ser simulado hoje.";
      console.log(`\n[📬 JOB COBRANÇA] ${msg}`);
      return res.status(200).json({ 
        status: 'sucesso', 
        mensagem: msg,
        timestamp: new Date().toISOString(),
        ambiente: process.env.NODE_ENV
      });
    }
    const resumo = `✅ Job finalizado com sucesso! ${emailsSimulados} e-mails simulados.`;
    console.log(`\n[📬 JOB COBRANÇA] ${resumo}`);
    res.status(200).json({ 
      status: 'sucesso', 
      mensagem: resumo,
      emails_simulados: emailsSimulados, 
      detalhes: resultados,
      timestamp: new Date().toISOString(),
      ambiente: process.env.NODE_ENV
    });
  } catch (error: any) {
    const errorMsg = `❌ Erro no job de cobrança: ${error.message}`;
    console.error(`\n[📬 JOB COBRANÇA] ${errorMsg}`);
    console.error(error.stack);
    res.status(500).json({ 
      status: 'erro', 
      mensagem: errorMsg,
      timestamp: new Date().toISOString(),
      ambiente: process.env.NODE_ENV
    });
  }
}