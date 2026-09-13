// ─────────────────────────────────────────────────────────────────────────────
// Real User Saved Prompts Manager (Local + Account Scoped)
// ─────────────────────────────────────────────────────────────────────────────

const getStorageKey = (userId?: string | null) => {
  return userId ? `aicorn_saved_prompts_${userId}` : `aicorn_saved_prompts_anon`;
};

export function getSavedPromptIds(userId?: string | null): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isPromptSaved(promptId: string, userId?: string | null): boolean {
  if (!promptId) return false;
  const ids = getSavedPromptIds(userId);
  return ids.includes(promptId);
}

export function toggleSavedPrompt(promptId: string, userId?: string | null): boolean {
  if (typeof window === "undefined" || !promptId) return false;
  try {
    const key = getStorageKey(userId);
    const ids = getSavedPromptIds(userId);
    const index = ids.indexOf(promptId);
    let nowSaved = false;
    if (index >= 0) {
      ids.splice(index, 1);
      nowSaved = false;
    } else {
      ids.unshift(promptId);
      nowSaved = true;
    }
    localStorage.setItem(key, JSON.stringify(ids));
    window.dispatchEvent(
      new CustomEvent("aicorn_saved_prompts_changed", {
        detail: { promptId, isSaved: nowSaved },
      })
    );
    return nowSaved;
  } catch {
    return false;
  }
}
