import type { Metadata } from "next";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Publik — Gerencie suas redes sociais",
    template: "%s | Publik",
  },
  description:
    "Crie, agende e publique conteúdo em todas as suas redes sociais em um só lugar.",
  keywords: ["social media", "agendamento", "instagram", "tiktok", "marketing", "conteúdo"],
  authors: [{ name: "Publik" }],
  creator: "Publik",
  metadataBase: new URL("https://publik.app"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://publik.app",
    title: "Publik — Gerencie suas redes sociais",
    description:
      "Crie, agende e publique conteúdo em todas as suas redes sociais em um só lugar.",
    siteName: "Publik",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Publik — Gerencie suas redes sociais",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Publik — Gerencie suas redes sociais",
    description:
      "Crie, agende e publique conteúdo em todas as suas redes sociais em um só lugar.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SupabaseProvider>{children}</SupabaseProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
