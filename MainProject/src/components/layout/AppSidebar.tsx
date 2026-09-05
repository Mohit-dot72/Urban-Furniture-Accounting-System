"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Bell, Users, Package, Wallet,
  BookOpen, ArrowRightLeft, CreditCard, PieChart,
  BarChart3, Settings, Building2, ChevronLeft, ChevronRight
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { title: "Dashboard",         icon: LayoutDashboard, url: "/" },
  { title: "Notifications",     icon: Bell,             url: "/notifications" },
  { title: "Contacts",          icon: Users,            url: "/contacts" },
  { title: "Products",          icon: Package,          url: "/products" },
  { title: "Chart of Accounts", icon: Wallet,           url: "/accounts" },
  { title: "Journals",          icon: BookOpen,         url: "/journals" },
  { title: "Journal Entries",   icon: ArrowRightLeft,   url: "/transactions" },
  { title: "Purchases",         icon: Package,          url: "/purchases" },
  { title: "Sales",             icon: Package,          url: "/sales" },
  { title: "Payments",          icon: CreditCard,       url: "/payments" },
  { title: "Budgets",           icon: PieChart,         url: "/budgets" },
  { title: "Reports",           icon: BarChart3,        url: "/reports" },
  { title: "Settings",          icon: Settings,         url: "/settings" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const fullName = session?.user?.name || "Mohit Kumar";
  const [firstName = "", lastName = ""] = fullName.split(" ");
  const initials = ((firstName[0] || "") + (lastName[0] || "")).toUpperCase() || "MK";

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-card text-foreground border-r border-border transition-all duration-300 shrink-0",
        collapsed ? "w-[60px]" : "w-[210px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
          <Building2 size={14} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-foreground font-bold text-xs leading-tight tracking-wider">URBAN</p>
            <p className="text-muted-foreground text-[9px] uppercase tracking-widest font-medium">Furniture</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const isActive = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
          return (
            <Link
              key={item.url}
              href={item.url}
              title={collapsed ? item.title : undefined}
              className={cn(
                "flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-150 group font-medium text-[12.5px]",
                isActive && "bg-blue-600 text-white hover:bg-blue-600 font-semibold shadow-sm hover:text-white"
              )}
            >
              <item.icon size={15} className={cn("shrink-0", isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
              {!collapsed && (
                <span className="truncate">{item.title}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      {!collapsed && (
        <div className="px-3 py-3 border-t border-border">
          <Link href="/settings" className="flex items-center gap-2.5 hover:bg-muted/50 p-1.5 rounded-lg transition-colors">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-foreground text-xs font-medium truncate">{fullName}</p>
              <p className="text-muted-foreground text-[10px]">Admin</p>
            </div>
          </Link>
        </div>
      )}

      {/* Collapse toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-5 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm transition-transform z-20"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
