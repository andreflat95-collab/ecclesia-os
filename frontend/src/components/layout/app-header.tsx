"use client";

import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/members": "Membros",
  "/ministries": "Ministérios",
  "/visitors": "Visitantes",
  "/communications": "Comunicações",
  "/roles": "Permissões",
};

export function AppHeader() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || "EcclesiaOS";
  const { setTheme, theme } = useTheme();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card/50 px-6 backdrop-blur-sm">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>

      <div className="ml-auto flex items-center gap-3">
        <Avatar className="size-8 cursor-pointer ring-2 ring-border">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            AD
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
