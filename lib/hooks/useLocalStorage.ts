import { useState, useEffect } from 'react';

/**
 * Hydration-safe localStorage hook
 * Prevents hydration mismatches by loading from localStorage only after mount
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void, boolean] {
    const [value, setValue] = useState<T>(defaultValue);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
        try {
            const item = localStorage.getItem(key);
            if (item !== null) {
                setValue(JSON.parse(item));
            }
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
        }
    }, [key]);

    const setStoredValue = (newValue: T) => {
        setValue(newValue);
        if (isHydrated) {
            try {
                localStorage.setItem(key, JSON.stringify(newValue));
            } catch (error) {
                console.warn(`Error setting localStorage key "${key}":`, error);
            }
        }
    };

    return [value, setStoredValue, isHydrated];
}