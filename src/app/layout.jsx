import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import PageLoaderWrapper from "@/components/PageLoaderWrapper";

const geist = Geist({ subsets: ["latin"] });

export const metadata = {
  title: "RumahFilm - By Razan",
  description: "Media server lokal pribadi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
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
        <PageLoaderWrapper />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}