import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import * as uploadsController from '../controllers/uploads';

const router = Router();

// All upload routes require authentication
router.use(authenticateToken);

// Upload file
router.post('/', uploadsController.uploadMiddleware, asyncHandler(uploadsController.uploadFile));

// Get file URL (signed URL for S3)
router.get('/:id/url', asyncHandler(uploadsController.getFileUrl));

// Delete file
router.delete('/:id', asyncHandler(uploadsController.deleteFile));

// List user's files
router.get('/', asyncHandler(uploadsController.listFiles));

export default router;
