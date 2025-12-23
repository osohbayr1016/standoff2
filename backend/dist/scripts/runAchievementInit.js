#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const initializeAchievements_1 = __importDefault(require("./initializeAchievements"));
dotenv_1.default.config();
(0, initializeAchievements_1.default)()
    .then(() => {
    console.log("✅ Achievement system initialization completed successfully!");
    process.exit(0);
})
    .catch((error) => {
    console.error("❌ Achievement system initialization failed:", error);
    process.exit(1);
});
