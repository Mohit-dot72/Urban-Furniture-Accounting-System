"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell, Search, Settings, Sun, Moon, X, Loader2,
  Users, Package, ArrowRightLeft, CreditCard, BookOpen,
  FileText, ArrowRight, CornerDownLeft, Sparkles
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/theme/ThemeProvider";

interface TopHeaderProps {
  breadcrumb?: string[];
}

export function TopHeader({ breadcrumb = [] }: TopHeaderProps) {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fullName = session?.user?.name || "User";
  const [firstName = "", lastName = ""] = fullName.split(" ");
  const initials = ((firstName[0] || "") + (lastName[0] || "")).toUpperCase() || "U";

  // Keyboard shortcut (Ctrl+K or Cmd+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search results from PostgreSQL API
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Global search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = (url: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(url);
  };

  const hasResults = results && (
    (results.navigation?.length || 0) +
    (results.contacts?.length || 0) +
    (results.products?.length || 0) +
    (results.sales?.length || 0) +
    (results.purchases?.length || 0) +
    (results.payments?.length || 0) +
    (results.journalEntries?.length || 0) > 0
  );

  return (
    <header className="flex h-12 items-center gap-3 border-b border-border bg-card px-5 sticky top-0 z-30 shrink-0">
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

      {/* Global Command Search Bar */}
      <div className="relative w-64 md:w-80" ref={containerRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search contacts, orders, products (Ctrl+K)..."
            className="pl-8 pr-14 h-8 text-xs bg-muted/60 border-border rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 font-medium"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery("");
                setResults(null);
              }}
              className="absolute right-2 text-muted-foreground hover:text-foreground"
            >
              <X size={13} />
            </button>
          ) : (
            <kbd className="absolute right-2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-[10px]">Ctrl K</span>
            </kbd>
          )}
        </div>

        {/* Search Results Dropdown Overlay */}
        {isOpen && (query.trim().length > 0 || hasResults) && (
          <div className="absolute top-full mt-1.5 right-0 left-0 md:left-auto md:w-[480px] bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden text-xs max-h-[480px] flex flex-col">
            <div className="p-2.5 bg-muted/40 border-b border-border flex items-center justify-between text-muted-foreground text-[11px]">
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Sparkles size={13} className="text-blue-500" /> PostgreSQL Quick Search
              </span>
              <span>Press ESC to exit</span>
            </div>

            <div className="overflow-y-auto p-2 space-y-3 flex-1">
              {loading ? (
                <div className="p-6 text-center text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin text-blue-500" /> Searching database...
                </div>
              ) : !hasResults ? (
                <div className="p-6 text-center text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">No matches found for &quot;{query}&quot;</p>
                  <p className="text-[11px]">Try searching by customer name, order number, product, or invoice code.</p>
                </div>
              ) : (
                <>
                  {/* Pages Navigation */}
                  {results.navigation?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                        Navigation Pages
                      </p>
                      {results.navigation.map((item: any) => (
                        <div
                          key={item.url}
                          onClick={() => handleSelectResult(item.url)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-muted cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen size={14} className="text-blue-500" />
                            <span className="font-semibold text-foreground">{item.title}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            Go to page <ArrowRight size={10} />
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Contacts */}
                  {results.contacts?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                        Contacts (Customers / Vendors)
                      </p>
                      {results.contacts.map((item: any) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectResult(item.url)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-muted cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-emerald-500" />
                            <div>
                              <p className="font-semibold text-foreground">{item.title}</p>
                              <p className="text-[10px] text-muted-foreground">{item.subtitle}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {item.badge}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Products */}
                  {results.products?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                        Products & Furniture Catalog
                      </p>
                      {results.products.map((item: any) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectResult(item.url)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-muted cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Package size={14} className="text-purple-500" />
                            <div>
                              <p className="font-semibold text-foreground">{item.title}</p>
                              <p className="text-[10px] text-muted-foreground">{item.subtitle}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">
                            {item.badge}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sales */}
                  {results.sales?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                        Sales Orders & Customer Invoices
                      </p>
                      {results.sales.map((item: any) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectResult(item.url)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-muted cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-blue-500" />
                            <div>
                              <p className="font-semibold text-foreground">{item.title}</p>
                              <p className="text-[10px] text-muted-foreground">{item.subtitle}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                            {item.badge}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Purchases */}
                  {results.purchases?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                        Purchase Orders & Vendor Bills
                      </p>
                      {results.purchases.map((item: any) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectResult(item.url)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-muted cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-orange-500" />
                            <div>
                              <p className="font-semibold text-foreground">{item.title}</p>
                              <p className="text-[10px] text-muted-foreground">{item.subtitle}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20">
                            {item.badge}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Payments */}
                  {results.payments?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                        Payments & Bank Receipts
                      </p>
                      {results.payments.map((item: any) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectResult(item.url)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-muted cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <CreditCard size={14} className="text-emerald-500" />
                            <div>
                              <p className="font-semibold text-foreground">{item.title}</p>
                              <p className="text-[10px] text-muted-foreground">{item.subtitle}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {item.badge}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Journal Entries */}
                  {results.journalEntries?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                        Double-Entry Journal Entries
                      </p>
                      {results.journalEntries.map((item: any) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectResult(item.url)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-muted cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <ArrowRightLeft size={14} className="text-indigo-500" />
                            <div>
                              <p className="font-semibold text-foreground">{item.title}</p>
                              <p className="text-[10px] text-muted-foreground">{item.subtitle}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                            {item.badge}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Theme Toggle Button (Light / Dark Backgrounds) */}
      <button
        onClick={toggleTheme}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {theme === "dark" ? (
          <Sun size={16} className="text-amber-400" />
        ) : (
          <Moon size={16} className="text-slate-700" />
        )}
      </button>

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
      <Link href="/settings" className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors" title="Settings">
        <Settings size={15} className="text-muted-foreground hover:text-foreground" />
      </Link>

      {/* User avatar */}
      <Link href="/settings" className="w-7 h-7 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center outline-none hover:ring-2 hover:ring-blue-500/50 transition-all cursor-pointer">
        {initials}
      </Link>
    </header>
  );
}
