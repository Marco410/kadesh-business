/** Email enmascarado para `UserAuthLog.emailMasked` (sin PII completo). */
export function maskEmailForAuthLog(email: string): string {
  const e = email.trim().toLowerCase();
  const at = e.indexOf("@");
  if (at < 0) return "***";
  const local = e.slice(0, at);
  const domain = e.slice(at + 1);
  if (!local || !domain) return "***";
  return `${local[0]}***@${domain}`;
}

export function safeLogMessage(text: string, max = 500): string {
  const t = text.trim();
  if (!t) return "";
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}
