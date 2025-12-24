
import { useState } from 'react';

export function useEnvironmentConfig(_projectId: string, _autoBuildPath: string | undefined, _open: boolean) {
    const [envConfig, setEnvConfig] = useState<any>(null);
    const [isLoadingEnv, _setIsLoadingEnv] = useState(false);
    const [envError, setEnvError] = useState<string | null>(null);
    const [isSavingEnv, _setIsSavingEnv] = useState(false);

    const updateEnvConfig = async (updates: any) => {
        setEnvConfig((prev: any) => ({ ...prev, ...updates }));
    };

    return {
        envConfig,
        setEnvConfig,
        updateEnvConfig,
        isLoadingEnv,
        envError,
        setEnvError,
        isSavingEnv
    };
}
