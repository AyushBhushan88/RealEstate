import multer from 'multer';
import { storage } from '../lib/cloudinary';

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

export const uploadMedia = upload.array('files', 10); // Allow up to 10 files
