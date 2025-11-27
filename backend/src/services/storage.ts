import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger';
import { config } from '../config';

// Support both AWS S3 and Cloudinary
const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 's3'; // 's3' or 'cloudinary'

// AWS S3 Configuration
let s3Client: S3Client | null = null;
if (STORAGE_PROVIDER === 's3') {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });
}

// Cloudinary Configuration
if (STORAGE_PROVIDER === 'cloudinary') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
  });
}

export interface UploadFileParams {
  file: Buffer;
  filename: string;
  contentType: string;
  folder?: string;
}

export interface UploadResult {
  url: string;
  key: string;
  provider: string;
}

/**
 * Upload file to storage (S3 or Cloudinary)
 */
export const uploadFile = async (params: UploadFileParams): Promise<UploadResult> => {
  if (STORAGE_PROVIDER === 's3') {
    if (!s3Client) {
      throw new Error('AWS S3 not configured');
    }

    const bucket = process.env.AWS_S3_BUCKET || '';
    if (!bucket) {
      throw new Error('AWS_S3_BUCKET not configured');
    }

    const key = params.folder ? `${params.folder}/${params.filename}` : params.filename;

    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: params.file,
          ContentType: params.contentType,
          ACL: 'public-read', // Or 'private' for private files
        })
      );

      const url = `https://${bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

      logger.info(`File uploaded to S3: ${key}`);
      return {
        url,
        key,
        provider: 's3',
      };
    } catch (error: any) {
      logger.error('S3 upload error:', error);
      throw new Error(`Failed to upload to S3: ${error.message}`);
    }
  } else if (STORAGE_PROVIDER === 'cloudinary') {
    try {
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: params.folder || 'escrow',
            resource_type: 'auto',
            public_id: params.filename.replace(/\.[^/.]+$/, ''), // Remove extension
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(params.file);
      });

      logger.info(`File uploaded to Cloudinary: ${uploadResult.public_id}`);
      return {
        url: uploadResult.secure_url,
        key: uploadResult.public_id,
        provider: 'cloudinary',
      };
    } catch (error: any) {
      logger.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
    }
  } else {
    throw new Error(`Unsupported storage provider: ${STORAGE_PROVIDER}`);
  }
};

/**
 * Get signed URL for private file access (S3 only)
 */
export const getSignedUrl = async (key: string, expiresIn: number = 3600): Promise<string> => {
  if (STORAGE_PROVIDER !== 's3' || !s3Client) {
    throw new Error('Signed URLs only supported for S3');
  }

  const bucket = process.env.AWS_S3_BUCKET || '';
  if (!bucket) {
    throw new Error('AWS_S3_BUCKET not configured');
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getS3SignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error: any) {
    logger.error('S3 signed URL error:', error);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
};

/**
 * Delete file from storage
 */
export const deleteFile = async (key: string): Promise<void> => {
  if (STORAGE_PROVIDER === 's3') {
    if (!s3Client) {
      throw new Error('AWS S3 not configured');
    }

    const bucket = process.env.AWS_S3_BUCKET || '';
    if (!bucket) {
      throw new Error('AWS_S3_BUCKET not configured');
    }

    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        })
      );

      logger.info(`File deleted from S3: ${key}`);
    } catch (error: any) {
      logger.error('S3 delete error:', error);
      throw new Error(`Failed to delete from S3: ${error.message}`);
    }
  } else if (STORAGE_PROVIDER === 'cloudinary') {
    try {
      await cloudinary.uploader.destroy(key);
      logger.info(`File deleted from Cloudinary: ${key}`);
    } catch (error: any) {
      logger.error('Cloudinary delete error:', error);
      throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
    }
  } else {
    throw new Error(`Unsupported storage provider: ${STORAGE_PROVIDER}`);
  }
};

