"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inquiryController_1 = require("../controllers/inquiryController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Optional auth for submitting an inquiry
router.post('/', (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        (0, authMiddleware_1.authenticate)(req, res, next);
    }
    else {
        next();
    }
}, inquiryController_1.createInquiry);
// Agent specific routes
router.get('/my-leads', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['AGENT', 'ADMIN']), inquiryController_1.getAgentInquiries);
router.patch('/:id/status', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['AGENT', 'ADMIN']), inquiryController_1.updateInquiryStatus);
exports.default = router;
//# sourceMappingURL=inquiryRoutes.js.map