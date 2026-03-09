"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ownerController_1 = require("../controllers/ownerController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Only Owners and Admins can access owner stats
router.get('/stats', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['OWNER', 'ADMIN']), ownerController_1.getOwnerStats);
exports.default = router;
//# sourceMappingURL=ownerRoutes.js.map