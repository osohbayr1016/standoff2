// Sockets disabled; provide minimal no-op stubs to satisfy imports if any remain
export class SocketManager {
  public broadcast(): void {}
  public getConnectedUsersCount(): number {
    return 0;
  }
  public isUserOnline(): boolean {
    return false;
  }
  public getOnlineUsers(): string[] {
    return [];
  }
}

export default SocketManager;
