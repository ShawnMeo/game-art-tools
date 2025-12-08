// Unlock Key System
// Change this key monthly and share in Patreon tier-locked posts

// Current valid unlock key (change monthly)
const VALID_KEY = 'PATRON-DEC-2024';

// Key expiration (optional - change monthly)
const KEY_EXPIRY = '2025-01-01';

const STORAGE_KEY = 'gat_unlock_key';

export const isUnlocked = () => {
    const storedKey = localStorage.getItem(STORAGE_KEY);
    if (!storedKey) return false;

    // Check if key matches current valid key
    if (storedKey !== VALID_KEY) return false;

    // Optional: Check expiry
    if (KEY_EXPIRY && new Date() > new Date(KEY_EXPIRY)) {
        localStorage.removeItem(STORAGE_KEY);
        return false;
    }

    return true;
};

export const unlock = (key) => {
    if (key === VALID_KEY) {
        localStorage.setItem(STORAGE_KEY, key);
        return true;
    }
    return false;
};

export const lock = () => {
    localStorage.removeItem(STORAGE_KEY);
};
