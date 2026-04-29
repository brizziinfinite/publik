import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageTransition } from "@/components/providers/PageTransition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar fixa — só visível em md+ */}
      <Sidebar />
      {/* Conteúdo principal — margem só em md+ */}
      <div className="flex flex-1 flex-col md:ml-[240px]">
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-hidden">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
