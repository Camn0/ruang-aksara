/**
 * @file chapter.ts
 * @description Core Server Action for handling reader interactions with chapters.
 * @author Ruang Aksara Engineering Team
 */

'use server'; // Ensures this code NEVER runs in the browser, protecting DB credentials.

import { getServerSession } from "next-auth"; // Required to get the secure session cookie.
import { authOptions } from "@/lib/auth"; // The configuration for how sessions are signed and retrieved.
import { prisma } from "@/lib/prisma"; // The primary database client used for all queries.
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache"; 

/**
 * Executes the complex logic for processing a user's reaction (like/love) to a specific chapter.
 * 
 * @param babId - The unique ID of the chapter being reacted to.
 * @param reactionType - The string identifier of the emotion ('like', 'love', etc).
 * @param karyaId - The novel ID required to correctly purge the Next.js visual cache.
 */
export async function submitChapterReaction(babId: string, reactionType: string, karyaId: string) {
    try {
        // [1] Security Gate: We verify the user is genuinely logged in via encrypted session cookies.
        const session = await getServerSession(authOptions); 
        
        // [2] Unauthorized Bounce: If the cookie is missing or invalid, reject immediately.
        if (!session) return { error: "Unauthorized." }; 

        // [3] Database Upsert: We use `upsert` so we don't need two separate queries (check if exists, then update/create).
        // This guarantees atomicity (it won't fail if two users click exactly at the same millisecond).
        await (prisma as any).chapterReaction.upsert({
            where: { // Search criteria: We are looking for *this* user reacting to *this* exact chapter.
                user_id_bab_id: {
                    user_id: session.user.id,
                    bab_id: babId
                }
            },
            update: { reaction_type: reactionType }, // If the user clicked "Like" before but now clicked "Love", just update it.
            create: { // If this is the user's first time interacting with this chapter, create a fresh row.
                user_id: session.user.id,
                bab_id: babId,
                reaction_type: reactionType
            }
        });

        // [4] Cache Purging (Crucial for Vercel/Next.js Architecture)
        // This clears the global edge cache for this chapter's reactions so everyone sees the new count immediately.
        revalidateTag(`chapter-reactions-${babId}`); 
        // This clears the user's personal context cache so their button stays "highlighted" across devices.
        revalidateTag(`user-reactions-${session.user.id}`); 
        // This forces Next.js to rebuild the visual HTML path for the reading interface so the new data matches the UI.
        revalidatePath(`/novel/${karyaId}/[chapterNo]`); 
        
        // [5] Success Exit: Returns exactly what the client-side `useAction` expects to see.
        return { success: true }; 
    } catch (e) {
        // [6] Failure Mode: If the database is completely down, it logs the stack trace to Vercel Logs.
        console.error("[submitChapterReaction] Error:", e);
        // [7] Graceful Degradation: Never return the raw SQL error to the user (prevents hacking via stack traces).
        return { error: "Gagal memproses reaksi bab." }; 
    }
}

/**
 * Fetches the sequentially ordered list of chapters for a novel, optimized for the "Chapter Picker" sidebar.
 * 
 * @param karyaId - The novel to fetch chapters for.
 */
export async function getKaryaChapters(karyaId: string) {
    // [1] Cache Wrapping: We wrap the database call in `unstable_cache` so the DB isn't hit 10,000 times a minute if a novel goes viral.
    return unstable_cache(
        async () => { // This inner function *only* executes if Vercel doesn't have the data in its global edge cache.
            try {
                // [2] Lightweight DB Query: We explicitly use `select` to ONLY pull the chapter number and title.
                // Pulling the full `content` (which can be 50,000 words long) here would crash the server memory.
                return await prisma.bab.findMany({
                    where: { karya_id: karyaId }, // Filter everything out except chapters for this specific novel.
                    orderBy: { chapter_no: 'asc' }, // Guarantee the chapters are loaded in chronological reading order (1, 2, 3...).
                    select: { chapter_no: true, title: true } // CRITICAL: Exclude body text from this navigational query.
                });
            } catch (error) {
                // [3] Database Down Scenario: Log the failure but don't crash the entire page.
                console.error("[getKaryaChapters] Error:", error);
                // Return an empty array so the Chapter Picker UI just shows "No chapters found" instead of throwing a 500 White Screen of Death.
                return []; 
            }
        },
        [`chapters-all-${karyaId}`], // The rigid cache key signature across the global edge network.
        { revalidate: 3600, tags: [`karya-${karyaId}`] } // The cache expires organically every 1 hour, OR forcefully if tags are purged elsewhere via admin.
    )(); // We immediately invoke the cache wrapper because we need the data right now.
}
