import type { Appearance } from "@stripe/stripe-js";

export function getStripeElementsAppearance(
  theme: "light" | "dark",
): Appearance {
  const isDark = theme === "dark";
  return {
    theme: isDark ? "night" : "stripe",
    variables: {
      colorPrimary: "#f97316",
      colorBackground: isDark ? "#1e1e1e" : "#ffffff",
      colorText: isDark ? "#ffffff" : "#212121",
      colorDanger: isDark ? "#f87171" : "#b91c1c",
      fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: "12px",
    },
    rules: {
      ".Input": {
        border: isDark ? "1px solid #3a3a3a" : "1px solid #e0e0e0",
        boxShadow: "none",
      },
    },
  };
}
