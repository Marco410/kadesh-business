"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Tabs, Tab } from "@heroui/tabs";
import Logo from "kadesh/components/shared/Logo";
import { HugeiconsIcon } from "@hugeicons/react";
import { EyeIcon, ViewOffIcon, StarIcon } from "@hugeicons/core-free-icons";
import {
  useLogin,
  useRegister,
  useGoogleLogin,
} from "../../../components/auth/hooks";

/** Panel visual del sistema: mapa + leads (sin imagen externa). */
function AuthPageVisual() {
  return (
    <div className="absolute inset-0 flex flex-col bg-[#0d0d0d]">
      {/* Mapa de fondo con grid */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage: `
            linear-gradient(rgba(15,15,15,0.97) 0%, transparent 60%),
            repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(60,60,60,0.2) 28px, rgba(60,60,60,0.2) 29px),
            repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(60,60,60,0.2) 28px, rgba(60,60,60,0.2) 29px)
          `,
        }}
      />
      {/* Círculo de radio y pin */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-64 h-64 rounded-full border-2 border-orange-500/60 border-dashed"
          style={{ boxShadow: "0 0 0 4px rgba(247, 148, 94, 0.12)" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full w-6 h-6 rounded-full bg-orange-500 shadow-lg shadow-orange-500/40" />
      </div>
      {/* Overlay con gradiente y texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-[#0d0d0d]/80" />
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-8 text-center">
        <h1 className="text-white/90 text-xl sm:text-xxl font-semibold max-w-sm mb-2">
          Leads B2B desde Google Maps
        </h1>
        <p className="text-white/60 text-sm max-w-xs">
          Elige ubicación, categoría y radio. Los datos se sincronizan con tu CRM.
        </p>
      </div>
      {/* Mini lista de leads de ejemplo */}
      <div className="relative z-10 p-6 pt-0">
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a]/80 backdrop-blur-sm p-4">
          <p className="text-[10px] uppercase tracking-wider text-white/50 mb-2">
            Ejemplo de leads
          </p>
          <ul className="space-y-2">
            {["Bufete Legal García", "Dental Care CDMX", "Bar La Esquina"].map((name, i) => (
              <li
                key={name}
                className="flex items-center justify-between text-xs text-white/80"
              >
                <span className="truncate pr-2">{name}</span>
                <span className="flex items-center gap-1 text-amber-400 shrink-0">
                  <HugeiconsIcon icon={StarIcon} size={12} />
                  4.{i + 2}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || null;
  const referralCodeFromUrl = searchParams.get("referral") || null;
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "register" ? "register" : "login";

  const [selectedTab, setSelectedTab] = useState(initialTab);

  // Sincronizar tab con la URL al cargar (ej. /auth/login?tab=register)
  useEffect(() => {
    if (tabParam === "register") setSelectedTab("register");
    else if (tabParam === "login") setSelectedTab("login");
  }, [tabParam]);

  const updateUrlForTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "register") {
      params.set("tab", "register");
    } else {
      params.delete("tab");
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };
  const [successMessage, setSuccessMessage] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const {
    email: loginEmail,
    setEmail: setLoginEmail,
    password: loginPassword,
    setPassword: setLoginPassword,
    error: loginError,
    loading: loginLoading,
    handleSubmit: handleLogin,
  } = useLogin({ redirectTo: redirectPath });

  const {
    name: registerName,
    setName: setRegisterName,
    lastName: registerLastName,
    setLastName: setRegisterLastName,
    companyName: registerCompanyName,
    setCompanyName: setRegisterCompanyName,
    email: registerEmail,
    setEmail: setRegisterEmail,
    phone: registerPhone,
    setPhone: setRegisterPhone,
    password: registerPassword,
    setPassword: setRegisterPassword,
    confirmPassword: registerConfirmPassword,
    setConfirmPassword: setRegisterConfirmPassword,
    referralCode: registerReferralCode,
    setReferralCode: setRegisterReferralCode,
    error: registerError,
    loading: registerLoading,
    handleSubmit: handleRegister,
  } = useRegister({
    onSuccess: () => {
       if (redirectPath) {
        setSuccessMessage("Registro exitoso. Iniciando sesión...");
      } else {
        setSelectedTab("login");
        setSuccessMessage(
          "Registro exitoso, ya puedes iniciar sesión con tus credenciales",
        );
        updateUrlForTab("login");
      } 
    },
    redirectTo: redirectPath,
    referralCode: referralCodeFromUrl,
  });

  const {
    googleButtonRef,
    loading: googleLoading,
    error: googleError,
    setError: setGoogleError,
  } = useGoogleLogin({ redirectTo: redirectPath, referralCode: referralCodeFromUrl });

  return (
    <div className="min-h-screen flex bg-[#f5f5f5] dark:bg-[#0a0a0a] relative">
      {/* Panel visual del sistema - Mobile: fondo con blur */}
      <div className="lg:hidden fixed inset-0 w-full h-full z-0">
        <AuthPageVisual />
        <div className="absolute inset-0 bg-black/50" aria-hidden />
      </div>

      {/* Panel visual del sistema - Desktop: lado izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden min-h-screen">
        <AuthPageVisual />
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 relative z-10 bg-gradient-to-b from-orange-300 to-orange-50/70 dark:bg-transparent">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <Logo size={72} />
          </div>

          {/* Card Container */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-lg dark:shadow-2xl p-6 sm:p-8 border border-[#e0e0e0] dark:border-[#3a3a3a]">
            {/* Tabs */}
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={(key) => {
                const tab = key as string;
                setSelectedTab(tab);
                setSuccessMessage("");
                setGoogleError("");
                updateUrlForTab(tab);
              }}
              className="w-full"
              classNames={{
                tabList:
                  "w-full bg-[#f5f5f5] dark:bg-[#2a2a2a] rounded-lg p-1 gap-1",
                tab: "flex-1 text-sm font-semibold rounded-md transition-all duration-200 data-[selected=true]:bg-orange-500 dark:data-[selected=true]:bg-orange-500 data-[selected=true]:text-white dark:data-[selected=true]:text-white data-[hover=true]:bg-[#e8e8e8] dark:data-[hover=true]:bg-[#353535] data-[selected=false]:text-[#616161] dark:data-[selected=false]:text-[#b0b0b0]",
                tabContent:
                  "data-[selected=true]:!text-white dark:data-[selected=true]:!text-white data-[selected=false]:text-[#616161] dark:data-[selected=false]:text-[#b0b0b0]",
                panel: "mt-6",
              }}
            >
              <Tab key="login" title="Iniciar Sesión">
                <form
                  onSubmit={(e) => {
                    setSuccessMessage("");
                    setGoogleError("");
                    handleLogin(e, loginEmail, loginPassword);
                  }}
                  className="space-y-5"
                >
                  {successMessage && (
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm font-medium">
                      {successMessage}
                    </div>
                  )}
                  {loginError && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium">
                      {loginError}
                    </div>
                  )}
                  {googleError && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium">
                      {googleError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label
                      htmlFor="login-email"
                      className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]"
                    >
                      Correo electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      placeholder="tu@kadesh.com.mx"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="login-password"
                      className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]"
                    >
                      Contraseña <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowLoginPassword((prev) => !prev)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-[#ffffff] hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e]"
                        aria-label={
                          showLoginPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        <HugeiconsIcon
                          icon={showLoginPassword ? ViewOffIcon : EyeIcon}
                          className="size-5"
                        />
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-semibold text-base h-12 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-orange-500 dark:disabled:hover:bg-orange-500"
                  >
                    {loginLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Iniciando sesión...</span>
                      </>
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </button>

                  {/* <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#e0e0e0] dark:border-[#3a3a3a]"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-[#1e1e1e] text-[#616161] dark:text-[#b0b0b0]">
                        O continúa con
                      </span>
                    </div>
                  </div>

                  <div
                    ref={googleButtonRef}
                    className="w-full min-h-[48px] flex items-center justify-center rounded-xl overflow-hidden [&>div]:!w-full [&>div]:!justify-center [&>div]:!min-h-[48px]"
                    aria-label="Continuar con Google"
                  />
                  {googleLoading && (
                    <p className="text-center text-sm text-[#616161] dark:text-[#b0b0b0]">
                      Conectando con Google...
                    </p>
                  )} */}
                </form>
              </Tab>

              <Tab key="register" title="Registrarse">
                <form onSubmit={handleRegister} className="space-y-5">
                  {registerError && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium">
                      {registerError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="register-name"
                        className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]"
                      >
                        Nombre <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="register-name"
                        type="text"
                        placeholder="Antonio"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="register-lastname"
                        className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]"
                      >
                        Apellido paterno <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="register-lastname"
                        type="text"
                        placeholder="Pérez"
                        value={registerLastName}
                        onChange={(e) => setRegisterLastName(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="register-company-name"
                      className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]"
                    >
                      Nombre de negocio <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="register-company-name"
                      type="text"
                      placeholder="Mi Empresa S.A. de C.V."
                      value={registerCompanyName}
                      onChange={(e) => setRegisterCompanyName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="register-email"
                      className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]"
                    >
                      Correo electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="register-email"
                      type="email"
                      placeholder="tu@kadesh.com.mx"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="register-phone"
                      className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]"
                    >
                      Teléfono
                    </label>
                    <input
                      id="register-phone"
                      type="tel"
                      placeholder="+52 55 1234 5678 (opcional)"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="register-referral"
                      className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]"
                    >
                      Código de referido
                    </label>
                    <input
                      id="register-referral"
                      type="text"
                      placeholder="Ej: KBC124 (opcional)"
                      value={registerReferralCode ?? ""}
                      onChange={(e) => setRegisterReferralCode(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="register-password"
                        className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]"
                      >
                        Contraseña <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="register-confirm-password"
                        className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]"
                      >
                        Confirmar contraseña{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="register-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerConfirmPassword}
                        onChange={(e) =>
                          setRegisterConfirmPassword(e.target.value)
                        }
                        required
                        className="w-full px-4 py-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-semibold text-base h-12 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-orange-500 dark:disabled:hover:bg-orange-500"
                  >
                    {registerLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Registrando...</span>
                      </>
                    ) : (
                      "Registrarse"
                    )}
                  </button>

                 {/* <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#e0e0e0] dark:border-[#3a3a3a]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3  text-[#616161] dark:text-[#b0b0b0] font-medium">
                      O continúa con
                    </span>
                  </div>
                </div>

                <div
                    ref={googleButtonRef}
                    className="w-full min-h-[48px] flex items-center justify-center rounded-xl overflow-hidden [&>div]:!w-full [&>div]:!justify-center [&>div]:!min-h-[48px]"
                    aria-label="Continuar con Google"
                  />
                  {googleLoading && (
                    <p className="text-center text-sm text-[#616161] dark:text-[#b0b0b0]">
                      Conectando con Google...
                    </p>
                  )}
                  {googleError && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium">
                      {googleError}
                    </div>
                  )} */}
                </form>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginPageFallback() {
  return (
    <div className="min-h-screen flex bg-[#f5f5f5] dark:bg-[#0a0a0a] relative items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
