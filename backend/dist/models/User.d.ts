import mongoose, { Document } from 'mongoose';
export declare enum UserRole {
    PLAYER = "PLAYER",
    COACH = "COACH",
    ORGANIZATION = "ORGANIZATION",
    ADMIN = "ADMIN"
}
export interface IUser extends Document {
    email: string;
    name?: string;
    avatar?: string;
    bio?: string;
    gameExpertise?: string;
    hourlyRate?: number;
    rating: number;
    totalReviews: number;
    isVerified: boolean;
    isOnline: boolean;
    lastSeen: Date;
    googleId?: string;
    facebookId?: string;
    password?: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map