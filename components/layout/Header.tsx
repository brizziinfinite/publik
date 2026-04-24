"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import { MobileSidebar } from "@/components/layout/Sidebar";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/posts": "Posts",
  "/dashboard/calendar": "Calendário",
  "/dashboard/brands": "Brands",
  "/dashboard/settings": "Configurações",
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const { theme, setTheme } = useTheme();

  const title = pageTitles[pathname] ?? "Dashboard";
  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "?";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Hambúrguer só aparece em mobile */}
        <MobileSidebar />
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        {/* Toggle dark/light */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/settings")}
              className="cursor-pointer"
            >
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
