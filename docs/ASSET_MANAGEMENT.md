# Asset Management and Media Pipeline (The Ultra-Definitive Reference)

This document provides a exhaustive technical record of the asset management strategies, CDN architectures, and media transformation pipelines that govern the visual identity of Ruang Aksara.

## 1. ImageKit.io Architecture: The Media Engine

Ruang Aksara does not host its own binary assets. We utilize **ImageKit.io** as a specialized "Media-as-a-Service" layer. This ensures that high-resolution covers and author images do not slow down the core application server.

### 1.1 Technical Configuration Matrix
The integration is sustained by three critical environment variables:
- `IMAGEKIT_PUBLIC_KEY`: The identification token used by the client-side ImageKit SDK for real-time transformations.
- `IMAGEKIT_PRIVATE_KEY`: A high-security secret used by Server Actions (specifically in `chapter.ts` and `user.ts`) to authorize direct-to-CDN uploads.
- `IMAGEKIT_URL_ENDPOINT`: The canonical CDN base path (e.g., `https://ik.imagekit.io/ruang_aksara/`).

## 2. Bandwidth & Scaling Strategy

As the platform grows to accommodate thousands of novels, bandwidth management becomes a critical operational concern.

### 2.1 The "Mobile-First" Payload
A standard "Novel Discovery" page may display 20 covers. 
- **Without Optimization**: Serving 20 x 1MB PNG covers = **20MB** of mobile data. This is unacceptable for the sanctuary.
- **With Optimization**: Using `tr:w-200,h-300,f-auto`, each cover is reduced to ~15KB. Total payload = **300KB**.
- **The Result**: A 66x decrease in bandwidth usage, which directly correlates to faster load times and lower operational costs for the co-author team.

### 2.2 Cache Control & Edge TTL
We implement aggressive browser caching for static assets. Once a cover is fetched, it is stored in the local browser cache for 365 days. 
- **Hash-Based Invalidation**: If an author updates their cover, our `updateUserProfile` or `updateNovel` actions generate a new `id` or timestamp query parameter, forcing the CDN and browser to fetch the updated version while preserving the old one for existing cached views.

## 3. Dynamic Asset Optimization: The Transformation Pipeline

We leverage ImageKit's real-time transformation engine to deliver an "Optimized-by-Default" experience.

### 3.1 Responsive Image Strategy
We never deliver the "Source" image to the reader. Instead, every image request is transformed based on the UI context:
- **Novel Covers (Listings)**: `tr:w-200,h-300,cm-pad_resize` (Small, standardized aspect ratio).
- **Novel Hero (Detail Page)**: `tr:w-800,q-80` (High-resolution focus, optimized for mobile screens).
- **User Avatars**: `tr:w-100,h-100,fo-face` (Small, auto-centered on the user's face using AI-based focus).
- **Author Banners**: `tr:w-1200,ar-16-9` (Large, cinema-style aspect ratio).

### 3.2 Cross-Platform Compatibility (f-auto)
By appending the `f-auto` (Auto Format) parameter to all requests, the CDN dynamically chooses the best format for the reader's browser:
- **Chrome/Edge**: AVIF or WebP.
- **Safari**: WebP (High Efficiency).
- **Legacy Browsers**: Optimized Progressive JPEG.

## 4. Secure Asset Injection: The Upload Lifecycle

To prevent the application server from becoming a bottleneck, we use a "Signed Proxy" upload pattern.

### 4.1 The Upload Workflow
1. **Client Initiation**: An author selects a new novel cover.
2. **Server-Side Signing**: The client calls a Server Action (e.g., `uploadToImageKit`). This action uses the `IMAGEKIT_PRIVATE_KEY` to generate a secure, one-time-use signature.
3. **CDN Push**: The application sends the binary data directly to the ImageKit API using the secure signature.
4. **ID Capture**: ImageKit returns the final `url` and `fileId`. These strings are then saved into the `Karya` model in the PostgreSQL database.

## 5. Performance & Scalability (LQIP & CDN)

### 5.1 Low Quality Image Placeholders (LQIP)
To eliminate the "Jarring Load" experience, we use LQIP.
- **Logic**: During the upload phase, we generate a tiny (10px) blurred version of the image. This string is saved in the DB.
- **UI**: The React `Image` component displays this blur instantly, transitioning to the high-res asset as it arrives from the CDN.

### 5.2 Global CDN Delivery
ImageKit is backed by a global CDN (AWS CloudFront). This ensures that a reader in Southeast Asia and a reader in Europe both fetch their "Book Covers" from the nearest physical data center, maintaining the platform's sense of high-performance luxury.

Document Version: 1.3.1