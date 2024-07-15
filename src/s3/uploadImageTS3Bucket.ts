import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { Request } from 'express';
import multer, { StorageEngine } from 'multer';
import multerS3 from 'multer-s3';
import config from '../config/config';

const { awsAccessKeyId, awsSecretAccessKey, awsRegion, s3BucketName } = config;

if (!awsAccessKeyId || !awsSecretAccessKey || !awsRegion || !s3BucketName) {
  throw new Error('Missing environment variables for AWS configuration');
}

const s3Config: S3ClientConfig = {
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
  },
  region: awsRegion,
};

const s3 = new S3Client(s3Config);

const s3Storage: StorageEngine = multerS3({
  s3: s3,
  bucket: s3BucketName,
  acl: 'public-read',
  metadata: (_, file, cb) => {
    cb(null, { fieldname: file.fieldname });
  },
  key: (_, file, cb) => {
    const fileName =
      Date.now() + '_' + file.fieldname + '_' + file.originalname;
    cb(null, fileName);
  },
});

const uploadImage = multer({
  storage: s3Storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size
  },
}).single('file');

export const uploadImageAndGetUrl = (req: Request): Promise<string> => {
  return new Promise((resolve, reject) => {
    uploadImage(req, {} as any, (err) => {
      if (err instanceof multer.MulterError) {
        return reject(err);
      } else if (err) {
        return reject(
          new Error('An unknown error occurred during the file upload')
        );
      }

      if (!req.file) {
        return reject(new Error('No file uploaded'));
      }

      const fileKey = (req.file as Express.MulterS3.File).key;
      const fileUrl = `https://${s3BucketName}.s3.${awsRegion}.amazonaws.com/${fileKey}`;
      resolve(fileUrl);
    });
  });
};

export default uploadImageAndGetUrl;
