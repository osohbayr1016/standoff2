"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bountyCoinSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    squadId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Squad",
    },
    balance: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalEarned: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalSpent: {
        type: Number,
        default: 0,
        min: 0,
    },
    transactions: [
        {
            type: {
                type: String,
                enum: ["earn", "spend", "purchase", "withdraw"],
                required: true,
            },
            amount: {
                type: Number,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            tournamentId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Tournament",
            },
            matchId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "TournamentMatch",
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],
}, {
    timestamps: true,
});
bountyCoinSchema.index({ userId: 1 });
bountyCoinSchema.index({ squadId: 1 });
exports.default = (0, mongoose_1.model)("BountyCoin", bountyCoinSchema);
