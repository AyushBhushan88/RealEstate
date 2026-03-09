"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMedia = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("../lib/cloudinary");
const upload = (0, multer_1.default)({
    storage: cloudinary_1.storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});
exports.uploadMedia = upload.array('files', 10); // Allow up to 10 files
//# sourceMappingURL=uploadMiddleware.js.map