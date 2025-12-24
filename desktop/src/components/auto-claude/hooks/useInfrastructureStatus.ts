
import { useState } from 'react';

export function useInfrastructureStatus(_enabled: boolean | undefined, _dbPath: string | undefined, _open: boolean) {
    const [infrastructureStatus, _setInfrastructureStatus] = useState<'connected' | 'disconnected' | 'loading'>('disconnected');
    const [isCheckingInfrastructure, _setIsCheckingInfrastructure] = useState(false);

    return {
        infrastructureStatus,
        isCheckingInfrastructure
    };
}
