// ─────────────────────────────────────────────────────────────────────────────
// Real User Saved Prompts Manager (Local + Account Scoped)
// ─────────────────────────────────────────────────────────────────────────────

const getStorageKey = (userId?: string | null) => {
  return userId ? `aicorn_saved_prompts_${userId}` : `aicorn_saved_prompts_anon`;
};

export function getSavedPromptIds(userId?: string | null): string[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    let ids: string[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) ids = parsed;
      } catch {}
    }

    // If a logged-in user exists, merge any prompt IDs saved during anon session
    if (userId) {
      const anonRaw = localStorage.getItem("aicorn_saved_prompts_anon");
      if (anonRaw) {
        try {
          const anonParsed = JSON.parse(anonRaw);
          if (Array.isArray(anonParsed) && anonParsed.length > 0) {
            const merged = Array.from(new Set([...ids, ...anonParsed]));
            localStorage.setItem(key, JSON.stringify(merged));
            localStorage.removeItem("aicorn_saved_prompts_anon");
            ids = merged;
          }
        } catch {}
      }
    }

    // Also merge any legacy global key if present
    const legacyRaw = localStorage.getItem("aicorn_saved_prompts");
    if (legacyRaw) {
      try {
        const legacyParsed = JSON.parse(legacyRaw);
        if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
          const merged = Array.from(new Set([...ids, ...legacyParsed]));
          localStorage.setItem(key, JSON.stringify(merged));
          localStorage.removeItem("aicorn_saved_prompts");
          ids = merged;
        }
      } catch {}
    }

    return ids;
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
