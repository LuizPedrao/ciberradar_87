export function onlyDigits(v: string): string {
  return v.replace(/\D/g, "");
}

/** Valida celular/fixo brasileiro (DDD + número), aceitando +55 opcional. Retorna só dígitos sem 55. */
export function normalizeBrPhone(v: string): string | null {
  let d = onlyDigits(v);
  if (d.length >= 12 && d.startsWith("55")) d = d.slice(2);
  if (d.length !== 10 && d.length !== 11) return null;
  const ddd = Number(d.slice(0, 2));
  if (ddd < 11 || ddd > 99) return null;
  if (d.length === 11 && d[2] !== "9") return null;
  return d;
}

export function formatBrPhone(d: string): string {
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return d;
}

/** Número de atendimento no formato internacional (somente dígitos, 10-15). */
export function isValidIntlNumber(v: string | null | undefined): v is string {
  return !!v && /^[0-9]{10,15}$/.test(v);
}

export function buildWhatsAppLink(
  number: string | null | undefined,
  data: { company: string; name: string; score: number; classification: string },
): string | null {
  if (!isValidIntlNumber(number)) return null;
  const msg =
    `Olá! Fiz o diagnóstico no CiberRadar PME e gostaria de receber uma orientação.\n\n` +
    `Empresa: ${data.company}\nNome: ${data.name}\nPontuação: ${data.score}/100\n` +
    `Classificação: ${data.classification}\n\nGostaria de entender os próximos passos.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

/** Link para o administrador abrir conversa com um lead (número BR salvo sem 55). */
export function leadChatLink(whatsapp: string): string {
  return `https://wa.me/55${onlyDigits(whatsapp)}`;
}
