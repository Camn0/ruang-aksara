/**
 * CUSTOM IMAGE LOADER
 * -------------------
 * This loader bypasses Vercel's Image Optimization to save bandwidth and stay under the 1,000 source image limit.
 * It transforms URLs to use an external Image CDN (like ImageKit or Cloudinary) or serves them directly if preferred.
 */

export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
    // [1] HANDLE LOCAL IMAGES
    // If the image is local (starts with /), let Next.js handle it (unlikely for covers)
    if (src.startsWith('/')) {
        return src;
    }

    // [2] IMAGEKIT.IO TRANSFORMATION
    // Documentation: https://docs.imagekit.io/features/image-transformations/resize-crop-and-other-transformations
    const IMAGEKIT_ENDPOINT = 'https://ik.imagekit.io/fo5trikbm';

    // Construct transformation string
    // f-auto: Automatically delivers the best format for the browser (AVIF/WebP)
    // q-auto: Uses ImageKit's intelligent quality optimization (Lowest bandwidth)
    const params = [`w-${width}`, `f-auto` ];
    
    // If quality is provided manually, use it. Otherwise, use q-auto for bandwidth protection.
    if (quality) {
        params.push(`q-${quality}`);
    } else {
        params.push(`q-auto`);
    }
    
    const paramsString = `tr:${params.join(',')}`;

    // If it's a full URL (e.g., Imgur, Unsplash), we proxy it through ImageKit
    if (src.startsWith('http')) {
        // ImageKit URL pattern: ik.imagekit.io/your_id/tr:optimization/ORIGINAL_URL
        return `${IMAGEKIT_ENDPOINT}/${paramsString}/${src}`;
    }

    // Default to serving as-is if no rule matches
    return src;
}
