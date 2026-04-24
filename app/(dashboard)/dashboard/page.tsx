"use client";

import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ImageIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Total Posts", value: "0", icon: FileText, color: "text-foreground" },
  { label: "Publicados", value: "0", icon: CheckCircle2, color: "text-green-500" },
  { label: "Agendados", value: "0", icon: Clock, color: "text-yellow-500" },
  { label: "Falhados", value: "0", icon: AlertCircle, color: "text-red-500" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Bem-vindo ao Publik 👋
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie todo o seu conteúdo em um só lugar.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-muted p-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
        <Plus className="h-4 w-4" />
        Criar Post
      </Button>

      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground">
            Nenhum post ainda
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie seu primeiro post para começar.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
