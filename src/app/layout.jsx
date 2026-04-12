import { Geist } from "next/font/google";
import Script from "next/script"; // Wajib di-import
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata = {
  title: "RumahFilm",
  description: "Media server lokal pribadi",
};

export default function RootLayout({ children }) {
  return (
<html lang="id" data-scroll-behavior="smooth" suppressHydrationWarning>     
   <head>
        {/* Gunakan huruf kapital <Script> dengan id dan strategy */}
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            try {
              const theme = localStorage.getItem('theme');
              if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          `}
        </Script>
      </head>
      <body className={`${geist.className} bg-gray-50 dark:bg-[#111113] text-gray-900 dark:text-gray-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}