import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import STBStatus from "@/components/STBStatus";

const geist = Geist({ subsets: ["latin"] });

export const metadata = {
  title: "RumahFilm - By Razan",
  description: "Media server lokal pribadi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#86efac" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="RumahFilm" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
        
      </head>
      <body className={`${geist.className} bg-gray-50 dark:bg-[#111113] text-gray-900 dark:text-gray-100 antialiased`}>
        <Providers>
          <STBStatus />
          {children}
        </Providers>
      </body>
    </html>
  );
}