import mongoose, { Document } from 'mongoose';
export declare enum MessageStatus {
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    READ = "READ"
}
export interface IMessage extends Document {
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    content: string;
    status: MessageStatus;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IMessage, {}, {}, {}, mongoose.Document<unknown, {}, IMessage, {}, {}> & IMessage & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Message.d.ts.map