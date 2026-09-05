"use client";

import { Bell, Search, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopHeaderProps {
  breadcrumb?: string[];
}

export function TopHeader({ breadcrumb = [] }: TopHeaderProps) {
  return (
    <header className="flex h-12 items-center gap-3 border-b border-slate-200 bg-white px-5 sticky top-0 z-10 shrink-0">
      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span>/</span>}
              <span className={i === breadcrumb.length - 1 ? "text-slate-700 font-medium" : ""}>{b}</span>
            </span>
          ))}
        </div>
      )}

      <div className="flex-1" />

      {/* Search */}
      <div className="relative w-52">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
        <Input
          placeholder="Search..."
          className="pl-8 h-7 text-xs bg-slate-50 border-slate-200 rounded-lg focus-visible:ring-blue-500"
        />
      </div>

      {/* Bell */}
      <button className="relative p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
        <Bell size={15} className="text-slate-500" />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
      </button>

      {/* Settings */}
      <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
        <Settings size={15} className="text-slate-500" />
      </button>

      {/* User avatar */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-7 h-7 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
            MK
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs">
            <div>Mohit Kumar</div>
            <div className="font-normal text-slate-400">mohit@example.com</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-xs">Profile</DropdownMenuItem>
          <DropdownMenuItem className="text-xs">Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-xs text-red-500">Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
