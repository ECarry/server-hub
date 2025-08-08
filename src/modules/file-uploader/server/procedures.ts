import { z } from "zod";
import { cache } from "react";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure } from "@/trpc/init";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../lib/utils";

/**
 * Generate a public URL for accessing uploaded photos
 * Uses React cache to memoize results and improve performance
 * @param filename - The name of the uploaded file
 * @param folder - The folder where the file is stored
 * @returns The complete public URL for accessing the file
 * @throws Error if CLOUDFLARE_R2_PUBLIC_URL is not configured
 */
const getPublicUrl = cache((filename: string, folder: string) => {
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  if (!publicUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "CLOUDFLARE_R2_PUBLIC_URL is not configured",
    });
  }
  return `${publicUrl}/${folder}/${filename}`;
});

export const filesUploadRouter = createTRPCRouter({
  createPresignedUrl: adminProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        folder: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { filename, contentType, folder } = input;
      const { role } = ctx.user;

      if (role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "FORBIDDEN",
        });
      }

      // Generate a unique filename with user ID to prevent conflicts
      const key = `${folder}/${filename}`;

      // Create the S3 command for generating a presigned URL
      const command = new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
      });
      try {
        const signedUrl = await getSignedUrl(s3, command, {
          expiresIn: 3600,
        });
        const publicUrl = getPublicUrl(filename, folder);

        return {
          uploadUrl: signedUrl,
          publicUrl,
          fileKey: key,
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
        fileKey: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { fileKey } = input;
      const { role } = ctx.user;

      if (role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "FORBIDDEN",
        });
      }

      if (!fileKey) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File key is required",
        });
      }

      // Create the S3 command for deleting an object
      const command = new DeleteObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: fileKey,
      });

      try {
        // Execute the delete command directly
        await s3.send(command);
        return { success: true };
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
