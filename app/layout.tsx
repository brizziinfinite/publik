import type { Metadata } from "next";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Publik — Gerencie suas redes sociais",
  description: "Plataforma de gerenciamento de conteúdo para redes sociais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body>
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
