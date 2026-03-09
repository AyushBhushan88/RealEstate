"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Only Account Managers and Admins
router.get('/financials', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['ADMIN', 'ACCOUNT_MANAGER']), adminController_1.getFinancialSummary);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map