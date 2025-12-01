"use client";

import { FilesUploader } from "@/modules/s3/ui/components/files-uploader";

export default function UploaderTestPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">S3 Uploader Test</h1>
          <p className="text-slate-500">Test file uploads with custom configurations</p>
        </div>

        <FilesUploader />
      </div>
    </div>
  );
}
