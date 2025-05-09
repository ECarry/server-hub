/* eslint-disable @next/next/no-img-element */
import { cloudflareR2 } from "../../lib/cloudflare-r2";
import { trpc } from "@/trpc/client";
import { useState } from "react";
import { toast } from "sonner";
import { UploadIcon, XIcon } from "lucide-react";
import { getFileUrl } from "../../lib/utils";

interface ImageUploaderButtonProps {
  imageKey?: string | null;
  onUpload: (key: string) => void;
  className?: string;
}

export const ImageUploaderButton = ({
  imageKey,
  onUpload,
  className = "",
}: ImageUploaderButtonProps) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const createPresignedUrl = trpc.filesUpload.createPresignedUrl.useMutation();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await cloudflareR2.upload({
        file,
        folder: "logos",
        onProgress: (progress) => setUploadProgress(progress),
        getUploadUrl: async (input) => {
          const data = await createPresignedUrl.mutateAsync(input);
          return {
            uploadUrl: data.uploadUrl,
            publicUrl: data.publicUrl,
            fileKey: data.fileKey,
          };
        },
      });

      onUpload(result.fileKey);
      toast.success("Upload success");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (e.target) e.target.value = "";
    }
  };

  const handleRemove = () => {
    onUpload("");
  };

  return (
    <div className={`relative flex flex-col gap-2 ${className}`}>
      {imageKey ? (
        <div className="relative w-24 h-24 mb-2">
          <img
            src={getFileUrl(imageKey)}
            alt="logo"
            className="w-full h-full object-contain rounded-md border border-gray-200"
          />

          {!isUploading && (
            <button
              type="button"
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              aria-label="Delete Image"
              onClick={handleRemove}
            >
              <XIcon size={14} />
            </button>
          )}
        </div>
      ) : (
        <div className="relative overflow-hidden bg-gray-200 rounded">
          {isUploading && (
            <div
              className="absolute inset-0 bg-green-400 transition-all duration-300 ease-out z-0 rounded"
              style={{ width: `${uploadProgress}%` }}
            />
          )}

          <label
            className="relative z-10 flex items-center justify-center gap-2 px-4 py-2 bg-blue-400 text-white rounded cursor-pointer hover:bg-blue-500 transition-colors w-full"
            style={{
              background: isUploading ? "transparent" : undefined,
            }}
          >
            <UploadIcon size={16} />
            <span>
              {isUploading ? `Uploading... ${uploadProgress}%` : "Select file"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>
      )}
    </div>
  );
};
