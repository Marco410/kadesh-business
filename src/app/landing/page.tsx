import { redirect } from "next/navigation";
import { Routes } from "kadesh/core/routes";

/** Legacy /landing redirects to home (main landing). */
export default function LandingPage() {
  redirect(Routes.home);
}
