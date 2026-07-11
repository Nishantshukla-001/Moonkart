"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, BellRing } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/formatDate";
import type { INotification } from "@/types/notification";

const UNREAD_POLL_MS = 60_000;

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  async function refreshUnreadCount() {
    const res = await fetch("/api/notifications/unread-count", { cache: "no-store" }).catch(() => null);
    if (!res?.ok) return;
    const json = await res.json();
    if (json.success) setUnreadCount(json.data.count);
  }

  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, UNREAD_POLL_MS);
    return () => clearInterval(interval);
  }, []);

  async function handleOpenChange(open: boolean) {
    if (!open || hasLoadedOnce) return;
    setIsLoading(true);
    setHasLoadedOnce(true);
    const res = await fetch("/api/notifications?pageSize=10", { cache: "no-store" }).catch(() => null);
    setIsLoading(false);
    if (!res?.ok) return;
    const json = await res.json();
    if (json.success) {
      setNotifications(json.data.items);
      setUnreadCount(json.data.unreadCount);
    }
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await fetch("/api/notifications/mark-all-read", { method: "PUT" }).catch(() => null);
  }

  async function handleNotificationClick(notification: INotification) {
    if (notification.isRead) return;
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await fetch(`/api/notifications/${notification.id}/read`, { method: "PUT" }).catch(() => null);
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`} className="relative hover:text-blush-hover" />}
      >
        {unreadCount > 0 ? <BellRing /> : <Bell />}
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-blush-hover text-[10px] font-semibold text-text-primary">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-divider px-3.5 py-2.5">
          <p className="font-heading text-sm font-semibold text-text-primary">Notifications</p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs font-medium text-blush-hover hover:text-text-primary"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <p className="p-4 text-center text-sm text-text-muted">Loading...</p>
          ) : notifications.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications yet" description="Order and account updates will show up here." className="py-8" />
          ) : (
            notifications.map((notification) => {
              const content = (
                <div
                  className={cn(
                    "flex flex-col gap-0.5 border-b border-divider px-3.5 py-3 text-left transition-colors last:border-b-0 hover:bg-bg-section",
                    !notification.isRead && "bg-blush-light/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-text-primary">{notification.title}</p>
                    {!notification.isRead && <span className="mt-1 size-2 shrink-0 rounded-full bg-blush-hover" aria-hidden="true" />}
                  </div>
                  <p className="line-clamp-2 text-xs text-text-secondary">{notification.message}</p>
                  <p className="text-[11px] text-text-muted">{formatDate(notification.createdAt)}</p>
                </div>
              );

              return notification.link ? (
                <Link key={notification.id} href={notification.link} onClick={() => handleNotificationClick(notification)}>
                  {content}
                </Link>
              ) : (
                <button
                  key={notification.id}
                  type="button"
                  className="w-full"
                  onClick={() => handleNotificationClick(notification)}
                >
                  {content}
                </button>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
