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
    const IK_DOMAIN = 'ik.imagekit.io';

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

    // [3] OPTIMIZED IMAGEKIT HANDLING
    const isImageKit = src.includes(IK_DOMAIN);

    // If it's already an ImageKit URL, we inject the transformation into the path
    if (isImageKit) {
        const parts = src.split('/');
        // If it already has tr:, we skip to avoid double transformation
        if (src.includes('/tr:')) return src;

        // Find the index of the host part
        const hostIndex = parts.findIndex(p => p === IK_DOMAIN);
        // The pattern is usually https://host/ID/path. We want https://host/ID/tr:trans/path
        if (hostIndex !== -1 && parts.length > hostIndex + 1) {
            parts.splice(hostIndex + 2, 0, paramsString);
            return parts.join('/');
        }
    }

    // [4] SERVE EXTERNAL IMAGES DIRECTLY
    // Matches any full URL (Imgur, Unsplash, etc.) that is NOT already an ImageKit URL.
    // We serve these directly to consume ZERO quota from both Vercel and ImageKit.
    if (src.startsWith('http') && !isImageKit) {
        return src;
    }

    // Default to serving as-is if no rule matches
    return src;
}
