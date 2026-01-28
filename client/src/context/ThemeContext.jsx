import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

// Storage helper
const storage = {
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            console.error('Failed to save to localStorage');
        }
    },
};

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(() => {
        const saved = storage.get('darkMode');
        if (saved !== null) return saved;
        // Check system preference
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;

        if (isDark) {
            // Add dark mode classes and attributes
            root.classList.add('dark');
            root.setAttribute('data-theme', 'dark');
            body.classList.add('dark');
            body.style.colorScheme = 'dark';
        } else {
            // Remove dark mode classes and attributes
            root.classList.remove('dark');
            root.setAttribute('data-theme', 'light');
            body.classList.remove('dark');
            body.style.colorScheme = 'light';
        }

        // Save preference
        storage.set('darkMode', isDark);
    }, [isDark]);

    // Listen for system preference changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            const saved = storage.get('darkMode');
            // Only auto-switch if user hasn't manually set preference
            if (saved === null) {
                setIsDark(e.matches);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggle = useCallback(() => {
        setIsDark(prev => !prev);
    }, []);

    const setTheme = useCallback((dark) => {
        setIsDark(dark);
    }, []);

    // Theme-aware colors
    const colors = isDark ? {
        bg: '#0f172a',
        bgSecondary: '#1e293b',
        bgTertiary: '#334155',
        bgCard: '#1e293b',
        bgCardHover: '#334155',
        text: '#f8fafc',
        textSecondary: '#cbd5e1',
        textTertiary: '#94a3b8',
        textMuted: '#64748b',
        border: '#334155',
        borderLight: '#475569',
    } : {
        bg: '#ffffff',
        bgSecondary: '#f8fafc',
        bgTertiary: '#f1f5f9',
        bgCard: '#ffffff',
        bgCardHover: '#f8fafc',
        text: '#0f172a',
        textSecondary: '#475569',
        textTertiary: '#64748b',
        textMuted: '#94a3b8',
        border: '#e2e8f0',
        borderLight: '#f1f5f9',
    };

    const value = {
        isDark,
        toggle,
        setTheme,
        colors,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        // Return a fallback for components not wrapped in ThemeProvider
        return {
            isDark: false,
            toggle: () => { },
            setTheme: () => { },
            colors: {
                bg: '#ffffff',
                bgSecondary: '#f8fafc',
                bgTertiary: '#f1f5f9',
                bgCard: '#ffffff',
                bgCardHover: '#f8fafc',
                text: '#0f172a',
                textSecondary: '#475569',
                textTertiary: '#64748b',
                textMuted: '#94a3b8',
                border: '#e2e8f0',
                borderLight: '#f1f5f9',
            },
        };
    }
    return context;
}

// Hook to get CSS variable aware styles
export function useThemeStyles() {
    const { isDark, colors } = useTheme();

    return {
        isDark,
        colors,
        getStyle: (lightStyle, darkStyle) => isDark ? darkStyle : lightStyle,
    };
}
