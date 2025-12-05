"use client";

import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Loader2, Trash2, Upload, Eye, EyeOff } from "lucide-react";
import { useRef } from "react";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import { format } from "date-fns";
import { useFileUpload } from "@/modules/s3/hooks/use-file-upload";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface Props {
  productId: string;
}

export const ProductDownloads = ({ productId }: Props) => {
  const trpc = useTRPC();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, uploadingFiles, isUploading } = useFileUpload();

  const { data: downloads, refetch } = useSuspenseQuery(
    trpc.products.getDownloads.queryOptions({
      productId,
    })
  );

  const createDownload = useMutation(
    trpc.products.createDownload.mutationOptions()
  );
  const removeDownload = useMutation(
    trpc.products.removeDownload.mutationOptions()
  );
  const updateDownload = useMutation(
    trpc.products.updateDownload.mutationOptions()
  );
  const deleteFile = useMutation(trpc.s3.deleteFile.mutationOptions());

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      for (const file of files) {
        await uploadFile(file, {
          folder: "downloads",
          onSuccess: async (key) => {
            // Create Record in DB
            await createDownload.mutateAsync({
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

  const handleDelete = async (downloadId: string, fileKey: string | null) => {
    try {
      await removeDownload.mutateAsync({ id: downloadId });
      if (fileKey) {
        await deleteFile.mutateAsync({ key: fileKey });
      }
      toast.success("Download deleted");
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete download");
    }
  };

  const toggleVisibility = async (downloadId: string, currentVisibility: "public" | "private") => {
    try {
      const newVisibility = currentVisibility === "public" ? "private" : "public";
      await updateDownload.mutateAsync({
        id: downloadId,
        visibility: newVisibility,
      });
      toast.success(`Download is now ${newVisibility}`);
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update visibility");
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
        <h3 className="text-lg font-medium">Downloads</h3>
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
          Upload Download
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
        {/* Uploading Files */}
        {uploadingFiles.map((uploadState) => (
          <div
            key={uploadState.id}
            className="flex items-center justify-between p-4 border rounded-md bg-card"
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

        {/* Downloads List with Accordion */}
        {downloads && downloads.length > 0 && (
          <Accordion type="single" collapsible className="space-y-2">
            {downloads.map((dl) => (
              <AccordionItem
                key={dl.id}
                value={dl.id}
                className="border border-border rounded-md bg-card data-[state=open]:bg-accent/50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 gap-2">
                  <AccordionTrigger className="hover:no-underline py-3 flex-1">
                    <div className="flex items-center gap-3 overflow-hidden w-full">
                      <Download className="size-5 text-primary shrink-0" />
                      <div className="min-w-0 text-left flex-1">
                        <p className="font-medium truncate">{dl.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {dl.createdAt && <span>{format(new Date(dl.createdAt), "d MMM yyyy")}</span>}
                          {dl.version && (
                            <>
                              <span>•</span>
                              <Badge variant="secondary" className="h-5 px-2 text-xs">
                                {dl.version}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(dl.id, dl.visibility)
                      }}
                      title={dl.visibility === "public" ? "Make Private" : "Make Public"}
                    >
                      {dl.visibility === "public" ? (
                        <Eye className="size-4 text-green-500" />
                      ) : (
                        <EyeOff className="size-4 text-muted-foreground" />
                      )}
                    </Button>
                    {dl.fileKey && (
                      <a
                        href={keyToUrl(dl.fileKey)}
                        download
                        className="inline-flex items-center justify-center size-8 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Download className="size-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      className="inline-flex items-center justify-center size-8 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                      onClick={() => handleDelete(dl.id, dl.fileKey)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                <AccordionContent className="pb-4 pt-2">
                  <div className="space-y-3 pl-8">
                    {/* File Info Grid */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      {dl.version && (
                        <div>
                          <dt className="text-muted-foreground">Version</dt>
                          <dd className="font-medium">{dl.version}</dd>
                        </div>
                      )}

                      {dl.releaseDate && (
                        <div>
                          <dt className="text-muted-foreground">Release Date</dt>
                          <dd className="font-medium">
                            {format(new Date(dl.releaseDate), "d MMM yyyy")}
                          </dd>
                        </div>
                      )}

                      <div>
                        <dt className="text-muted-foreground">File Size</dt>
                        <dd className="font-medium">{formatSize(dl.fileSize)}</dd>
                      </div>

                      <div>
                        <dt className="text-muted-foreground">Downloads</dt>
                        <dd className="font-medium">{dl.downloadCount || 0}</dd>
                      </div>

                      {dl.operatingSystem && (
                        <div>
                          <dt className="text-muted-foreground">Operating System</dt>
                          <dd className="font-medium">{dl.operatingSystem}</dd>
                        </div>
                      )}

                      {dl.architecture && (
                        <div>
                          <dt className="text-muted-foreground">Architecture</dt>
                          <dd className="font-medium">{dl.architecture}</dd>
                        </div>
                      )}

                      {dl.category && (
                        <div>
                          <dt className="text-muted-foreground">Category</dt>
                          <dd className="font-medium capitalize">{dl.category}</dd>
                        </div>
                      )}

                      {dl.fileType && (
                        <div>
                          <dt className="text-muted-foreground">File Type</dt>
                          <dd className="font-medium">{dl.fileType}</dd>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {dl.description && (
                      <div>
                        <dt className="text-sm text-muted-foreground mb-1">Description</dt>
                        <dd className="text-sm">{dl.description}</dd>
                      </div>
                    )}

                    {/* Installation Notes */}
                    {dl.installationNotes && (
                      <div>
                        <dt className="text-sm text-muted-foreground mb-1">Installation Notes</dt>
                        <dd className="text-sm whitespace-pre-wrap">{dl.installationNotes}</dd>
                      </div>
                    )}

                    {/* Checksums */}
                    {(dl.checksumMd5 || dl.checksumSha256) && (
                      <div className="space-y-1">
                        <dt className="text-sm text-muted-foreground">Checksums</dt>
                        {dl.checksumMd5 && (
                          <dd className="text-xs font-mono bg-muted p-2 rounded">
                            <span className="text-muted-foreground">MD5:</span> {dl.checksumMd5}
                          </dd>
                        )}
                        {dl.checksumSha256 && (
                          <dd className="text-xs font-mono bg-muted p-2 rounded">
                            <span className="text-muted-foreground">SHA256:</span> {dl.checksumSha256}
                          </dd>
                        )}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {downloads?.length === 0 && uploadingFiles.length === 0 && (
          <div className="py-8 text-center text-muted-foreground border-2 border-dashed rounded-md">
            No downloads uploaded yet
          </div>
        )}
      </div>
    </div>
  );
};
