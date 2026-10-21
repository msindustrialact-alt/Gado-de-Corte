import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { BannerInstalarPwa } from "@/components/pwa/banner-instalar-pwa";
import { RegistrarPwa } from "@/components/pwa/registrar-pwa";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Fazendas Joana e Cataguá",
    template: "%s | Fazendas Joana e Cataguá",
  },
  description: "Sistema de gestão pecuária de gado de corte",
  applicationName: "Gado Corte",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gado Corte",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#146C3B",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      style={{ backgroundColor: "#f2f5f3" }}
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col overscroll-none"
        style={{ backgroundColor: "#f2f5f3" }}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Toaster position="top-center" offset="max(12px, env(safe-area-inset-top))" />
          <RegistrarPwa />
          <BannerInstalarPwa />
        </ThemeProvider>
      </body>
    </html>
  );
}
