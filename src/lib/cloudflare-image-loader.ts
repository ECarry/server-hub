import type { ImageLoaderProps } from "next/image";

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_S3_PUBLIC_URL || "";

export default function cloudflareImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps) {
  // 1. Start from the raw src
  let imageUrl = src;

  // 2. Map storage keys (non-HTTP(S), non-root-relative) to full R2 URL
  //    - public assets like "/logo.png" 应该仍然从当前站点的 public 目录加载
  if (
    !src.startsWith("http://") &&
    !src.startsWith("https://") &&
    !src.startsWith("/")
  ) {
    imageUrl = `${R2_PUBLIC_URL}/${src}`;
  }

  // Use Cloudflare Image Resizing for optimization
  // Format: /cdn-cgi/image/width=<width>,quality=<quality>,format=auto/<image-url>
  const params = [`width=${width}`];

  if (quality) {
    params.push(`quality=${quality}`);
  }

  params.push("format=auto");

  // In development, don't go through Cloudflare Image Resizing.
  // Instead, append width/quality as query params so Next.js sees
  // that the loader "implements" width.
  if (process.env.NODE_ENV === "development") {
    const separator = imageUrl.includes("?") ? "&" : "?";
    const queryParts = [`w=${width}`, quality ? `q=${quality}` : null].filter(
      Boolean
    );

    return `${imageUrl}${separator}${queryParts.join("&")}`;
  }

  // In production, use Cloudflare Image Resizing.
  // Ensure there is a slash between the image params and the actual image URL.
  // Cloudflare expects: /cdn-cgi/image/<params>/<image-url>
  return `/cdn-cgi/image/${params.join(",")}/${imageUrl}`;
}
