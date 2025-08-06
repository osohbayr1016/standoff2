class NotificationService {
  private permission: NotificationPermission = "default";

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    // Check current permission
    this.permission = Notification.permission;

    // Request permission if not granted
    if (this.permission === "default") {
      this.permission = await Notification.requestPermission();
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      return false;
    }

    this.permission = await Notification.requestPermission();
    return this.permission === "granted";
  }

  public async showNotification(
    title: string,
    options: NotificationOptions = {}
  ): Promise<void> {
    if (!("Notification" in window)) {
      return;
    }

    if (this.permission !== "granted") {
      const granted = await this.requestPermission();
      if (!granted) {
        return;
      }
    }

    // Default options
    const defaultOptions: NotificationOptions = {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      requireInteraction: false,
      silent: false,
      tag: "e-sport-connection",
      ...options,
    };

    try {
      const notification = new Notification(title, defaultOptions);

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();

        // You can add custom click handling here
        if (options.data?.url) {
          window.open(options.data.url, "_blank");
        }
      };

      // Auto close after 5 seconds if not requiring interaction
      if (!defaultOptions.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  }

  public async showMessageNotification(
    senderName: string,
    message: string,
    senderId: string
  ): Promise<void> {
    await this.showNotification(`New message from ${senderName}`, {
      body: message,
      icon: "/default-avatar.png",
      badge: "/favicon.ico",
      tag: `message-${senderId}`,
      requireInteraction: false,
      silent: false,
      data: {
        type: "message",
        senderId: senderId,
        url: `/chat/${senderId}`,
      },
    });
  }

  public async showGeneralNotification(
    title: string,
    message: string,
    type: "info" | "success" | "warning" | "error" = "info"
  ): Promise<void> {
    const icons = {
      info: "/info-icon.png",
      success: "/success-icon.png",
      warning: "/warning-icon.png",
      error: "/error-icon.png",
    };

    await this.showNotification(title, {
      body: message,
      icon: icons[type],
      tag: `notification-${type}`,
      requireInteraction: type === "error",
      silent: type === "info",
    });
  }

  public isSupported(): boolean {
    return "Notification" in window;
  }

  public getPermission(): NotificationPermission {
    return this.permission;
  }

  public async isGranted(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    if (this.permission === "default") {
      this.permission = await Notification.requestPermission();
    }

    return this.permission === "granted";
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
