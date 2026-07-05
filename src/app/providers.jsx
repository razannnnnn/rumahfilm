"use client";

import { ThemeProvider } from "next-themes";
import { Provider as SessionProvider } from "next-auth/client";

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}