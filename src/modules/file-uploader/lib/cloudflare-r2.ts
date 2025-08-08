import { IMAGE_SIZE_LIMIT } from "@/constants";

interface UploadToR2Options {
  file: File;
  folder: string;
  onProgress?: (progress: number) => void;
  getUploadUrl: (input: {
    filename: string;
    contentType: string;
    folder: string;
  }) => Promise<{ uploadUrl: string; publicUrl: string; fileKey: string }>;
}

interface UploadToR2Result {
  publicUrl: string;
  fileKey: string;
}

class UploadError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "UploadError";
  }
}

export class CloudflareR2Client {
  /**
   * generate a unique filename
   * @param originalFilename the original filename
   * @returns the unique filename
   */
  private generateUniqueFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const extension = originalFilename.split(".").pop() || "";
    const baseName = originalFilename.replace(`.${extension}`, "");
    return `${baseName}-${timestamp}.${extension}`;
  }

  /**
   * validate file
   * @param file the file to be validated
   * @throws {UploadError} if file validation fails
   */
  private validateFile(file: File) {
    if (file.size > IMAGE_SIZE_LIMIT) {
      throw new UploadError(`File size exceeds ${IMAGE_SIZE_LIMIT}MB limit`);
    }
  }

  /**
   *  XMLHttpRequest upload with progress
   * @param file the file to be uploaded
   * @param uploadUrl the upload url
   * @param onProgress the progress callback
   */
  private async uploadWithProgress(
    file: File,
    uploadUrl: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress?.(progress);
        }
      });

      // complete
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(
            new UploadError(`Upload failed with status ${xhr.status}`, {
              status: xhr.status,
              response: xhr.response,
            })
          );
        }
      };

      // error
      xhr.onerror = () => {
        reject(new UploadError("Network error during upload"));
      };

      xhr.ontimeout = () => {
        reject(new UploadError("Upload timed out"));
      };

      // timeout
      xhr.timeout = 30000;

      // send request
      xhr.open("PUT", uploadUrl);
      xhr.send(file);
    });
  }

  /**
   * Upload file to Cloudflare R2
   * @param options the upload options
   * @returns the upload result, containing the public URL
   * @throws {UploadError} if the upload fails
   */
  async upload({
    file,
    folder,
    onProgress,
    getUploadUrl,
  }: UploadToR2Options): Promise<UploadToR2Result> {
    try {
      this.validateFile(file);

      const uniqueFilename = this.generateUniqueFilename(file.name);

      const { uploadUrl, publicUrl, fileKey } = await getUploadUrl({
        filename: uniqueFilename,
        contentType: file.type,
        folder,
      });

      await this.uploadWithProgress(file, uploadUrl, onProgress);

      return { publicUrl, fileKey };
    } catch (error) {
      if (error instanceof UploadError) {
        throw error;
      }
      throw new UploadError(
        "Failed to upload file",
        error instanceof Error ? error : undefined
      );
    }
  }
}

export const cloudflareR2 = new CloudflareR2Client();
