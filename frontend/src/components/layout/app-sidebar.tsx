"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Church,
  UserPlus,
  Shield,
  MessageSquare,
  Calendar,
  QrCode,
  Camera,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Membros", href: "/members", icon: Users },
  { title: "Ministérios", href: "/ministries", icon: Church },
  { title: "Visitantes", href: "/visitors", icon: UserPlus },
  { title: "Programações", href: "/events", icon: Calendar },
  { title: "Comunicações", href: "/communications", icon: MessageSquare },
  { title: "QR Code", href: "/qrcode", icon: QrCode },
  { title: "Galeria", href: "/gallery", icon: Camera },
  { title: "Permissões", href: "/roles", icon: Shield },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-border px-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
          <Church className="size-4 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-none min-w-0">
            <span className="text-sm font-semibold truncate">EcclesiaOS</span>
            <span className="text-[10px] text-muted-foreground">Gestão Eclesiástica</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent"
        >
          {collapsed ? (
            <ChevronRight className="size-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="size-4 shrink-0" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
