// A simple wrapper around localStorage that handles potential SecurityErrors
// common in iframe environments.

export const safeStorage = {
    getItem: (key: string): string | null => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn(`safeStorage: Could not getItem for ${key}`, e);
            return null;
        }
    },
    setItem: (key: string, value: string): void => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn(`safeStorage: Could not setItem for ${key}`, e);
        }
    },
    removeItem: (key: string): void => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn(`safeStorage: Could not removeItem for ${key}`, e);
        }
    }
};
