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
const newsSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["update", "player", "tournament", "winner", "feature"],
        required: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    author: {
        type: String,
        required: true,
        trim: true,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    readTime: {
        type: String,
        required: true,
        trim: true,
    },
    tags: [
        {
            type: String,
            trim: true,
        },
    ],
    publishedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
newsSchema.index({ type: 1 });
newsSchema.index({ category: 1 });
newsSchema.index({ featured: 1 });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ title: "text", description: "text" });
exports.default = mongoose_1.default.model("News", newsSchema);
