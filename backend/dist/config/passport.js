"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const User_1 = __importDefault(require("../models/User"));
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await User_1.default.findById(id)
            .select("_id email name avatar role isVerified")
            .lean();
        if (user) {
            done(null, { ...user, id: user._id.toString() });
        }
        else {
            done(null, null);
        }
    }
    catch (error) {
        done(error, null);
    }
});
exports.default = passport_1.default;
