"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  Bell,
  Check,
  CheckCheck,
  Clock,
  Users,
  FileText,
  Award,
  Calendar,
  AlertCircle,
  X,
  Inbox,
  FolderDot,
} from "lucide-react";
import { useNotificationStore } from "@/store/notification-store";
import { Button } from "@/components/ui/button";

interface DBNotification {
  id: string;
  userId: string;
  userRole: string | null;
  title: string | null;
  message: string;
  type: string;
  relatedEntityId: string | null;
  read: boolean;
  status: string;
  createdAt: string; // ISO String from API
  readAt: string | null;
  triggerEvent: string | null;
}

export function NotificationCenter() {
  const { isOpen, setIsOpen, setUnreadCount } = useNotificationStore();
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "archived">("all");
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/notifications?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data.notifications);
          setUnreadCount(data.data.unreadCount);
        }
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch for count
    fetchNotifications();
    
    // Poll every 15 seconds for new notifications (simulating real-time updates)
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [filter]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Update local state
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === id
                ? { ...n, status: "READ", read: true, readAt: new Date().toISOString() }
                : n
            )
          );
          setUnreadCount(data.data.unreadCount);
        }
      }
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications((prev) =>
            prev.map((n) => ({
              ...n,
              status: "READ",
              read: true,
              readAt: n.readAt || new Date().toISOString(),
            }))
          );
          setUnreadCount(data.data.unreadCount);
        }
      }
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/archive`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
          setUnreadCount(data.data.unreadCount);
        }
      }
    } catch (err) {
      console.error("Error archiving notification:", err);
    }
  };

  // Helper to format date
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Helper to choose event icon based on type
  const getEventIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("team")) {
      return <Users className="size-5 text-indigo-400" />;
    }
    if (lowerType.includes("project") || lowerType.includes("week")) {
      return <FolderDot className="size-5 text-emerald-400" />;
    }
    if (lowerType.includes("task") || lowerType.includes("deadline")) {
      return <Calendar className="size-5 text-amber-400" />;
    }
    if (lowerType.includes("submit") || lowerType.includes("submission")) {
      return <FileText className="size-5 text-sky-400" />;
    }
    if (lowerType.includes("eval") || lowerType.includes("score") || lowerType.includes("approve") || lowerType.includes("reject")) {
      return <Award className="size-5 text-purple-400" />;
    }
    return <AlertCircle className="size-5 text-rose-400" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-[420px] flex-col border-l border-white/10 bg-slate-900/90 text-white shadow-2xl backdrop-blur-xl sm:rounded-l-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-2.5">
                <div className="relative rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-2 shadow-md">
                  <Bell className="size-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Notification Center
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">Keep track of your workflow updates</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="size-9 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950/20 border-b border-white/5">
              <div className="flex gap-1.5">
                {(["all", "unread", "archived"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold tracking-wide transition-all ${
                      filter === t
                        ? "bg-indigo-600/90 text-white shadow-sm shadow-indigo-500/20"
                        : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              {filter === "unread" && notifications.length > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <CheckCheck className="size-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
              {isLoading && notifications.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center gap-3">
                  <div className="size-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  <p className="text-xs text-slate-400">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex h-60 flex-col items-center justify-center gap-4 text-center">
                  <div className="rounded-full bg-white/5 p-4 border border-white/5">
                    <Inbox className="size-8 text-slate-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300">All caught up!</h4>
                    <p className="text-xs text-slate-500 max-w-[200px] mt-1">
                      No {filter !== "all" ? filter : ""} notifications at the moment.
                    </p>
                  </div>
                </div>
              ) : (
                notifications.map((n) => {
                  const isUnread = n.status === "UNREAD";
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={n.id}
                      className={`relative flex gap-3.5 rounded-xl border p-4 transition-all duration-300 hover:border-white/15 hover:shadow-lg ${
                        isUnread
                          ? "border-indigo-500/20 bg-indigo-500/[0.04] shadow-[inset_0_0_12px_rgba(99,102,241,0.03)]"
                          : "border-white/5 bg-white/[0.02]"
                      }`}
                    >
                      {/* Left: Event Icon */}
                      <div className="flex h-fit items-center justify-center rounded-xl bg-white/5 p-2.5">
                        {getEventIcon(n.type)}
                      </div>

                      {/* Middle: Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-extrabold uppercase tracking-wide text-indigo-400">
                            {n.type.replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                            <Clock className="size-3" />
                            {formatTimeAgo(n.createdAt)}
                          </span>
                        </div>
                        {n.title && (
                          <h4 className="mt-1 text-sm font-bold tracking-tight text-slate-200">
                            {n.title}
                          </h4>
                        )}
                        <p className="mt-1.5 text-xs text-slate-300 leading-relaxed font-normal">
                          {n.message}
                        </p>

                        {/* Audit Details */}
                        <div className="mt-2.5 flex flex-wrap gap-2 text-[9px] text-slate-500 font-medium border-t border-white/5 pt-2">
                          {n.userRole && (
                            <span className="rounded bg-white/5 px-1.5 py-0.5 uppercase">
                              Role: {n.userRole}
                            </span>
                          )}
                          {n.readAt && (
                            <span className="text-emerald-500 font-semibold">
                              Read: {new Date(n.readAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col gap-1.5 justify-start">
                        {isUnread && (
                          <button
                            onClick={() => handleMarkAsRead(n.id)}
                            title="Mark as Read"
                            className="rounded-full bg-indigo-500/10 p-1.5 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/20"
                          >
                            <Check className="size-3.5" />
                          </button>
                        )}
                        {n.status !== "ARCHIVED" && (
                          <button
                            onClick={() => handleArchive(n.id)}
                            title="Archive"
                            className="rounded-full bg-white/5 p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-all border border-white/5"
                          >
                            <Archive className="size-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Unread dot glow */}
                      {isUnread && (
                        <span className="absolute top-4 right-4 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
