"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { s3Client as uploadClient } from "../lib/upload-client";
import { toast } from "sonner";

interface UploadOptions {
  folder: string;
  onSuccess?: (key: string, file: File) => void | Promise<void>;
  onError?: (error: Error, file: File) => void;
  onProgress?: (progress: number, file: File) => void;
}

type UploadStatus = "pending" | "uploading" | "processing" | "success" | "error";

interface FileUploadState {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  key?: string;
  error?: string;
}

export function useFileUpload() {
  const trpc = useTRPC();
  const [uploadingFiles, setUploadingFiles] = useState<FileUploadState[]>([]);

  const createPresignedUrl = useMutation(
    trpc.s3.createPresignedUrl.mutationOptions()
  );

  const uploadFile = async (file: File, options: UploadOptions) => {
    const tempId = crypto.randomUUID();

    setUploadingFiles((prev) => [
      ...prev,
      { id: tempId, file, progress: 0, status: "pending" },
    ]);

    try {
      // 1. Get Presigned URL
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === tempId ? { ...f, status: "uploading" as UploadStatus } : f
        )
      );

      const { uploadUrl, key } = await createPresignedUrl.mutateAsync({
        filename: file.name,
        contentType: file.type,
        size: file.size,
        folder: options.folder,
      });

      // 2. Upload to S3
      await uploadClient.upload({
        file,
        folder: options.folder,
        getUploadUrl: async () => ({ uploadUrl, publicUrl: "" }),
        onProgress: (progress) => {
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === tempId ? { ...f, progress, status: "uploading" as UploadStatus } : f
            )
          );

          // Call custom progress callback if provided
          if (options.onProgress) {
            options.onProgress(progress, file);
          }
        },
      });

      // 3. Processing (saving to DB)
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === tempId ? { ...f, status: "processing" as UploadStatus, progress: 100 } : f
        )
      );

      // 4. Call success callback with the S3 key
      if (options.onSuccess) {
        await options.onSuccess(key, file);
      }

      // 5. Mark as success
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === tempId ? { ...f, status: "success" as UploadStatus, key } : f
        )
      );

      toast.success(`Uploaded ${file.name}`);

      // Remove after a short delay to show success state
      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((f) => f.id !== tempId));
      }, 1000);

      return key;
    } catch (error) {
      console.error("Upload failed:", error);

      const errorMessage = error instanceof Error ? error.message : "Upload failed";

      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === tempId ? { ...f, status: "error" as UploadStatus, error: errorMessage } : f
        )
      );

      if (options.onError) {
        options.onError(error as Error, file);
      }

      toast.error(`Failed to upload ${file.name}`);

      // Remove failed upload after delay
      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((f) => f.id !== tempId));
      }, 3000);

      throw error;
    }
  };

  const uploadMultipleFiles = async (
    files: File[],
    options: UploadOptions
  ) => {
    const results = await Promise.allSettled(
      files.map((file) => uploadFile(file, options))
    );

    const successful = results.filter(
      (r) => r.status === "fulfilled"
    ) as PromiseFulfilledResult<string>[];
    const failed = results.filter((r) => r.status === "rejected");

    if (failed.length > 0) {
      toast.error(
        `${failed.length} file(s) failed to upload. ${successful.length} succeeded.`
      );
    }

    return {
      successful: successful.map((r) => r.value),
      failed: failed.length,
    };
  };

  const getUploadProgress = (fileId: string) => {
    return uploadingFiles.find((f) => f.id === fileId);
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    uploadingFiles,
    isUploading: uploadingFiles.length > 0,
    getUploadProgress,
  };
}
