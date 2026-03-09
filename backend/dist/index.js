"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const propertyRoutes_1 = __importDefault(require("./routes/propertyRoutes"));
const mediaRoutes_1 = __importDefault(require("./routes/mediaRoutes"));
const inquiryRoutes_1 = __importDefault(require("./routes/inquiryRoutes"));
const contractRoutes_1 = __importDefault(require("./routes/contractRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const ownerRoutes_1 = __importDefault(require("./routes/ownerRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const verificationRoutes_1 = __importDefault(require("./routes/verificationRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
// Use raw body for Stripe webhook
app.use('/api/payments/webhook', express_1.default.raw({ type: 'application/json' }));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/properties', propertyRoutes_1.default);
app.use('/api/media', mediaRoutes_1.default);
app.use('/api/inquiries', inquiryRoutes_1.default);
app.use('/api/contracts', contractRoutes_1.default);
app.use('/api/payments', paymentRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/owners', ownerRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/verification', verificationRoutes_1.default);
// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Real Estate Management System API' });
});
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map