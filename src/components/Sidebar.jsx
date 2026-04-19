"use client";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";



const navItems = [
  {
    label: "Beranda",
    href: "/",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    label: "Request Film",
    href: "/request",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  // Tutup sidebar saat route berubah
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    setDark(isDark);
  };

  const sidebarContent = (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        width: "224px",
        minWidth: "224px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
      className="border-r border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#18181b]"
    >
      {/* Logo */}
      <div
        className="border-b border-gray-200 dark:border-white/[0.06]"
        style={{ padding: "0 20px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}
      >
        <Link href="/" className="text-base font-semibold tracking-tight">
          Rumah<span className="text-[#86efac]">Film</span>
        </Link>
        {/* Tombol tutup — hanya di mobile */}
        <button
          onClick={() => setOpen(false)}
          className="md:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Status */}
      <div
        className="border-b border-gray-200 dark:border-white/[0.06]"
        style={{ padding: "12px 20px", flexShrink: 0 }}
      >
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span
            className="bg-[#86efac]"
            style={{ width: "6px", height: "6px", borderRadius: "50%", display: "inline-block" }}
          />
          LAN Server aktif
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
        <p
          className="text-gray-400 dark:text-gray-600 uppercase"
          style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.1em", padding: "0 8px", marginBottom: "8px" }}
        >
          Menu
        </p>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  marginBottom: "2px",
                  border: active ? "1px solid rgba(134,239,172,0.3)" : "1px solid transparent",
                  background: active ? "rgba(134,239,172,0.1)" : "transparent",
                  color: active ? (dark ? "#86efac" : "#16a34a") : "",
                  fontWeight: active ? 500 : 400,
                  transition: "all 0.15s",
                  cursor: "pointer",
                }}
                className={active ? "" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}
              >
                {item.icon}
                {item.label}
              </div>
            </Link>
          );
        })}
        {isAdmin && (
  <>
    <p className="text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-widest px-2 mb-2 mt-4">
      Admin
    </p>
    <Link href="/admin/requests">
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 ...">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        Kelola Request
      </div>
    </Link>
    <Link href="/monitor">
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition-all duration-150 border border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        Monitoring
      </div>
    </Link>
    <Link href="/explorer">
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition-all duration-150 border border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
        </svg>
        File Manager
      </div>
    </Link>
  </>
        )}
      </nav>

      {/* Dark mode toggle */}
      <div
        className="border-t border-gray-200 dark:border-white/[0.06]"
        style={{ padding: "16px 20px", flexShrink: 0 }}
      >
        <button
          onClick={toggleTheme}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {dark ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
            <span>{dark ? "Light Mode" : "Dark Mode"}</span>
          </div>
          <div style={{
            width: "36px", height: "20px", borderRadius: "999px",
            border: dark ? "1px solid rgba(134,239,172,0.4)" : "1px solid #d1d5db",
            background: dark ? "rgba(134,239,172,0.2)" : "#e5e7eb",
            display: "flex", alignItems: "center", padding: "0 2px",
            transition: "all 0.2s"
          }}>
            <div style={{
              width: "16px", height: "16px", borderRadius: "50%",
              background: dark ? "#86efac" : "#fff",
              border: dark ? "none" : "1px solid #d1d5db",
              transform: dark ? "translateX(16px)" : "translateX(0)",
              transition: "transform 0.2s"
            }} />
          </div>
        </button>
      </div>

      {session && (
  <div className="px-5 pb-4 border-t border-gray-200 dark:border-white/[0.06] pt-3">
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-full flex items-center gap-2.5 text-sm text-red-400 hover:text-red-300 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
      </svg>
      Logout
    </button>
  </div>
)}
    </motion.aside>
  );

  return (
    <>
      {/* Tombol hamburger — hanya di mobile */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 w-9 h-9 rounded-lg bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/[0.06] flex items-center justify-center text-gray-500 dark:text-gray-400 shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop — sidebar biasa */}
      <div className="hidden md:block sticky top-0 h-screen flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile — overlay + drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden fixed top-0 left-0 z-50 h-screen"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}