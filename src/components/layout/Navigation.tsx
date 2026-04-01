"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Logo from '../shared/Logo';
import Link from 'next/link';
import { Routes } from 'kadesh/core/routes';
import { useUser } from 'kadesh/utils/UserContext';
import { NICHE_TARGET_MAPPING } from 'kadesh/constants/constans';

interface DropdownLink {
  label: string;
  href: string;
  anchor: string | null;
}

interface NicheDropdownLink {
  label: string;
  href: string;
}

const DROPDOWN_LINKS: DropdownLink[] = [
  { label: 'Home', href: Routes.home, anchor: null },
];

const NICHE_DROPDOWN_LINKS: NicheDropdownLink[] = Object.entries(NICHE_TARGET_MAPPING).map(
  ([slug, data]) => ({
    label: data.title,
    href: `/clientes-para-${slug}`,
  })
);

export default function Navigation() {
  const [opened, setOpened] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [nicheDropdownOpen, setNicheDropdownOpen] = useState(false);
  const [nicheMobileOpen, setNicheMobileOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useUser();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const nicheDropdownRef = useRef<HTMLDivElement>(null);
  const avatarDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Si estamos en la página principal y hay un anchor en la URL, hacer scroll a esa sección
    if (pathname === Routes.home && window.location.hash) {
      const hash = window.location.hash;
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (nicheDropdownRef.current && !nicheDropdownRef.current.contains(event.target as Node)) {
        setNicheDropdownOpen(false);
      }
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(event.target as Node)) {
        setAvatarDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, anchor: string | null) => {
    // Si el link tiene un anchor y no estamos en la página principal, redirigir a home con el anchor
    if (anchor && pathname !== Routes.home) {
      e.preventDefault();
      window.location.href = `${Routes.home}${anchor}`;
      return;
    }
    
    // Si estamos en la página principal y es un anchor, hacer scroll suave
    if (anchor && pathname === Routes.home) {
      e.preventDefault();
      const el = document.querySelector(anchor);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    
    setOpened(false);
  };

  const toggleTheme = () => {
    if (!mounted) return;
    const currentTheme = resolvedTheme || theme || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const handleLogout = async () => {
    try {
      // Limpiar token del localStorage
      localStorage.removeItem('keystonejs-session-token');
      
      // Limpiar cookies de sesión
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Limpiar el usuario del contexto
      setUser(undefined);
      
      // Redirigir a home
      router.push(Routes.home);
      setAvatarDropdownOpen(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const isDark = mounted && (resolvedTheme === 'dark');
  const isHomePage = pathname === Routes.home;
  const atTopLight = !scrolled && !isDark && !isHomePage;
  const registerHref = `${Routes.auth.login}?tab=register`;
  const navLinkClass = atTopLight
    ? 'text-gray-800 hover:text-orange-600 transition-colors duration-200'
    : 'text-white hover:text-orange-100 transition-colors duration-200';

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 w-full px-6 sm:px-10 py-4 flex items-center justify-between z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-orange-500/80 dark:bg-[#121212]/70 backdrop-blur-md shadow-lg' 
            : 'bg-transparent'
        }`}
      >
        <Link href={Routes.home} className="flex items-center">
          <Logo size={48} className={atTopLight ? 'invert' : ''} />
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
        
           {/* Inicio Link */}
           <Link
            href={Routes.home}
            className={`font-semibold text-sm ${navLinkClass}`}
          >
            Inicio
          </Link>

          {/* Clientes para Dropdown */}
          <div className="relative" ref={nicheDropdownRef}>
            <button
              onClick={() => setNicheDropdownOpen(!nicheDropdownOpen)}
              className={`font-semibold text-sm flex items-center gap-1 ${navLinkClass}`}
            >
              Clientes para
              <svg
                className={`w-4 h-4 transition-transform ${nicheDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <AnimatePresence>
              {nicheDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-lg py-2 min-w-[260px] max-h-[340px] overflow-y-auto z-50"
                >
                  {NICHE_DROPDOWN_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setNicheDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-[#212121] dark:text-[#ffffff] hover:bg-orange-500/10 dark:hover:bg-white/10 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>


          {/* Contacto Link */}
          <Link
            href={Routes.contact}
            className={`font-semibold text-sm ${navLinkClass}`}
          >
            Contacto
          </Link>

          {/* Contacto Link */}
          {user?.id ? (<Link
            href={Routes.panel}
            className={`font-semibold text-sm ${navLinkClass}`}
          >
            Panel de Control
          </Link>) : null}
          
          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={toggleTheme}
              type="button"
              className={`p-2 rounded-lg transition-colors duration-200 ${atTopLight ? 'text-gray-800 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
              aria-label="Toggle theme"
            >
              {(resolvedTheme || theme) === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          )}

          {/* User Avatar or Login Button */}
          {user?.id ? (
            <div className="relative" ref={avatarDropdownRef}>
              <button
                onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors overflow-hidden ${atTopLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              >
                {user.profileImage?.url ? (
                  <Image
                    src={user.profileImage.url}
                    alt={user.name || 'Usuario'}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <span className={`font-semibold text-sm ${atTopLight ? 'text-gray-800' : 'text-white'}`}>
                    {user.name?.charAt(0) || 'U'}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {avatarDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-2 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-lg py-2 min-w-[180px] z-50"
                  >
                    <Link
                      href={Routes.panel}
                      onClick={() => setAvatarDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-[#212121] dark:text-[#ffffff] hover:bg-orange-500/10 dark:hover:bg-white/10 transition-colors"
                    >
                      Mi perfil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-[#212121] dark:text-[#ffffff] hover:bg-orange-500/10 dark:hover:bg-white/10 transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href={registerHref}
                className={`px-4 py-2 font-semibold text-sm rounded-lg transition-colors duration-200 ${
                  atTopLight
                    ? 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'
                    : 'bg-transparent border border-white/40 text-white hover:bg-white/10'
                }`}
              >
                Registrarse
              </Link>
              <Link
                href={Routes.auth.login}
                className={`px-4 py-2 font-semibold text-sm rounded-lg transition-colors duration-200 ${
                  atTopLight ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                Iniciar Sesión
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Burger Menu */}
        <button
          onClick={() => setOpened(!opened)}
          className={`lg:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 z-50 ${
            atTopLight ? 'text-gray-800' : scrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'
          }`}
          aria-label="Toggle menu"
        >
          <motion.span
            className={`w-6 h-0.5 rounded transition-all ${
              atTopLight ? 'bg-gray-800' : scrolled ? 'bg-gray-700 dark:bg-gray-300' : 'bg-white'
            }`}
            animate={opened ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
          />
          <motion.span
            className={`w-6 h-0.5 rounded transition-all ${
              atTopLight ? 'bg-gray-800' : scrolled ? 'bg-gray-700 dark:bg-gray-300' : 'bg-white'
            }`}
            animate={opened ? { opacity: 0 } : { opacity: 1 }}
          />
          <motion.span
            className={`w-6 h-0.5 rounded transition-all ${
              atTopLight ? 'bg-gray-800' : scrolled ? 'bg-gray-700 dark:bg-gray-300' : 'bg-white'
            }`}
            animate={opened ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
          />
        </button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {opened && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setOpened(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-90 bg-orange-500 dark:bg-[#1a1a1a] z-50 lg:hidden overflow-y-auto shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-white dark:text-white text-2xl font-bold">KADESH</h2>
                  <div className="flex items-center gap-4">
                    {/* Theme Toggle Button Mobile */}
                    {mounted && (
                      <button
                        onClick={toggleTheme}
                        type="button"
                        className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label="Toggle theme"
                      >
                        {(resolvedTheme || theme) === 'dark' ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setOpened(false)}
                      className="text-white text-2xl font-bold"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {/* Inicio Mobile */}
                  <Link
                    href={Routes.home}
                    onClick={() => setOpened(false)}
                    className="text-white font-semibold text-lg no-underline opacity-92 hover:opacity-100 py-4 px-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all"
                  >
                    Inicio
                  </Link>

                  {/* Contacto Link Mobile */}
                  <Link
                    href={Routes.contact}
                    onClick={() => setOpened(false)}
                    className="text-white font-semibold text-lg no-underline opacity-92 hover:opacity-100 py-4 px-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all"
                  >
                    Contacto
                  </Link>

                  {/* Clientes para Mobile Dropdown */}
                  <div>
                    <button
                      onClick={() => setNicheMobileOpen(!nicheMobileOpen)}
                      className="w-full text-left text-white font-semibold text-lg opacity-92 hover:opacity-100 py-4 px-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all flex items-center justify-between"
                    >
                      Clientes para
                      <svg
                        className={`w-5 h-5 transition-transform ${nicheMobileOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {nicheMobileOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 pt-2 flex flex-col gap-2 max-h-[280px] overflow-y-auto">
                            {NICHE_DROPDOWN_LINKS.map((link, index: number) => (
                              <motion.div
                                key={link.href}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                              >
                                <Link
                                  href={link.href}
                                  onClick={() => {
                                    setOpened(false);
                                    setNicheMobileOpen(false);
                                  }}
                                  className="block text-white font-medium text-base opacity-80 hover:opacity-100 py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                                >
                                  {link.label}
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Planes Link Mobile */}
                  {user?.id ? (<Link
                    href={Routes.panel}
                    onClick={() => setOpened(false)}
                    className="text-white font-semibold text-lg no-underline opacity-92 hover:opacity-100 py-4 px-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all"
                  >
                    Panel de Control
                  </Link>) : null}

                  {/* User Avatar or Login Button Mobile */}
                  {user?.id ? (
                    <div className="pt-4 border-t border-white/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 overflow-hidden">
                          {user.profileImage?.url ? (
                            <Image
                              src={user.profileImage.url}
                              alt={user.name || 'Usuario'}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-white font-semibold text-lg">
                              {user.name?.charAt(0) || 'U'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{user.name || 'Usuario'}</p>
                          <p className="text-white/70 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <Link
                        href={Routes.panel}
                        onClick={() => setOpened(false)}
                        className="block text-white font-semibold text-lg opacity-92 hover:opacity-100 py-4 px-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all mb-2"
                      >
                        Mi perfil
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setOpened(false);
                        }}
                        className="w-full text-left text-white font-semibold text-lg opacity-92 hover:opacity-100 py-4 px-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Link
                        href={registerHref}
                        onClick={() => setOpened(false)}
                        className="text-white font-semibold text-lg opacity-92 hover:opacity-100 py-4 px-4 rounded-xl border border-white/35 bg-transparent hover:bg-white/10 transition-all text-center"
                      >
                        Registrarse
                      </Link>
                      <Link
                        href={Routes.auth.login}
                        onClick={() => setOpened(false)}
                        className="text-white font-semibold text-lg opacity-92 hover:opacity-100 py-4 px-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all text-center"
                      >
                        Iniciar Sesión
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

