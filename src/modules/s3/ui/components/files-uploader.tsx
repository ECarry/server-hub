/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
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
import { Upload, File as FileIcon, Trash2, Image as ImageIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useFileUpload } from "../../hooks/use-file-upload";
import { keyToUrl } from "../../lib/key-to-url";

interface SuccessFileItem {
  id: string;
  file: File;
  key: string;
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
  onUploadSuccess?: (file: SuccessFileItem) => void;
}

export function FilesUploader({
  defaultAllowedTypes = "image/*",
  defaultUploadFolder = "test",
  onUploadSuccess,
}: FilesUploaderProps) {
  const trpc = useTRPC();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuration State
  const [allowedTypes, setAllowedTypes] = useState(defaultAllowedTypes);
  const [uploadFolder, setUploadFolder] = useState(defaultUploadFolder);

  // Use the reusable upload hook
  const { uploadFile, uploadingFiles, isUploading } = useFileUpload();

  // Store successfully uploaded files with their public URLs
  const [successfulFiles, setSuccessfulFiles] = useState<SuccessFileItem[]>([]);

  // Mutations
  const deleteFileMutation = useMutation(
    trpc.s3.deleteFile.mutationOptions()
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      for (const file of files) {
        try {
          // Upload using the hook
          await uploadFile(file, {
            folder: uploadFolder,
            onSuccess: async (uploadedKey) => {
              const successFile: SuccessFileItem = {
                id: crypto.randomUUID(),
                file,
                key: uploadedKey,
              };

              setSuccessfulFiles((prev) => [...prev, successFile]);
              onUploadSuccess?.(successFile);
            },
          });
        } catch (error) {
          console.error("Upload failed:", error);
        }
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (fileItem: SuccessFileItem) => {
    if (!fileItem.key) {
      setSuccessfulFiles((prev) => prev.filter((f) => f.id !== fileItem.id));
      toast.warning("File removed from list");
      return;
    }

    try {
      await deleteFileMutation.mutateAsync({ key: fileItem.key });
      setSuccessfulFiles((prev) => prev.filter((f) => f.id !== fileItem.id));
      toast.success("File deleted");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete file");
    }
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
              type="button"
              className="w-full h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 flex flex-col items-center justify-center gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="w-8 h-8" />
              <span>{isUploading ? "Uploading..." : "Click to select files"}</span>
            </Button>
            {isUploading && (
              <p className="text-sm text-center text-muted-foreground">
                Uploading {uploadingFiles.length} file(s)...
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploading ({uploadingFiles.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadingFiles.map((uploadState) => (
              <div
                key={uploadState.id}
                className="flex items-start gap-4 p-4 border rounded-lg bg-white dark:bg-slate-900"
              >
                {/* Preview / Icon */}
                <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border">
                  {uploadState.file.type.startsWith("image/") ? (
                    <ImageIcon className="w-8 h-8 text-slate-400" />
                  ) : (
                    <FileIcon className="w-8 h-8 text-slate-400" />
                  )}
                </div>

                {/* Info & Progress */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <p className="font-medium truncate">{uploadState.file.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatSize(uploadState.file.size)}
                    </p>
                  </div>

                  {/* Status Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={
                        uploadState.status === "success" ? "text-green-600" :
                          uploadState.status === "error" ? "text-red-600" :
                            "text-slate-500"
                      }>
                        {uploadState.status === "pending" && "Preparing..."}
                        {uploadState.status === "uploading" && "Uploading..."}
                        {uploadState.status === "processing" && "Processing..."}
                        {uploadState.status === "success" && "Upload complete"}
                        {uploadState.status === "error" && (uploadState.error || "Upload failed")}
                      </span>
                      <span>{uploadState.progress}%</span>
                    </div>
                    <Progress value={uploadState.progress} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Successfully Uploaded Files */}
      {successfulFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files ({successfulFiles.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {successfulFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-start gap-4 p-4 border rounded-lg bg-white dark:bg-slate-900"
              >
                {/* Preview / Icon */}
                <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border">
                  {file.file.type.startsWith("image/") ? (
                    file.key ? (
                      <img
                        src={keyToUrl(file.key)}
                        alt={file.file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    )
                  ) : (
                    <FileIcon className="w-8 h-8 text-slate-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium truncate">{file.file.name}</p>
                      <p className="text-xs text-slate-500">
                        {formatSize(file.file.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={() => handleDelete(file)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-green-600">Upload complete</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
