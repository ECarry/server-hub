import { S3Client } from "@aws-sdk/client-s3";

// Initialize S3 client with Cloudflare R2 configuration
export const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export const getFileUrl = (fileKey: string) => {
  if (!fileKey) return "/placeholder.svg";
  const publicUrl = `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_URL}/${fileKey}`;
  return publicUrl;
};
