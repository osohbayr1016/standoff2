"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const withdrawRequestSchema = new mongoose_1.Schema({
    squadId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Squad",
        required: true,
        index: true,
    },
    requestedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    amountCoins: {
        type: Number,
        required: true,
        min: 1,
    },
    amountMNT: {
        type: Number,
        required: true,
        min: 1,
    },
    bankName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
    },
    iban: {
        type: String,
        required: true,
        trim: true,
        maxlength: 64,
    },
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED", "PAID"],
        default: "PENDING",
        index: true,
    },
    adminNotes: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    processedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    processedAt: {
        type: Date,
    },
    paidBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    paidAt: {
        type: Date,
    },
}, { timestamps: true });
withdrawRequestSchema.index({ status: 1, createdAt: -1 });
exports.default = mongoose_1.default.model("WithdrawRequest", withdrawRequestSchema);
