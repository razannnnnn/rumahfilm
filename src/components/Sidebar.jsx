"use client";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    label: "Monitoring Usage",
    href: "/monitor",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
      </svg>
    ),
  },
  {
  label: "Explorer",
  href: "/explorer",
  icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
    </svg>
  ),
},
];

export default function Sidebar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);

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