import { useDropzone } from "react-dropzone";
import { IMAGE_SIZE_LIMIT } from "@/constants";
import { IconPhotoPlus } from "@tabler/icons-react";

interface UploadZoneProps {
  onUpload: (file: File) => Promise<void>;
}
// [TODO]: Uploading animation
export function ImageDropzone({ onUpload }: UploadZoneProps) {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        await onUpload(file);
      }
    },
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    multiple: false,
    maxSize: IMAGE_SIZE_LIMIT,
  });

  return (
    <section className="size-50 bg-muted flex items-center justify-center px-4 rounded-md">
      <div
        {...getRootProps({ className: "dropzone" })}
        className="flex flex-col items-center justify-center"
      >
        <input {...getInputProps()} />
        <IconPhotoPlus className="size-8 text-muted-foreground" />
        <em className="text-muted-foreground text-xs text-center mt-2">
          (Max size: {IMAGE_SIZE_LIMIT / 1024 / 1024} MB)
        </em>
      </div>
    </section>
  );
}
