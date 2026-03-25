# Performance Audit and Optimization (The Ultra-Definitive Reference)

This document provides a exhaustive technical record of the performance engineering, lighthouse metrics, and optimization strategies that ensure the Ruang Aksara sanctuary remains lightning fast.

## 1. The Performance Philosophy: "Speed as a Feature"

In the Ruang Aksara sanctuary, performance is not an optimization—it is a core UX requirement. We strive for "Instantaneous Transitions" to maintain the reader's state of flow.

### 1.1 Core Metric Targets
We target specific service-level objectives (SLOs) for every page:
- **TTFB (Time to First Byte)**: <150ms (achieved via Vercel Edge Runtime).
- **LCP (Largest Contentful Paint)**: <1.2s (achieved via RSC and font-preloading).
- **CLS (Cumulative Layout Shift)**: 0.00 (achieved via explicit aspect ratios and HSL placeholders).

## 2. Server-Side Performance Engineering

### 2.1 The "RSC Advantage"
By executing 90% of our logic on the server, we drastically reduce the work the reader's device has to perform.
- **Micro-Benchmark**: A traditional client-side React app might take 800ms to parse the JavaScript bundle before the first render. Ruang Aksara delivers the HTML in the initial stream, allowing the browser to begin rendering immediately.

### 2.2 Orchestration vs. Waterfalls
As documented in the `ARCHITECTURE.md`, we use `Promise.all` to fetch data in parallel. 
- **The "Worst Case" Scenario**: If we used sequential fetches, a page with 4 data sources (Novel, Chapters, Reviews, User) would take: `Latency(A) + Latency(B) + Latency(C) + Latency(D)`.
- **The "Ruang Aksara" Scenario**: It takes: `Max(Latency(A, B, C, D))`.
- **Impact**: This typically results in a 2x - 3x improvement in overall page load speed.

## 3. Delivery Layer Optimization (CDN & Caching)

### 3.1 The Quaternary Strategy
Our cache-hit ratio for static content (Novels/Profiles) is targeted at **>95%**. By using `unstable_cache` with surgical revalidation, we ensure that popular novels never require a full database query for the majority of users.

### 3.2 Global CDN Distribution
Assets like CSS and JS bundles are distributed across Vercel’s 20+ global regions. A user in Indonesia receives their "Sanctuary" assets from a server in Singapore or Jakarta, minimizing the physical distance the photons must travel.

## 4. Visual Performance: Images & Fonts

### 4.1 Asset Transformation (ImageKit)
Images are often the heaviest part of a website. We use real-time transformations to ensure no single image exceeds **100kb** in regular browsing contexts.
- **f-auto**: Chooses the modern WebP/AVIF format automatically.
- **q-auto**: Balances visual fidelity with file size.

### 4.2 Font-Preloading Strategy
Since "Parchment" and "IBM Plex Serif" are critical to the sanctuary's aesthetic, we use `next/font` to optimize font loading.
- **Self-Hosting**: Fonts are served from our own domain, removing the extra DNS lookup to Google Fonts.
- **Preloading**: Critical font weights are preloaded in the `<head>`, ensuring that text is rendered in the correct typeface without a "Flash of Unstyled Text" (FOUT).

## 5. Ongoing Performance Auditing

Maintainers should use the following tools to verify the sanctuary's health:
- **Lighthouse**: Target 95+ in Performance, Accessibility, and SEO.
- **Vercel Analytics**: Monitor "Real User Metrics" (RUM) to identify patterns in real-world latency spikes.
- **Prisma Logging**: Monitor for "Slow Queries" (>50ms) that might require new database indexes.

Document Version: 1.0.0 