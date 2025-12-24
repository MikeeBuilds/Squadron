import { useEffect } from 'react';

// Simplified hook to satisfy build and provide basic listening structure
export function useIpcListeners() {
    useEffect(() => {
        // Setup global listeners if needed
        // For now, it might be empty or handling basic events

        return () => {
            // Cleanup
        };
    }, []);
}
