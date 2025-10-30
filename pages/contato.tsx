// pages/contato.tsx

import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout'; // Layout principal com sidebar
import { Loader2, Send } from 'lucide-react'; // Ícones

const ContatoPage: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // --- Simulação de Envio ---
    // Aqui você integraria com um serviço de backend ou API de formulário (ex: Formspree, Resend)
    console.log("Simulando envio de contato:", { nome, email, mensagem });

    // Simula um tempo de processamento
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simula sucesso (poderia ter lógica de erro aqui também)
    setLoading(false);
    setSuccess(true);
    // Limpa o formulário após sucesso
    setNome('');
    setEmail('');
    setMensagem('');

    // Remove a mensagem de sucesso após alguns segundos
    setTimeout(() => setSuccess(false), 5000);

    // --- Exemplo de lógica de erro (descomentar para testar) ---
    // setError("Ocorreu um erro ao enviar sua mensagem. Tente novamente.");
    // setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Dribla | Fale Conosco</title>
      </Head>
      <Layout title="Fale Conosco">
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg">
          <h1 className="text-3xl font-bold mb-3 text-white text-center">Entre em Contato</h1>
          <p className="text-gray-400 mb-8 text-center">
            Tem alguma dúvida, sugestão ou precisa de ajuda? Preencha o formulário abaixo.
          </p>

          {success && (
            <div className="mb-6 p-4 bg-dribla-green/20 text-dribla-green rounded-lg border border-dribla-green text-center text-sm">
              Mensagem enviada com sucesso! Entraremos em contato em breve.
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 text-red-400 rounded-lg border border-red-500 text-center text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="nome" className="label-dribla">Seu Nome</label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="input-dribla" // Usa a classe global de input
                placeholder="Como podemos te chamar?"
              />
            </div>

            <div>
              <label htmlFor="email" className="label-dribla">Seu E-mail</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-dribla"
                placeholder="Para respondermos sua mensagem"
              />
            </div>

            <div>
              <label htmlFor="mensagem" className="label-dribla">Sua Mensagem</label>
              <textarea
                id="mensagem"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                required
                rows={5} // Aumenta a altura da caixa de texto
                className="input-dribla"
                placeholder="Conte-nos como podemos ajudar..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              // Usa a classe global de botão primário
              className="w-full btn-primary"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" /> Enviar Mensagem
                </>
              )}
            </button>
          </form>
        </div>
      </Layout>
    </>
  );
};

export default ContatoPage;
