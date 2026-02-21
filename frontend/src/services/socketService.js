import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  on(event, callback) {
    if (!this.socket) {
      console.warn("Socket not connected");
      return;
    }
    
    this.socket.on(event, callback);
    this.listeners.set(event, callback);
  }

  off(event) {
    if (!this.socket) return;
    
    const callback = this.listeners.get(event);
    if (callback) {
      this.socket.off(event, callback);
      this.listeners.delete(event);
    }
  }

  emit(event, data) {
    if (!this.socket) {
      console.warn("Socket not connected");
      return;
    }
    this.socket.emit(event, data);
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;
