import { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/helpers';

const RecentlyViewedContext = createContext(null);

export function RecentlyViewedProvider({ children }) {
    const [items, setItems] = useState(() => {
        const saved = storage.get('recentlyViewed');
        return saved || [];
    });

    useEffect(() => {
        storage.set('recentlyViewed', items);
    }, [items]);

    const addItem = (note) => {
        setItems(prev => {
            // Remove if already exists, then add to front
            const filtered = prev.filter(i => i.id !== note.id);
            return [note, ...filtered].slice(0, 10); // Keep only last 10
        });
    };

    const clearItems = () => {
        setItems([]);
        storage.remove('recentlyViewed');
    };

    const value = {
        items,
        addItem,
        clearItems,
    };

    return (
        <RecentlyViewedContext.Provider value={value}>
            {children}
        </RecentlyViewedContext.Provider>
    );
}

export function useRecentlyViewed() {
    const context = useContext(RecentlyViewedContext);
    if (!context) {
        throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
    }
    return context;
}
