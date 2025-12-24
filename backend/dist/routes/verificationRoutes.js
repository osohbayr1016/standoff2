"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const verificationService_1 = require("../services/verificationService");
const verificationRoutes = async (fastify) => {
    await fastify.register(rate_limit_1.default, {
        max: 3,
        timeWindow: '5 minute',
        errorResponseBuilder: (request, context) => ({
            success: false,
            message: "Too many verification requests. Please wait a few minutes."
        })
    });
    fastify.post("/request", async (request, reply) => {
        try {
            const token = request.headers.authorization?.replace("Bearer ", "");
            if (!token) {
                return reply.status(401).send({ success: false, message: "Authentication required" });
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const { standoff2Id } = request.body;
            if (!standoff2Id) {
                return reply.status(400).send({ success: false, message: "Standoff 2 ID is required" });
            }
            const result = await verificationService_1.VerificationService.requestVerification(decoded.id, standoff2Id);
            if (result.success) {
                return reply.send({
                    success: true,
                    message: result.message,
                    status: result.status
                });
            }
            else {
                return reply.status(400).send({ success: false, message: result.message });
            }
        }
        catch (error) {
            console.error("Verification Request Error:", error);
            return reply.status(500).send({ success: false, message: "Failed to submit verification request" });
        }
    });
    fastify.post("/verify", async (request, reply) => {
        try {
            const token = request.headers.authorization?.replace("Bearer ", "");
            if (!token) {
                return reply.status(401).send({ success: false, message: "Authentication required" });
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const statusData = await verificationService_1.VerificationService.getVerificationStatus(decoded.id);
            if (statusData.status === "VERIFIED") {
                return reply.send({
                    success: true,
                    message: "Account is verified.",
                    isVerified: true
                });
            }
            else {
                return reply.send({
                    success: false,
                    message: `Verification status: ${statusData.status}. Please wait for admin approval.`,
                    status: statusData.status
                });
            }
        }
        catch (error) {
            console.error("Verification Status Check Error:", error);
            return reply.status(500).send({ success: false, message: "An error occurred checking status" });
        }
    });
};
exports.default = verificationRoutes;
