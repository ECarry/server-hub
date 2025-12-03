"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, Loader2, Trash2, Upload, Download } from "lucide-react";
import { useRef } from "react";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import { format } from "date-fns";
import { useFileUpload } from "@/modules/s3/hooks/use-file-upload";

interface Props {
  productId: string;
}

export const ProductDocuments = ({ productId }: Props) => {
  const trpc = useTRPC();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, uploadingFiles, isUploading } = useFileUpload();

  const { data: documents, refetch } = useQuery(
    trpc.products.getDocumentations.queryOptions({
      productId,
    })
  );

  const createDocumentation = useMutation(
    trpc.products.createDocumentation.mutationOptions()
  );
  const removeDocumentation = useMutation(
    trpc.products.removeDocumentation.mutationOptions()
  );
  const deleteFile = useMutation(trpc.s3.deleteFile.mutationOptions());

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      for (const file of files) {
        await uploadFile(file, {
          folder: "documents",
          onSuccess: async (key) => {
            // Create Record in DB
            await createDocumentation.mutateAsync({
              productId,
              name: file.name,
              fileKey: key,
              fileSize: file.size.toString(),
              fileType: file.type,
              visibility: "private",
            });
            refetch();
          },
        });
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (docId: string, fileKey: string | null) => {
    try {
      await removeDocumentation.mutateAsync({ id: docId });
      if (fileKey) {
        await deleteFile.mutateAsync({ key: fileKey });
      }
      toast.success("Document deleted");
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete document");
    }
  };

  const formatSize = (bytes: string | null) => {
    if (!bytes) return "-";
    const b = parseInt(bytes, 10);
    if (isNaN(b)) return bytes;
    if (b === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Documentation</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <Upload className="size-4 mr-2" />
          )}
          Upload Document
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={handleFileSelect}
        />
      </div>

      <div className="space-y-2">
        {documents?.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 border rounded-md bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-primary/10 rounded text-primary">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{doc.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatSize(doc.fileSize)}</span>
                  <span>•</span>
                  <span>{doc.createdAt ? format(new Date(doc.createdAt), "MMM d, yyyy") : "-"}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {doc.fileKey && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  asChild
                >
                  <a href={keyToUrl(doc.fileKey)} target="_blank" rel="noopener noreferrer" download>
                    <Download className="size-4" />
                  </a>
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(doc.id, doc.fileKey)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}

        {uploadingFiles.map((uploadState) => (
          <div
            key={uploadState.id}
            className="flex items-center justify-between p-3 border rounded-md bg-card"
          >
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
              <div className="p-2 bg-primary/10 rounded text-primary">
                {uploadState.status === "success" ? (
                  <svg className="size-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : uploadState.status === "error" ? (
                  <svg className="size-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <Loader2 className="size-5 animate-spin" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{uploadState.file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${uploadState.status === "success" ? "bg-green-500" :
                          uploadState.status === "error" ? "bg-red-500" :
                            "bg-primary"
                        }`}
                      style={{ width: `${uploadState.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {uploadState.status === "success" ? "Done" :
                      uploadState.status === "error" ? "Failed" :
                        uploadState.status === "processing" ? "Saving..." :
                          `${uploadState.progress}%`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {documents?.length === 0 && uploadingFiles.length === 0 && (
          <div className="py-8 text-center text-muted-foreground border-2 border-dashed rounded-md">
            No documents uploaded yet
          </div>
        )}
      </div>
    </div>
  );
};
