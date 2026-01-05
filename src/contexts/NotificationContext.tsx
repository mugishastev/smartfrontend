import { createContext, useContext, useEffect, useState } from "react";
import { NotificationItem } from "@/lib/types";
import { getNotifications, markNotificationRead } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

type NotificationContextValue = {
  notifications: NotificationItem[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { toast } = useToast();

  const loadNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data ?? []);
    } catch (error: any) {
      console.error("Failed to load notifications", error);
      toast({
        variant: "destructive",
        title: "Notification Error",
        description: error?.message || "Unable to fetch notifications",
      });
    }
  };

  const markRead = async (id: string) => {
    try {
      const response = await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...response.data, read: true } : notification
        )
      );
    } catch (error: any) {
      console.error("Failed to mark notification read", error);
      toast({
        variant: "destructive",
        title: "Notification Error",
        description: error?.message || "Unable to update notification",
      });
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll for updates every minute
    const interval = setInterval(loadNotifications, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const value: NotificationContextValue = {
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    refreshNotifications: loadNotifications,
    markRead,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};

