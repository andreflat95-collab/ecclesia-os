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
  MessageCircle,
  MapPin,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Membros", href: "/members", icon: Users },
  { title: "Ministérios", href: "/ministries", icon: Church },
  { title: "Visitantes", href: "/visitors", icon: UserPlus },
  { title: "Pequenos Grupos", href: "/cells", icon: Home },
  { title: "Programações", href: "/events", icon: Calendar },
  { title: "Comunicações", href: "/communications", icon: MessageSquare },
  { title: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
  { title: "Lazer", href: "/venues", icon: MapPin },
  { title: "Galeria", href: "/gallery", icon: Camera },
  { title: "Permissões", href: "/roles", icon: Shield },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-sidebar-border bg-gradient-to-b from-[#08061a] to-[#060418] transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#c9a03c]/10 overflow-hidden">
          <img src="/logo.png" alt="Vida Por Vidas" className="size-7 object-contain" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-none min-w-0">
            <span className="text-sm font-bold text-[#c9a03c] tracking-wide">VIDA POR VIDAS</span>
            <span className="text-[10px] text-sidebar-foreground">Church CRM</span>
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
                      ? "bg-[#c9a03c]/15 text-[#c9a03c] border-l-2 border-[#c9a03c]"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
