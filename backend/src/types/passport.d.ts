import { UserRole } from "../models/User";

declare global {
  namespace Express {
    interface User {
      _id: string;
      id: string;
      email: string;
      name: string;
      avatar?: string;
      role: UserRole;
      isVerified: boolean;
      isOnline?: boolean;
    }
  }
}

export {};
