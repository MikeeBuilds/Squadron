
import { useState } from 'react';

export function useClaudeAuth(_projectId: string, _autoBuildPath: string | undefined, _open: boolean) {
    const [isCheckingClaudeAuth, _setIsCheckingClaudeAuth] = useState(false);
    const [claudeAuthStatus, _setClaudeAuthStatus] = useState<'authenticated' | 'unauthenticated' | 'loading'>('unauthenticated');

    const handleClaudeSetup = (_callback: (config: any) => void) => {
        // Mock setup
        console.log('Mock Claude Setup');
    };

    return {
        isCheckingClaudeAuth,
        claudeAuthStatus,
        handleClaudeSetup
    };
}
