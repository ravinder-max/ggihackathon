import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { socketService } from "../services/socketService";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Connect to socket when user is authenticated
  useEffect(() => {
    if (!token || !user) {
      socketService.disconnect();
      setIsConnected(false);
      return;
    }

    const socket = socketService.connect(token);
    
    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Notification socket connected");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socketService.disconnect();
    };
  }, [token, user]);

  // Listen for record events
  useEffect(() => {
    if (!isConnected) return;

    // Handle new record notifications (for doctors)
    const handleNewRecord = (data) => {
      console.log("New record notification:", data);
      const notification = {
        id: Date.now(),
        type: "new_record",
        title: "New Medical Record",
        message: data.message,
        data: data,
        timestamp: new Date(),
        read: false
      };
      
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification if permitted
      showBrowserNotification(notification.title, notification.message);
    };

    // Handle record created confirmation (for patients)
    const handleRecordCreated = (data) => {
      console.log("Record created confirmation:", data);
      const notification = {
        id: Date.now(),
        type: "record_created",
        title: "Record Uploaded",
        message: data.message,
        data: data,
        timestamp: new Date(),
        read: false
      };
      
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socketService.on("record:new", handleNewRecord);
    socketService.on("record:created", handleRecordCreated);

    return () => {
      socketService.off("record:new");
      socketService.off("record:created");
    };
  }, [isConnected]);

  // Request browser notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const showBrowserNotification = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/logo.png",
        badge: "/logo.png",
        tag: "medledger-notification"
      });
    }
  };

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  const value = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
