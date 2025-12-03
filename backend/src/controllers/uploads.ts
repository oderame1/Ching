import { Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import * as storageService from '../services/storage';
import { prisma } from '../utils/db';
import { logger } from '../utils/logger';
import { AppError, ERROR_CODES } from '@escrow/shared';

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});

export const uploadMiddleware = upload.single('file');

// Upload file
export const uploadFile = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'No file provided', 400);
        }

        const { escrowId } = req.body;
        const userId = (req as any).user.userId;

        // Verify escrow exists and user has access
        if (escrowId) {
            const escrow = await prisma.escrow.findUnique({
                where: { id: escrowId },
            });

            if (!escrow) {
                throw new AppError(ERROR_CODES.NOT_FOUND, 'Escrow not found', 404);
            }

            if (escrow.buyerId !== userId && escrow.sellerId !== userId) {
                throw new AppError(ERROR_CODES.FORBIDDEN, 'You do not have access to this escrow', 403);
            }
        }

        // Upload file
        const result = await storageService.uploadFile({
            file: req.file.buffer,
            filename: req.file.originalname,
            contentType: req.file.mimetype,
            folder: escrowId ? `escrow/${escrowId}` : 'general',
        });

        // Save file record in database
        const fileRecord = await prisma.fileUpload.create({
            data: {
                userId,
                escrowId: escrowId || null,
                filename: req.file.originalname,
                fileKey: result.key,
                fileUrl: result.url,
                mimeType: req.file.mimetype,
                size: req.file.size,
                provider: result.provider,
            },
        });

        logger.info(`File uploaded by user ${userId}: ${result.key}`);

        res.json({
            success: true,
            file: {
                id: fileRecord.id,
                filename: fileRecord.filename,
                url: fileRecord.fileUrl,
                size: fileRecord.size,
                mimeType: fileRecord.mimeType,
            },
        });
    } catch (error) {
        logger.error('Upload error:', error);
        throw error;
    }
};

// Get file URL (with signed URL for S3)
export const getFileUrl = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.userId;

        const file = await prisma.fileUpload.findUnique({
            where: { id },
            include: { escrow: true },
        });

        if (!file) {
            throw new AppError(ERROR_CODES.NOT_FOUND, 'File not found', 404);
        }

        // Check access
        if (file.userId !== userId &&
            file.escrow?.buyerId !== userId &&
            file.escrow?.sellerId !== userId) {
            throw new AppError(ERROR_CODES.FORBIDDEN, 'You do not have access to this file', 403);
        }

        // Get signed URL for S3 (or return existing URL)
        let url = file.fileUrl;
        if (file.provider === 's3') {
            url = await storageService.getSignedUrl(file.fileKey);
        }

        res.json({
            success: true,
            url,
        });
    } catch (error) {
        logger.error('Get file URL error:', error);
        throw error;
    }
};

// Delete file
export const deleteFile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.userId;

        const file = await prisma.fileUpload.findUnique({
            where: { id },
        });

        if (!file) {
            throw new AppError(ERROR_CODES.NOT_FOUND, 'File not found', 404);
        }

        // Only file uploader can delete
        if (file.userId !== userId) {
            throw new AppError(ERROR_CODES.FORBIDDEN, 'You can only delete your own files', 403);
        }

        // Delete from storage
        await storageService.deleteFile(file.fileKey);

        // Delete from database
        await prisma.fileUpload.delete({
            where: { id },
        });

        logger.info(`File deleted by user ${userId}: ${file.fileKey}`);

        res.json({
            success: true,
            message: 'File deleted successfully',
        });
    } catch (error) {
        logger.error('Delete file error:', error);
        throw error;
    }
};

// List user's files
export const listFiles = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { escrowId } = req.query;

        const files = await prisma.fileUpload.findMany({
            where: {
                userId,
                ...(escrowId && { escrowId: escrowId as string }),
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                filename: true,
                fileUrl: true,
                mimeType: true,
                size: true,
                escrowId: true,
                createdAt: true,
            },
        });

        res.json({
            success: true,
            files,
        });
    } catch (error) {
        logger.error('List files error:', error);
        throw error;
    }
};
