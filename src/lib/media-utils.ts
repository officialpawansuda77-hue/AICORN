// ─────────────────────────────────────────────────────────────────────────────
// Media URL utility helpers for Google Drive, Dropbox, CDNs, and direct URLs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts Google Drive File ID from any shareable, open, or view URL.
 * Supports:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://drive.google.com/file/d/FILE_ID
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url) return null;
  const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) return idMatch[1];

  return null;
}

/**
 * Checks if a given URL is a Google Drive link.
 */
export function isGoogleDriveUrl(url: string): boolean {
  if (!url) return false;
  return url.includes("drive.google.com") || url.includes("docs.google.com");
}

/**
 * Checks if a given URL is a Dropbox link.
 */
export function isDropboxUrl(url: string): boolean {
  if (!url) return false;
  return url.includes("dropbox.com");
}

/**
 * Converts any media URL (Google Drive, Dropbox, CDN, direct link) into a streamable / direct playable format.
 */
export function formatMediaUrl(url: string, mediaType: "video" | "image" = "video"): string {
  if (!url) return "";
  const trimmed = url.trim();

  // 1. Google Drive handling
  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    if (mediaType === "image") {
      // High-resolution Google Drive image thumbnail
      return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`;
    }
    // Direct stream download link for video
    return `https://drive.google.com/uc?export=download&id=${driveId}`;
  }

  // 2. Dropbox handling: Convert ?dl=0 to ?raw=1 for direct streaming
  if (isDropboxUrl(trimmed)) {
    return trimmed.replace("?dl=0", "?raw=1").replace("&dl=0", "&raw=1");
  }

  return trimmed;
}

/**
 * Generates an optimized thumbnail URL for any media URL.
 */
export function getThumbnailUrl(url: string, mediaType: "video" | "image" = "video"): string {
  if (!url) return "";
  const driveId = extractGoogleDriveId(url);
  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`;
  }
  return formatMediaUrl(url, mediaType);
}

/**
 * Gets the embedded player URL for Google Drive preview (works for any video size with 0 bandwidth limits).
 */
export function getDriveEmbedUrl(url: string): string | null {
  const driveId = extractGoogleDriveId(url);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }
  return null;
}
