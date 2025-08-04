import { Request, Response, NextFunction } from "express";
import { UserRole } from "../models/User";
export interface JWTPayload {
    id: string;
    email: string;
    role: UserRole;
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const requirePlayer: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireOrganization: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map