import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const generateSafeFileName = (originalName: string): string => {
  const extension = originalName.split(".").pop()?.toLowerCase() || "";
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `products/${timestamp}_${randomString}.${extension}`;
};

export const s3 = new S3Client({
  region: "us-west-2",
});

export const uploadImageToS3 = async (file: Express.Multer.File) => {
  try {
    const fileKey = generateSafeFileName(file.originalname);
    const bucketName = process.env.AWS_BUCKET_NAME!;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3.send(command);
    return fileKey;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "NoSuchBucket") {
        throw new Error("S3 bucket not found.");
      } else if (error.name === "AccessDenied") {
        throw new Error("No S3 access permission.");
      } else if (error.name === "NetworkError") {
        throw new Error("Network connection failed.");
      }
    }
    throw new Error("Image upload failed.");
  }
};

export const getCloudFrontUrl = (s3Key: string) => {
  const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
  if (!cloudFrontDomain) {
    throw new Error("CLOUDFRONT_DOMAIN is not configured.");
  }
  return `https://${cloudFrontDomain}/${s3Key}`;
};

export const getS3URL = (s3Key: string) => {
  const bucketName = process.env.AWS_BUCKET_NAME;
  const region = "us-west-2";
  if (!bucketName) {
    throw new Error("AWS_BUCKET_NAME environment variable is not set.");
  }

  return `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
};
