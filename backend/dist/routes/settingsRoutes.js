"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Settings_1 = __importDefault(require("../models/Settings"));
const auth_1 = require("../middleware/auth");
const settingsRoutes = async (fastify) => {
    fastify.get("/", async (request, reply) => {
        try {
            let settings = await Settings_1.default.findOne();
            if (!settings) {
                settings = new Settings_1.default({});
                await settings.save();
            }
            return reply.send({
                success: true,
                settings: {
                    general: {
                        siteName: settings.siteName,
                        siteDescription: settings.siteDescription,
                        contactEmail: settings.contactEmail,
                        maintenanceMode: settings.maintenanceMode,
                    },
                    security: {
                        requireEmailVerification: settings.requireEmailVerification,
                        allowRegistration: settings.allowRegistration,
                        maxLoginAttempts: settings.maxLoginAttempts,
                        sessionTimeout: settings.sessionTimeout,
                    },
                    notifications: {
                        emailNotifications: settings.emailNotifications,
                        pushNotifications: settings.pushNotifications,
                        adminAlerts: settings.adminAlerts,
                    },
                    appearance: {
                        theme: settings.theme,
                        primaryColor: settings.primaryColor,
                        accentColor: settings.accentColor,
                    },
                },
            });
        }
        catch (error) {
            console.error("Error fetching settings:", error);
            return reply.status(500).send({
                success: false,
                message: "Internal server error",
            });
        }
    });
    fastify.put("/", { preHandler: [auth_1.authenticateToken] }, async (request, reply) => {
        try {
            const user = request.user;
            if (user?.role !== "ADMIN") {
                return reply.status(403).send({
                    success: false,
                    message: "Admin only",
                });
            }
            const { general, security, notifications, appearance } = request.body;
            let settings = await Settings_1.default.findOne();
            if (!settings) {
                settings = new Settings_1.default({});
            }
            if (general) {
                if (general.siteName !== undefined)
                    settings.siteName = general.siteName;
                if (general.siteDescription !== undefined)
                    settings.siteDescription = general.siteDescription;
                if (general.contactEmail !== undefined)
                    settings.contactEmail = general.contactEmail;
                if (general.maintenanceMode !== undefined)
                    settings.maintenanceMode = general.maintenanceMode;
            }
            if (security) {
                if (security.requireEmailVerification !== undefined)
                    settings.requireEmailVerification =
                        security.requireEmailVerification;
                if (security.allowRegistration !== undefined)
                    settings.allowRegistration = security.allowRegistration;
                if (security.maxLoginAttempts !== undefined)
                    settings.maxLoginAttempts = security.maxLoginAttempts;
                if (security.sessionTimeout !== undefined)
                    settings.sessionTimeout = security.sessionTimeout;
            }
            if (notifications) {
                if (notifications.emailNotifications !== undefined)
                    settings.emailNotifications = notifications.emailNotifications;
                if (notifications.pushNotifications !== undefined)
                    settings.pushNotifications = notifications.pushNotifications;
                if (notifications.adminAlerts !== undefined)
                    settings.adminAlerts = notifications.adminAlerts;
            }
            if (appearance) {
                if (appearance.theme !== undefined)
                    settings.theme = appearance.theme;
                if (appearance.primaryColor !== undefined)
                    settings.primaryColor = appearance.primaryColor;
                if (appearance.accentColor !== undefined)
                    settings.accentColor = appearance.accentColor;
            }
            await settings.save();
            return reply.send({
                success: true,
                message: "Settings updated successfully",
                settings: {
                    general: {
                        siteName: settings.siteName,
                        siteDescription: settings.siteDescription,
                        contactEmail: settings.contactEmail,
                        maintenanceMode: settings.maintenanceMode,
                    },
                    security: {
                        requireEmailVerification: settings.requireEmailVerification,
                        allowRegistration: settings.allowRegistration,
                        maxLoginAttempts: settings.maxLoginAttempts,
                        sessionTimeout: settings.sessionTimeout,
                    },
                    notifications: {
                        emailNotifications: settings.emailNotifications,
                        pushNotifications: settings.pushNotifications,
                        adminAlerts: settings.adminAlerts,
                    },
                    appearance: {
                        theme: settings.theme,
                        primaryColor: settings.primaryColor,
                        accentColor: settings.accentColor,
                    },
                },
            });
        }
        catch (error) {
            console.error("Error updating settings:", error);
            return reply.status(500).send({
                success: false,
                message: "Internal server error",
            });
        }
    });
};
exports.default = settingsRoutes;
