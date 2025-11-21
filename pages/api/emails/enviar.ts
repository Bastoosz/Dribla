import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { requireAuth } from '../../../lib/authMiddleware';
import { applyRateLimit } from '../../../lib/rateLimit';
import { validateEmailData, sanitizeHtml } from '../../../lib/sanitize';
import { validateCORS } from '../../../lib/cors';
import { logger } from '../../../lib/logger';
import { 
  checkIPBlock, 
  checkDailyEmailLimit, 
  validateEmailRecipients,
  trackSuspiciousActivity 
} from '../../../lib/antiSpam';

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailData = {
  alunoId: number;
  nomeAluno: string;
  emailResponsavel: string;
  mensagem: string;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const startTime = Date.now();

  if (!checkIPBlock(req, res)) {
    trackSuspiciousActivity(req);
    return;
  }

  // CORS validation - comentado temporariamente para debug
  // if (!validateCORS(req, res)) {
  //   return;
  // }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    logger.info('Iniciando envio de emails', { userId: req.user?.id });

    await applyRateLimit(req, res, {
      windowMs: 60000,
      maxRequests: 10,
    });

    const { emails, treinadorId, nomeEscolinha }: { emails: EmailData[], treinadorId: string, nomeEscolinha: string } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Nenhum email para enviar' });
    }

    const recipientValidation = validateEmailRecipients(emails);
    if (!recipientValidation.valid) {
      trackSuspiciousActivity(req);
      return res.status(400).json({ error: recipientValidation.reason });
    }

    const dailyLimit = await checkDailyEmailLimit(req.user.id, emails.length);
    if (!dailyLimit.allowed) {
      logger.warn('Limite diário excedido', { 
        userId: req.user.id, 
        attempted: emails.length 
      });
      return res.status(429).json({ 
        error: dailyLimit.reason,
        remaining: dailyLimit.remaining,
      });
    }

    if (!treinadorId || !nomeEscolinha) {
      return res.status(400).json({ error: 'Informações do treinador ausentes' });
    }

    if (req.user.id !== treinadorId) {
      trackSuspiciousActivity(req);
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const validatedEmails = emails.map(email => validateEmailData(email));
    
    const emailFrom = 'onboarding@resend.dev';
    const resultados = await Promise.allSettled(
      validatedEmails.map(async (emailData) => {
        if (!emailData.emailResponsavel) {
          throw new Error(`Email não encontrado para ${emailData.nomeAluno}`);
        }

        const safeName = sanitizeHtml(emailData.nomeAluno);
        const safeMessage = sanitizeHtml(emailData.mensagem);
        const safeSchoolName = sanitizeHtml(nomeEscolinha);

        const { data, error } = await resend.emails.send({
          from: `${safeSchoolName} <${emailFrom}>`,
          to: [emailData.emailResponsavel],
          subject: `💚 Mensalidade - ${safeName}`,
          html: `
            <!DOCTYPE html>
            <html lang="pt-BR">
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <title>Mensalidade ${safeSchoolName}</title>
                <!--[if mso]>
                <style type="text/css">
                  body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
                </style>
                <![endif]-->
                <style>
                  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                  
                  * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                  }
                  
                  body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                    line-height: 1.6;
                    color: #1f2937;
                    background: #f3f4f6;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                  }
                  
                  .email-wrapper {
                    max-width: 600px;
                    margin: 0 auto;
                    background: #ffffff;
                  }
                  
                  .header {
                    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                    padding: 40px 30px;
                    text-align: center;
                    border-radius: 0;
                    position: relative;
                    overflow: hidden;
                  }
                  
                  .header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(255,255,255,0.1)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,106.7C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') no-repeat bottom;
                    background-size: cover;
                    opacity: 0.3;
                  }
                  
                  .logo {
                    font-size: 48px;
                    margin-bottom: 10px;
                    position: relative;
                    z-index: 1;
                  }
                  
                  .header h1 {
                    color: #ffffff;
                    font-size: 28px;
                    font-weight: 700;
                    margin: 0;
                    position: relative;
                    z-index: 1;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  }
                  
                  .header p {
                    color: rgba(255,255,255,0.95);
                    font-size: 16px;
                    margin-top: 8px;
                    position: relative;
                    z-index: 1;
                  }
                  
                  .content {
                    padding: 40px 30px;
                    background: #ffffff;
                  }
                  
                  .greeting {
                    font-size: 18px;
                    color: #1f2937;
                    margin-bottom: 20px;
                    font-weight: 600;
                  }
                  
                  .student-info {
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                    border-left: 4px solid #4CAF50;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 25px 0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                  }
                  
                  .student-info p {
                    margin: 0;
                    color: #166534;
                    font-size: 15px;
                  }
                  
                  .student-info strong {
                    color: #15803d;
                    font-weight: 600;
                  }
                  
                  .message-box {
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 25px;
                    margin: 25px 0;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
                  }
                  
                  .message-box p {
                    color: #374151;
                    font-size: 15px;
                    line-height: 1.7;
                    margin: 0;
                  }
                  
                  .divider {
                    height: 1px;
                    background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
                    margin: 30px 0;
                  }
                  
                  .cta-section {
                    text-align: center;
                    margin: 30px 0;
                  }
                  
                  .cta-text {
                    color: #6b7280;
                    font-size: 14px;
                    margin-bottom: 15px;
                  }
                  
                  .footer {
                    background: #f9fafb;
                    padding: 30px;
                    text-align: center;
                    border-top: 1px solid #e5e7eb;
                  }
                  
                  .footer-brand {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 15px;
                    gap: 8px;
                  }
                  
                  .footer-logo {
                    font-size: 24px;
                  }
                  
                  .footer-text {
                    font-size: 16px;
                    font-weight: 600;
                    color: #4CAF50;
                    margin: 0;
                  }
                  
                  .footer p {
                    color: #6b7280;
                    font-size: 13px;
                    margin: 8px 0;
                    line-height: 1.5;
                  }
                  
                  .copyright {
                    color: #9ca3af;
                    font-size: 12px;
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid #e5e7eb;
                  }
                  
                  .social-links {
                    margin-top: 20px;
                  }
                  
                  .social-links a {
                    display: inline-block;
                    width: 36px;
                    height: 36px;
                    margin: 0 8px;
                    background: #ffffff;
                    border-radius: 50%;
                    text-decoration: none;
                    line-height: 36px;
                    color: #4CAF50;
                    border: 1px solid #e5e7eb;
                    transition: all 0.3s ease;
                  }
                  
                  @media only screen and (max-width: 600px) {
                    .email-wrapper {
                      width: 100% !important;
                    }
                    
                    .header {
                      padding: 30px 20px !important;
                    }
                    
                    .header h1 {
                      font-size: 24px !important;
                    }
                    
                    .content {
                      padding: 30px 20px !important;
                    }
                    
                    .footer {
                      padding: 25px 20px !important;
                    }
                  }
                </style>
              </head>
              <body>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #f3f4f6; padding: 20px 0;">
                  <tr>
                    <td align="center">
                      <div class="email-wrapper">
                        <!-- Header -->
                        <div class="header">
                          <div class="logo">⚽</div>
                          <h1>${safeSchoolName}</h1>
                          <p>Gestão de Mensalidades</p>
                        </div>
                        
                        <!-- Content -->
                        <div class="content">
                          <p class="greeting">Olá! 👋</p>
                          
                          <div class="student-info">
                            <p>📋 Referente ao aluno: <strong>${safeName}</strong></p>
                          </div>
                          
                          <div class="message-box">
                            <p>${safeMessage.replace(/\n/g, '<br>')}</p>
                          </div>
                          
                          <div class="divider"></div>
                          
                          <div class="cta-section">
                            <p class="cta-text">Dúvidas? Estamos à disposição para ajudar! 💬</p>
                          </div>
                        </div>
                        
                        <!-- Footer -->
                        <div class="footer">
                          <div class="footer-brand">
                            <span class="footer-logo">🏆</span>
                            <p class="footer-text">Dribla</p>
                          </div>
                          <p>Plataforma completa de gestão para escolinhas de futebol</p>
                          <p style="margin-top: 15px;">Este email foi enviado automaticamente através do sistema Dribla</p>
                          <div class="copyright">
                            <p>&copy; ${new Date().getFullYear()} ${safeSchoolName}. Todos os direitos reservados.</p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
          `,
        });
        if (error) {
          throw error;
        }
        return { alunoId: emailData.alunoId, success: true, data };
      })
    );
    const sucesso = resultados.filter((r) => r.status === 'fulfilled').length;
    const falhas = resultados.filter((r) => r.status === 'rejected').length;
    
    const duration = Date.now() - startTime;
    logger.info(`Emails enviados: ${sucesso} sucesso, ${falhas} falhas`, {
      userId: req.user?.id,
      sucesso,
      falhas,
      duration: `${duration}ms`,
      remaining: dailyLimit.remaining,
    });

    return res.status(200).json({
      success: true,
      message: `${sucesso} email(s) enviado(s) com sucesso${falhas > 0 ? `, ${falhas} falha(s)` : ''}`,
      enviados: sucesso,
      falhas: falhas,
      limiteDiarioRestante: dailyLimit.remaining,
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error('Erro ao enviar emails', {
      error: error.message,
      userId: req.user?.id,
      duration: `${duration}ms`,
    });
    
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export default requireAuth(handler);
