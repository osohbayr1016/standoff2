"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRateLimiting = exports.rateLimitConfig = void 0;
exports.rateLimitConfig = {
    general: {
        max: 100,
        timeWindow: "1 minute",
        errorResponseBuilder: (request, context) => {
            return {
                success: false,
                message: "Too many requests, please try again later",
                retryAfter: Math.round(context.ttl / 1000) || 1,
            };
        },
    },
    auth: {
        max: 5,
        timeWindow: "15 minutes",
        errorResponseBuilder: (request, context) => {
            return {
                success: false,
                message: "Too many authentication attempts, please try again later",
                retryAfter: Math.round(context.ttl / 1000) || 1,
            };
        },
    },
    upload: {
        max: 10,
        timeWindow: "1 hour",
        errorResponseBuilder: (request, context) => {
            return {
                success: false,
                message: "Too many upload attempts, please try again later",
                retryAfter: Math.round(context.ttl / 1000) || 1,
            };
        },
    },
    tournamentRegistration: {
        max: 3,
        timeWindow: "1 hour",
        errorResponseBuilder: (request, context) => {
            return {
                success: false,
                message: "Too many tournament registration attempts, please try again later",
                retryAfter: Math.round(context.ttl / 1000) || 1,
            };
        },
    },
    squadCreation: {
        max: 2,
        timeWindow: "1 hour",
        errorResponseBuilder: (request, context) => {
            return {
                success: false,
                message: "Too many squad creation attempts, please try again later",
                retryAfter: Math.round(context.ttl / 1000) || 1,
            };
        },
    },
};
const setupRateLimiting = async (fastify) => {
    await fastify.register(require("@fastify/rate-limit"), {
        global: true,
        ...exports.rateLimitConfig.general,
    });
    fastify.addHook("onRequest", async (request, reply) => {
        const url = request.url;
        const method = request.method;
        if (url.startsWith("/api/auth/")) {
            return;
        }
        if (url.startsWith("/api/upload/")) {
            return;
        }
        if (url.startsWith("/api/tournament-registrations/register")) {
            return;
        }
        if (url.startsWith("/api/squads") && method === "POST") {
            return;
        }
    });
};
exports.setupRateLimiting = setupRateLimiting;
