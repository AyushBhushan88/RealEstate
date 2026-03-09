"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = void 0;
const prisma_1 = __importDefault(require("./prisma"));
const createAuditLog = async (data) => {
    try {
        return await prisma_1.default.auditLog.create({
            data: {
                userId: data.userId,
                action: data.action,
                entity: data.entity,
                entityId: data.entityId,
                details: data.details,
                ipAddress: data.ipAddress
            }
        });
    }
    catch (error) {
        console.error('Audit log failed:', error);
    }
};
exports.createAuditLog = createAuditLog;
//# sourceMappingURL=auditService.js.map