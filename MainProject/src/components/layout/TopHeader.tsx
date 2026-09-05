"use client";

import { Bell, Search, Settings } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";

interface TopHeaderProps {
  breadcrumb?: string[];
}

export function TopHeader({ breadcrumb = [] }: TopHeaderProps) {
  const { data: session } = useSession();
  const fullName = session?.user?.name || "User";
  const [firstName = "", lastName = ""] = fullName.split(" ");
  const initials = (firstName[0] || "") + (lastName[0] || "");

  return (
    <header className="flex h-12 items-center gap-3 border-b border-border bg-card px-5 sticky top-0 z-10 shrink-0">
      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span>/</span>}
              <span className={i === breadcrumb.length - 1 ? "text-foreground font-medium" : ""}>{b}</span>
            </span>
          ))}
        </div>
      )}

      <div className="flex-1" />

      {/* Search */}
      <div className="relative w-52">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
        <Input
          placeholder="Search..."
          className="pl-8 h-7 text-xs bg-muted border-border rounded-lg focus-visible:ring-blue-500"
        />
      </div>

      {/* Bell Notification Button */}
      <Link
        href="/notifications"
        className="relative p-1.5 rounded-lg hover:bg-muted/50 transition-colors group flex items-center justify-center"
        title="Notifications"
      >
        <Bell size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-card animate-pulse" />
      </Link>

      {/* Settings */}
      <button className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
        <Settings size={15} className="text-muted-foreground" />
      </button>

      {/* User avatar */}
      <Link href="/settings" className="w-7 h-7 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center outline-none hover:ring-2 hover:ring-blue-500/50 transition-all cursor-pointer">
        {initials}
      </Link>
    </header>
  );
}
