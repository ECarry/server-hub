"use client";

import { useState, useRef } from "react";
import { useTRPC } from "@/trpc/client";
import { s3Client as uploadClient } from "@/modules/s3/lib/upload-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, X, File as FileIcon, Trash2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";

interface FileItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  publicUrl?: string;
  key?: string;
  error?: string;
}

const PRESETS = {
  ALL: "*",
  IMAGES: "image/*",
  VIDEOS: "video/*",
  PDF: "application/pdf",
};

interface FilesUploaderProps {
  defaultAllowedTypes?: string;
  defaultUploadFolder?: string;
  onUploadSuccess?: (file: FileItem) => void;
}

export function FilesUploader({
  defaultAllowedTypes = "image/*",
  defaultUploadFolder = "photos",
  onUploadSuccess,
}: FilesUploaderProps) {
  const trpc = useTRPC();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuration State
  const [allowedTypes, setAllowedTypes] = useState(defaultAllowedTypes);
  const [uploadFolder, setUploadFolder] = useState(defaultUploadFolder);

  // Files State
  const [files, setFiles] = useState<FileItem[]>([]);

  // Mutations
  const createPresignedUrlMutation = useMutation(
    trpc.s3.createPresignedUrl.mutationOptions()
  );
  const deleteFileMutation = useMutation(
    trpc.s3.deleteFile.mutationOptions()
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: FileItem[] = Array.from(e.target.files).map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: "pending",
      }));
      setFiles((prev) => [...prev, ...newFiles]);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const uploadFile = async (fileItem: FileItem) => {
    try {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, status: "uploading", progress: 0 } : f
        )
      );

      // 1. Get Presigned URL
      const { uploadUrl, publicUrl } = await createPresignedUrlMutation.mutateAsync({
        filename: fileItem.file.name,
        contentType: fileItem.file.type,
        size: fileItem.file.size,
        folder: uploadFolder,
      });

      // 2. Upload to S3
      await uploadClient.upload({
        file: fileItem.file,
        folder: uploadFolder,
        getUploadUrl: async () => ({ uploadUrl, publicUrl }), // Adapter to match interface
        onProgress: (progress) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id ? { ...f, progress } : f
            )
          );
        },
      });

      // 3. Success
      const successFile: FileItem = {
        ...fileItem,
        status: "success",
        progress: 100,
        publicUrl,
      };

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? successFile : f
        )
      );
      toast.success(`Uploaded ${fileItem.file.name}`);
      onUploadSuccess?.(successFile);
    } catch (error) {
      console.error("Upload failed:", error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
              ...f,
              status: "error",
              error: error instanceof Error ? error.message : "Upload failed",
            }
            : f
        )
      );
      toast.error(`Failed to upload ${fileItem.file.name}`);
    }
  };

  const handleUploadAll = () => {
    files.forEach((file) => {
      if (file.status === "pending" || file.status === "error") {
        uploadFile(file);
      }
    });
  };

  const handleDelete = async (fileItem: FileItem) => {
    if (!fileItem.key) return;

    try {
      await deleteFileMutation.mutateAsync({ key: fileItem.key });

      setFiles((prev) => prev.filter((f) => f.id !== fileItem.id));
      toast.success("File deleted");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete file");
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Set upload parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="allowedTypes">Allowed File Types</Label>
              <div className="flex gap-2">
                <Select
                  value={Object.values(PRESETS).includes(allowedTypes) ? allowedTypes : "custom"}
                  onValueChange={(value) => {
                    if (value !== "custom") {
                      setAllowedTypes(value);
                    } else {
                      setAllowedTypes("");
                    }
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="*">All Files</SelectItem>
                    <SelectItem value="image/*">Images</SelectItem>
                    <SelectItem value="video/*">Videos</SelectItem>
                    <SelectItem value="application/pdf">PDFs</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="allowedTypes"
                  value={allowedTypes}
                  onChange={(e) => setAllowedTypes(e.target.value)}
                  placeholder="e.g. image/*"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-slate-500">
                Standard HTML accept attribute format
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="uploadFolder">Upload Folder</Label>
              <Input
                id="uploadFolder"
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                placeholder="e.g. photos, documents"
              />
            </div>
          </CardContent>
        </Card>

        {/* Upload Action */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>Select files to upload</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept={allowedTypes}
              onChange={handleFileSelect}
            />
            <Button
              className="w-full h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 flex flex-col items-center justify-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8" />
              <span>Click to select files</span>
            </Button>
            <Button
              className="w-full"
              onClick={handleUploadAll}
              disabled={files.filter(f => f.status === 'pending' || f.status === 'error').length === 0}
            >
              Upload Pending Files
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Files ({files.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-start gap-4 p-4 border rounded-lg bg-white dark:bg-slate-900"
              >
                {/* Preview / Icon */}
                <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border">
                  {file.file.type.startsWith("image/") ? (
                    file.publicUrl ? (
                      <Image
                        src={keyToUrl(file.publicUrl)}
                        alt={file.file.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    )
                  ) : (
                    <FileIcon className="w-8 h-8 text-slate-400" />
                  )}
                </div>

                {/* Info & Progress */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium truncate">{file.file.name}</p>
                      <p className="text-xs text-slate-500">
                        {formatSize(file.file.size)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === "success" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={() => handleDelete(file)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      {file.status !== "uploading" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Status Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={
                        file.status === "success" ? "text-green-600" :
                          file.status === "error" ? "text-red-600" :
                            "text-slate-500"
                      }>
                        {file.status === "pending" && "Ready to upload"}
                        {file.status === "uploading" && "Uploading..."}
                        {file.status === "success" && "Upload complete"}
                        {file.status === "error" && (file.error || "Upload failed")}
                      </span>
                      <span>{file.progress}%</span>
                    </div>
                    <Progress value={file.progress} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
