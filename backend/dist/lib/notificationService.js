"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = exports.NotificationType = void 0;
const prisma_1 = __importDefault(require("./prisma"));
var NotificationType;
(function (NotificationType) {
    NotificationType["INQUIRY_NEW"] = "INQUIRY_NEW";
    NotificationType["CONTRACT_SIGNED"] = "CONTRACT_SIGNED";
    NotificationType["PAYMENT_RECEIVED"] = "PAYMENT_RECEIVED";
    NotificationType["SYSTEM_ALERT"] = "SYSTEM_ALERT";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
const createNotification = async (params) => {
    try {
        return await prisma_1.default.notification.create({
            data: {
                userId: params.userId,
                type: params.type,
                title: params.title,
                message: params.message,
                link: params.link,
            },
        });
    }
    catch (error) {
        console.error('Error creating notification:', error);
    }
};
exports.createNotification = createNotification;
//# sourceMappingURL=notificationService.js.map