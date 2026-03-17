import { redirect } from "next/navigation";

/**
 * Registro: redirige al formulario de login con la pestaña "Registrarse".
 * La URL canónica para registro es /auth/register (no ?tab=register).
 */
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; referral?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect ? `&redirect=${encodeURIComponent(params.redirect)}` : "";
  const referral = params.referral ? `&referral=${encodeURIComponent(params.referral)}` : "";
  redirect(`/auth/login?tab=register${redirectTo}${referral}`);
}
