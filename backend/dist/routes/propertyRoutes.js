"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const propertyController_1 = require("../controllers/propertyController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', propertyController_1.getProperties);
router.get('/:id', propertyController_1.getPropertyById);
// Protected routes (Only Agents and Admins can create/manage properties)
router.post('/', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['AGENT', 'ADMIN']), propertyController_1.createProperty);
router.patch('/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['AGENT', 'ADMIN']), propertyController_1.updateProperty);
router.delete('/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['AGENT', 'ADMIN']), propertyController_1.deleteProperty);
exports.default = router;
//# sourceMappingURL=propertyRoutes.js.map