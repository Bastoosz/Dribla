export function sanitizeString(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>\"']/g, '')
    .trim()
    .substring(0, 500);
}

export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  const sanitized = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    throw new Error('Email inválido');
  }
  
  return sanitized;
}

export function sanitizeNumber(value: any): number {
  const num = Number(value);
  
  if (isNaN(num) || !isFinite(num)) {
    throw new Error('Número inválido');
  }
  
  return num;
}

export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function validateEmailData(data: any) {
  if (!data.alunoId || !data.nomeAluno || !data.emailResponsavel || !data.mensagem) {
    throw new Error('Dados incompletos');
  }
  
  return {
    alunoId: sanitizeNumber(data.alunoId),
    nomeAluno: sanitizeString(data.nomeAluno),
    emailResponsavel: sanitizeEmail(data.emailResponsavel),
    mensagem: sanitizeString(data.mensagem),
  };
}
