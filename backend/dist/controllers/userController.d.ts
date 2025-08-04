import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const getProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProfile: (req: AuthRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=userController.d.ts.map