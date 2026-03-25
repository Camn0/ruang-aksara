/**
 * @file imageKit.ts
 * @description Headless logical module executing transactional dataflows or caching parameters within the Platform Infrastructure.
 * @author Ruang Aksara Engineering Team
 */

import ImageKit from "imagekit";

if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    console.warn("ImageKit environment variables are missing. Image uploads will fail.");
}

export const imageKit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/fo5trikbm",
});

/**
 * Uploads a base64 image or file to ImageKit and returns the URL.
 * @param file - The file to upload (Base64 string or Buffer)
 * @param fileName - Name of the file in ImageKit
 * @param folder - Destination folder in ImageKit
 */
export async function uploadToImageKit(file: string | Buffer, fileName: string, folder: string = "/uploads") {
    try {
        const response = await imageKit.upload({
            file: file, // can be base64 string, URL or Buffer
            fileName: fileName,
            folder: folder,
            useUniqueFileName: true,
        });
        return response.url;
    } catch (error: any) {
        console.error("ImageKit upload error details:", {
            message: error.message,
            stack: error.stack,
            fileName: fileName,
            folder: folder
        });
        throw new Error(`Failed to upload image to CDN: ${error.message || 'Unknown error'}`);
    }
}
