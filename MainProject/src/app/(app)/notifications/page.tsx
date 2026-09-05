"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Bell, Check, CheckCheck, Trash2, ArrowRight,
  AlertTriangle, DollarSign, Package, ShieldAlert,
  Clock, Info, ExternalLink
} from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  details?: string;
  timestamp: string;
  category: "FINANCIAL" | "INVENTORY" | "BUDGET" | "SYSTEM";
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  severity?: "info" | "warning" | "error" | "success";
  referenceCode?: string;
}



export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "FINANCIAL" | "BUDGET" | "INVENTORY" | "SYSTEM">("ALL");
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);

  useEffect(() => {
    async function fetchNotifs() {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifs();
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (selectedNotif?.id === id) {
      setSelectedNotif(null);
    }
  };

  const clearAll = () => {
    setNotifications([]);
    setSelectedNotif(null);
  };

  const openNotificationDetail = (n: NotificationItem) => {
    markAsRead(n.id);
    setSelectedNotif(n);
  };

  const filtered = notifications.filter(n => {
    if (filter === "UNREAD") return !n.read;
    if (filter === "FINANCIAL") return n.category === "FINANCIAL";
    if (filter === "BUDGET") return n.category === "BUDGET";
    if (filter === "INVENTORY") return n.category === "INVENTORY";
    if (filter === "SYSTEM") return n.category === "SYSTEM";
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case "error":
        return { icon: ShieldAlert, bg: "bg-red-500/10 text-red-500 border-red-500/20" };
      case "warning":
        return { icon: AlertTriangle, bg: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
      case "success":
        return { icon: DollarSign, bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
      default:
        return { icon: Info, bg: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-2xl border border-border">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-600/10 text-blue-500 flex items-center justify-center relative shrink-0 border border-blue-500/20">
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-card animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2.5">
              Notifications Center
              {unreadCount > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-semibold border border-blue-500/20">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time financial alerts, overdue invoices, stock warnings & audit logs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button size="sm" variant="outline" onClick={markAllAsRead} className="h-8.5 text-xs gap-1.5 border-border">
              <CheckCheck size={14} /> Mark all as read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button size="sm" variant="ghost" onClick={clearAll} className="h-8.5 text-xs text-muted-foreground hover:text-red-500 gap-1.5">
              <Trash2 size={14} /> Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border pb-3 overflow-x-auto">
        {(["ALL", "UNREAD", "FINANCIAL", "BUDGET", "INVENTORY", "SYSTEM"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all capitalize whitespace-nowrap ${
              filter === t
                ? "bg-blue-600 text-white shadow-sm font-semibold"
                : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {t === "ALL" ? `All (${notifications.length})` : t === "UNREAD" ? `Unread (${unreadCount})` : t}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Bell size={24} />
            </div>
            <p className="text-sm font-semibold text-foreground">No notifications found</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You are all caught up! There are no alerts matching your selected filter.
            </p>
          </div>
        ) : (
          filtered.map((n) => {
            const badge = getSeverityBadge(n.severity);
            const IconComponent = badge.icon;
            return (
              <div
                key={n.id}
                onClick={() => openNotificationDetail(n)}
                className={`group bg-card rounded-xl border p-4 transition-all duration-200 cursor-pointer hover:border-blue-500/50 hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  !n.read ? "border-blue-500/40 bg-blue-500/[0.03]" : "border-border/80 opacity-85"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className={`w-9.5 h-9.5 rounded-xl flex items-center justify-center shrink-0 border ${badge.bg}`}>
                    <IconComponent size={18} />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-sm leading-snug group-hover:text-blue-500 transition-colors ${!n.read ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                        {n.title}
                      </h3>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                      {n.referenceCode && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                          {n.referenceCode}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto sm:ml-0">
                        <Clock size={11} /> {n.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0" onClick={(e) => e.stopPropagation()}>
                  {n.actionUrl && (
                    <Link href={n.actionUrl}>
                      <Button size="sm" variant="outline" className="h-7.5 text-xs gap-1 border-border hover:border-blue-500 hover:text-blue-500">
                        {n.actionLabel || "View"} <ArrowRight size={12} />
                      </Button>
                    </Link>
                  )}
                  {!n.read && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7.5 w-7.5 text-muted-foreground hover:text-blue-500"
                      onClick={() => markAsRead(n.id)}
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7.5 w-7.5 text-muted-foreground hover:text-red-500"
                    onClick={(e) => deleteNotification(n.id, e)}
                    title="Dismiss"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Notification Detail Dialog Modal */}
      <Dialog open={!!selectedNotif} onOpenChange={(open) => !open && setSelectedNotif(null)}>
        {selectedNotif && (
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${getSeverityBadge(selectedNotif.severity).bg}`}>
                  {selectedNotif.category}
                </span>
                {selectedNotif.referenceCode && (
                  <span className="text-xs font-mono text-blue-500">{selectedNotif.referenceCode}</span>
                )}
                <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                  <Clock size={12} /> {selectedNotif.timestamp}
                </span>
              </div>
              <DialogTitle className="text-base font-bold">{selectedNotif.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2 text-sm">
              <div className="p-3.5 bg-muted/50 rounded-xl border border-border space-y-2">
                <p className="text-xs font-medium text-foreground leading-relaxed">
                  {selectedNotif.message}
                </p>
                {selectedNotif.details && (
                  <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/60 pt-2">
                    {selectedNotif.details}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full sm:w-auto text-xs text-red-400 hover:text-red-500"
                onClick={() => deleteNotification(selectedNotif.id)}
              >
                Delete Alert
              </Button>
              <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
                <Button variant="outline" size="sm" onClick={() => setSelectedNotif(null)} className="text-xs">
                  Close
                </Button>
                {selectedNotif.actionUrl && (
                  <Link href={selectedNotif.actionUrl} onClick={() => setSelectedNotif(null)}>
                    <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500">
                      {selectedNotif.actionLabel || "Open Action"} <ExternalLink size={13} />
                    </Button>
                  </Link>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
