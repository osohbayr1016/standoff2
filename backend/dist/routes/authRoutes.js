"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const authRoutes = async (fastify) => {
    fastify.get("/health", async (request, reply) => {
        return {
            success: true,
            message: "Auth routes available",
            timestamp: new Date().toISOString(),
        };
    });
    fastify.post("/login", authController_1.login);
    fastify.post("/register", authController_1.register);
    fastify.get("/me", { preHandler: auth_1.authenticateToken }, authController_1.getCurrentUser);
    fastify.post("/logout", { preHandler: auth_1.authenticateToken }, authController_1.logout);
    fastify.post("/refresh", { preHandler: auth_1.authenticateToken }, authController_1.refreshToken);
};
exports.default = authRoutes;
