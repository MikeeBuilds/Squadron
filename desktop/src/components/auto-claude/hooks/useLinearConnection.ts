
import { useState } from 'react';

export function useLinearConnection(_projectId: string, _enabled: boolean | undefined, _apiKey: string | undefined) {
    const [linearConnectionStatus, _setLinearConnectionStatus] = useState<'connected' | 'disconnected' | 'loading'>('disconnected');
    const [isCheckingLinear, _setIsCheckingLinear] = useState(false);

    return {
        linearConnectionStatus,
        isCheckingLinear
    };
}
