import { z } from "zod";
import { s3Client } from "../lib/server-client";
import { TRPCError } from "@trpc/server";
import { adminProcedure, createTRPCRouter } from "@/trpc/init";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Generate a public URL for accessing uploaded photos
 * @param filename - The name of the uploaded file
 * @param folder - The folder where the file is stored
 * @returns The complete public URL for accessing the file
 * @throws Error if S3_PUBLIC_URL is not configured
 */
export const s3Router = createTRPCRouter({
  createPresignedUrl: adminProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        size: z.number(),
        folder: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { filename, contentType, size, folder } = input;
        const uuid = crypto.randomUUID();
        const key = folder
          ? `${folder}/${uuid}-${filename}`
          : `${uuid}-${filename}`;

        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
          ContentType: contentType,
          ContentLength: size,
        });

        const presignedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 60 * 6, // 6 minutes
        });

        const publicUrl = `${process.env.S3_PUBLIC_URL}/${key}`;

        return {
          uploadUrl: presignedUrl,
          publicUrl,
          key,
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate upload URL",
        });
      }
    }),
  deleteFile: adminProcedure
    .input(
      z.object({
        key: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { key } = input;
        const command = new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
        });
        await s3Client.send(command);
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete file",
        });
      }
    }),
});
