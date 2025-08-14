import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CNAB Fácil - Conversor de Planilhas para CNAB 240",
  description: "Plataforma gratuita para converter planilhas Excel em arquivos CNAB 240. Solução simples e segura para remessas bancárias de pequenas e médias empresas.",
  keywords: "CNAB, CNAB 240, conversor, planilha Excel, remessa bancária, cobrança, boleto, automação bancária, pequenas empresas, PME",
  authors: [{ name: "Jonas Leite" }],
  creator: "CNAB Fácil",
  publisher: "CNAB Fácil",
  robots: "index, follow",
  openGraph: {
    title: "CNAB Fácil - Conversor de Planilhas para CNAB 240",
    description: "Converta suas planilhas Excel em arquivos CNAB 240 de forma rápida, segura e gratuita. Ideal para pequenas e médias empresas.",
    url: "https://cnab-facil.com",
    siteName: "CNAB Fácil",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "CNAB Fácil - Conversor de Planilhas para CNAB 240",
    description: "Converta suas planilhas Excel em arquivos CNAB 240 de forma rápida, segura e gratuita.",
    creator: "@cnabfacil",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#9333ea",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
