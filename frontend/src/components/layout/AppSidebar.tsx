"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Package, Wallet,
  BookOpen, ArrowRightLeft, CreditCard, PieChart,
  BarChart3, Settings, Building2, ChevronLeft, ChevronRight
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { title: "Dashboard",         icon: LayoutDashboard, url: "/" },
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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-[#1e2a3a] transition-all duration-300 shrink-0",
        collapsed ? "w-[60px]" : "w-[210px]"
      )}
      style={{ borderRight: "1px solid #2d3f55" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[#2d3f55]">
        <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
          <Building2 size={14} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-xs leading-tight tracking-wider">URBAN</p>
            <p className="text-slate-400 text-[9px] uppercase tracking-widest">Furniture</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
          return (
            <Link
              key={item.url}
              href={item.url}
              title={collapsed ? item.title : undefined}
              className={cn(
                "flex items-center gap-3 mx-2 px-3 py-2 rounded-lg mb-0.5 text-slate-400 hover:text-white hover:bg-[#253347] transition-all duration-150 group",
                isActive && "bg-blue-600 text-white hover:bg-blue-600"
              )}
            >
              <item.icon size={15} className="shrink-0" />
              {!collapsed && (
                <span className="text-[12.5px] font-medium truncate">{item.title}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      {!collapsed && (
        <div className="px-3 py-3 border-t border-[#2d3f55]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              MK
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-medium truncate">Mohit Kumar</p>
              <p className="text-slate-500 text-[10px]">Admin</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-[#1e2a3a] border border-[#2d3f55] rounded-full flex items-center justify-center text-slate-400 hover:text-white z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
