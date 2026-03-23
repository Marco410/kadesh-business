export type RegisterPasswordStrength = "empty" | "weak" | "medium" | "strong";

export interface RegisterPasswordStrengthResult {
  level: RegisterPasswordStrength;
  label: string;
  hint: string;
  filled: number;
  barClass: string;
}

/**
 * Heurística de fortaleza para el registro (3 niveles + vacío).
 * No sustituye validación en servidor.
 */
export function getRegisterPasswordStrength(
  password: string,
): RegisterPasswordStrengthResult {
  if (!password) {
    return {
      level: "empty",
      label: "",
      hint: "",
      filled: 0,
      barClass: "bg-[#e0e0e0] dark:bg-[#3a3a3a]",
    };
  }
  const len = password.length;
  const hasUpper = /[A-ZÁÉÍÓÚÑ]/.test(password);
  const hasNum = /\d/.test(password);
  const hasSym = /[^A-Za-z0-9áéíóúñÁÉÍÓÚÑ]/.test(password);

  if (len < 8) {
    return {
      level: "weak",
      label: "Débil",
      hint: "Usa al menos 8 caracteres.",
      filled: 1,
      barClass: "bg-red-500",
    };
  }

  const strong = hasUpper && hasNum && hasSym && len >= 8;
  if (strong) {
    return {
      level: "strong",
      label: "Fuerte",
      hint: "Buena contraseña.",
      filled: 3,
      barClass: "bg-emerald-500",
    };
  }

  const missing: string[] = [];
  if (!hasUpper) missing.push("mayúsculas");
  if (!hasNum) missing.push("números");
  if (!hasSym) missing.push("símbolos");
  const hint =
    missing.length > 0
      ? `Agrega ${missing.slice(0, 2).join(" y ")}.`
      : "Combina letras, números y símbolos.";

  return {
    level: "medium",
    label: "Media",
    hint,
    filled: 2,
    barClass: "bg-amber-500",
  };
}
