import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
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