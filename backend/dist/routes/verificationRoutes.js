"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificationController_1 = require("../controllers/verificationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const router = (0, express_1.Router)();
// User verification routes
router.post('/upload', authMiddleware_1.authenticate, uploadMiddleware_1.default.single('document'), verificationController_1.uploadVerificationDoc);
router.get('/my-docs', authMiddleware_1.authenticate, verificationController_1.getMyDocuments);
// Admin verification management
router.patch('/:id/verify', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['ADMIN']), verificationController_1.verifyDocument);
exports.default = router;
//# sourceMappingURL=verificationRoutes.js.map