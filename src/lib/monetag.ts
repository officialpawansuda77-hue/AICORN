// Monetag Ad Configuration & Flow Helper

export const MONETAG_DIRECT_LINK = "https://omg10.com/4/11773146";

/**
 * Checks if the ad has already been opened for this prompt in the current session.
 */
export function hasAdBeenOpenedForPrompt(promptId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(`monetag_ad_opened_${promptId}`) === "true";
  } catch {
    return false;
  }
}

/**
 * Marks that the ad was opened for this prompt in the current session.
 */
export function markAdOpenedForPrompt(promptId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`monetag_ad_opened_${promptId}`, "true");
  } catch {}
}

/**
 * Handles the copy prompt ad flow:
 * - ADMIN & PRO users: Never see ads, copies immediately (returns true).
 * - FREE users (1st click): Opens Monetag direct link in new tab, returns false.
 * - FREE users (2nd click): Copies prompt directly without ad (returns true).
 */
export function handlePromptCopyAdFlow(
  promptId: string,
  isProUser: boolean,
  isAdminUser?: boolean
): boolean {
  // Admin and Pro users get direct copy without any ads
  if (isProUser || isAdminUser) {
    return true;
  }

  // If the user already opened the ad for this prompt, allow direct copy
  if (hasAdBeenOpenedForPrompt(promptId)) {
    return true;
  }

  // First click for free user: open the ad in a new tab and remember it
  markAdOpenedForPrompt(promptId);
  window.open(MONETAG_DIRECT_LINK, "_blank", "noopener,noreferrer");
  return false;
}
