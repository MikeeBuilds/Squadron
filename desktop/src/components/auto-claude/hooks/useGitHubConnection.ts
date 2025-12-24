
import { useState } from 'react';

export function useGitHubConnection(_projectId: string, _enabled: boolean | undefined, _token: string | undefined, _repo: string | undefined) {
    const [gitHubConnectionStatus, _setGitHubConnectionStatus] = useState<'connected' | 'disconnected' | 'loading'>('disconnected');
    const [isCheckingGitHub, _setIsCheckingGitHub] = useState(false);

    return {
        gitHubConnectionStatus,
        isCheckingGitHub
    };
}
