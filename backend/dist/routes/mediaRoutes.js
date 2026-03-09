"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mediaController_1 = require("../controllers/mediaController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const router = (0, express_1.Router)();
// Protected routes (Only Agents and Admins can manage property media)
router.post('/upload', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['AGENT', 'ADMIN']), uploadMiddleware_1.uploadMedia, mediaController_1.uploadPropertyMedia);
router.delete('/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['AGENT', 'ADMIN']), mediaController_1.deleteMedia);
exports.default = router;
//# sourceMappingURL=mediaRoutes.js.map