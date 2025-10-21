import { UserRole } from "../models/User";

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      _id: string;
      id: string;
      email: string;
      name: string;
      avatar?: string;
      role: UserRole;
      isVerified: boolean;
      isOnline?: boolean;
    };
  }
}

export {};
