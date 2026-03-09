"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contractController_1 = require("../controllers/contractController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authenticate, contractController_1.getMyContracts);
router.post('/', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['AGENT', 'ADMIN']), contractController_1.createContract);
router.get('/:id/pdf', authMiddleware_1.authenticate, contractController_1.downloadContractPDF);
router.post('/:id/sign', authMiddleware_1.authenticate, contractController_1.signContract);
exports.default = router;
//# sourceMappingURL=contractRoutes.js.map