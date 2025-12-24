
import { useState } from 'react';
import type { Project, AutoBuildVersionInfo } from '../../../shared/types';

export function useProjectSettings(_project: Project, _open: boolean) {
    const [settings, setSettings] = useState<any>({});
    const [versionInfo, setVersionInfo] = useState<AutoBuildVersionInfo | null>(null);
    const [isCheckingVersion, _setIsCheckingVersion] = useState(false);

    return {
        settings,
        setSettings,
        versionInfo,
        setVersionInfo,
        isCheckingVersion
    };
}
