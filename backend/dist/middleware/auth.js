"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireModerator = exports.requireCoach = exports.requireAdmin = exports.requireOrganization = exports.requirePlayer = exports.requireRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authenticateToken = async (request, reply) => {
    try {
        const authHeader = request.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            reply.status(401).send({
                success: false,
                message: "Authentication token required",
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await User_1.default.findById(decoded.id)
            .select("_id email name avatar role isVerified isOnline")
            .lean();
        if (!user) {
            reply.status(401).send({
                success: false,
                message: "Invalid token - user not found",
            });
            return;
        }
        request.user = {
            _id: user._id.toString(),
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            isVerified: user.isVerified,
            isOnline: user.isOnline,
        };
    }
    catch (error) {
        reply.status(403).send({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (roles) => {
    return async (request, reply) => {
        if (!request.user) {
            reply.status(401).send({
                success: false,
                message: "Authentication required",
            });
            return;
        }
        if (!roles.includes(request.user.role)) {
            reply.status(403).send({
                success: false,
                message: `Access denied. Required roles: ${roles.join(", ")}`,
            });
            return;
        }
    };
};
exports.requireRole = requireRole;
exports.requirePlayer = (0, exports.requireRole)(["PLAYER"]);
exports.requireOrganization = (0, exports.requireRole)(["ORGANIZATION"]);
exports.requireAdmin = (0, exports.requireRole)(["ADMIN"]);
exports.requireCoach = (0, exports.requireRole)(["COACH"]);
exports.requireModerator = (0, exports.requireRole)(["MODERATOR", "ADMIN"]);
