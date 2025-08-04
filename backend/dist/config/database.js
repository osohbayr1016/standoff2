"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
exports.default = prisma;
//# sourceMappingURL=database.js.map