import { io, Socket } from "socket.io-client";
import { WS_BASE_URL } from "../config/api";

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(authToken: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.token = authToken;
    this.socket = io(WS_BASE_URL, {
      auth: { token: authToken },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected");
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.token = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Friend request events
  onFriendRequestReceived(callback: (data: any) => void): void {
    this.socket?.on("friend_request_received", callback);
  }

  onFriendRequestAccepted(callback: (data: any) => void): void {
    this.socket?.on("friend_request_accepted_notification", callback);
  }

  onFriendsListUpdated(callback: () => void): void {
    this.socket?.on("friends_list_updated", callback);
  }

  onFriendStatusChanged(callback: (data: any) => void): void {
    this.socket?.on("friend_status_changed", callback);
  }

  emitFriendRequestSent(receiverId: string, senderData: any): void {
    this.socket?.emit("friend_request_sent", { receiverId, senderData });
  }

  emitFriendRequestAccepted(senderId: string, acceptorData: any): void {
    this.socket?.emit("friend_request_accepted", { senderId, acceptorData });
  }

  // Lobby invite events
  sendLobbyInvite(friendId: string, lobbyData: any): void {
    this.socket?.emit("send_lobby_invite", { friendId, lobbyData });
  }

  onLobbyInviteReceived(callback: (data: any) => void): void {
    this.socket?.on("lobby_invite_received", callback);
  }

  onLobbyInviteSent(callback: (data: any) => void): void {
    this.socket?.on("lobby_invite_sent", callback);
  }

  onLobbyInviteError(callback: (data: any) => void): void {
    this.socket?.on("lobby_invite_error", callback);
  }

  respondToLobbyInvite(
    inviteId: string,
    senderId: string,
    accepted: boolean
  ): void {
    this.socket?.emit("lobby_invite_response", {
      inviteId,
      senderId,
      accepted,
    });
  }

  onLobbyInviteResponded(callback: (data: any) => void): void {
    this.socket?.on("lobby_invite_responded", callback);
  }

  // User status events
  onUserStatusChanged(callback: (data: any) => void): void {
    this.socket?.on("user_status_changed", callback);
  }

  // Cleanup listeners
  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.socket?.removeAllListeners(event);
    } else {
      this.socket?.removeAllListeners();
    }
  }
}

export default new SocketService();

