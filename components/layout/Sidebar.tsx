"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Image,
  Calendar,
  Palette,
  Settings,
  LogOut,
  ChevronDown,
  Check,
  Plus,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import { useBrands } from "@/lib/hooks/useBrands";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Posts", href: "/dashboard/posts", icon: Image },
  { label: "Calendário", href: "/dashboard/calendar", icon: Calendar },
  { label: "Brands", href: "/dashboard/brands", icon: Palette },
  { label: "Configurações", href: "/dashboard/settings", icon: Settings },
];

function useSidebarLogic() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const activeBrand = useAppStore((s) => s.activeBrand);
  const setActiveBrand = useAppStore((s) => s.setActiveBrand);
  const { brands } = useBrands();

  useEffect(() => {
    if (brands.length === 0) {
      setActiveBrand(null);
      return;
    }
    const stillExists = activeBrand && brands.some((b) => b.id === activeBrand.id);
    if (!stillExists) {
      setActiveBrand(brands[0]);
    }
  }, [brands, activeBrand, setActiveBrand]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return { pathname, router, user, activeBrand, setActiveBrand, brands, handleLogout };
}

interface SidebarContentProps {
  onNavClick?: () => void;
}

export function SidebarContent({ onNavClick }: SidebarContentProps) {
  const { pathname, router, user, activeBrand, setActiveBrand, brands, handleLogout } =
    useSidebarLogic();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center px-6">
        <Link
          href="/dashboard"
          className="text-xl font-bold text-foreground"
          onClick={onNavClick}
        >
          Publik
        </Link>
      </div>

      <Separator />

      {/* Brand selector */}
      <div className="px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm transition-colors hover:bg-muted">
              {activeBrand ? (
                <>
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
                    style={{ backgroundColor: activeBrand.primary_color ?? "#6C5CE7" }}
                  >
                    {activeBrand.name[0].toUpperCase()}
                  </span>
                  <span className="flex-1 truncate text-left font-medium text-foreground">
                    {activeBrand.name}
                  </span>
                </>
              ) : (
                <span className="flex-1 truncate text-left text-muted-foreground">
                  {brands.length === 0 ? "Nenhuma brand" : "Selecionar brand"}
                </span>
              )}
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[216px]" align="start">
            {brands.map((brand) => (
              <DropdownMenuItem
                key={brand.id}
                onClick={() => setActiveBrand(brand)}
                className="cursor-pointer gap-2"
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
                  style={{ backgroundColor: brand.primary_color ?? "#6C5CE7" }}
                >
                  {brand.name[0].toUpperCase()}
                </span>
                <span className="flex-1 truncate">{brand.name}</span>
                {activeBrand?.id === brand.id && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
            {brands.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={() => { router.push("/dashboard/brands"); onNavClick?.(); }}
              className="cursor-pointer gap-2 text-muted-foreground"
            >
              <Plus className="h-4 w-4" />
              Nova brand
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-l-2 border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* User */}
      <div className="p-4">
        <p className="truncate text-xs text-muted-foreground">
          {user?.email ?? "..."}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}

/** Sidebar fixa para desktop (≥ md) */
export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[240px] flex-col border-r border-border bg-sidebar md:flex">
      <SidebarContent />
    </aside>
  );
}

/** Botão hambúrguer + Sheet para mobile (< md) */
export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] p-0 bg-sidebar">
        <SidebarContent onNavClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
