// Provider configurations for AI CLIs
// VERIFIED CLI package names from official sources (December 2024)
// Includes install commands for auto-installation
export interface ProviderConfig {
    id: string
    name: string
    color: string
    models: { id: string; name: string; description?: string }[]
    cli: string
    args: string[]
    envKey: string
    // Install command for CLIs that need global installation
    installCommand?: {
        windows: string
        unix: string
    }
}

export const PROVIDERS: Record<string, ProviderConfig> = {
    anthropic: {
        id: 'anthropic',
        name: 'Claude',
        color: 'text-orange-400',
        models: [
            { id: 'claude-sonnet-4', name: 'Sonnet 4', description: 'Balanced performance' },
            { id: 'claude-opus-4', name: 'Opus 4', description: 'Most capable' },
            { id: 'claude-haiku', name: 'Haiku', description: 'Fast & efficient' },
        ],
        cli: 'claude',
        args: [],
        envKey: 'ANTHROPIC_API_KEY',
        installCommand: {
            windows: 'npm install -g @anthropic-ai/claude-code',
            unix: 'npm install -g @anthropic-ai/claude-code'
        }
    },
    google: {
        id: 'google',
        name: 'Gemini',
        color: 'text-blue-400',
        models: [
            { id: 'gemini-2.5-pro', name: '2.5 Pro', description: 'Most capable' },
            { id: 'gemini-2.5-flash', name: '2.5 Flash', description: 'Fast & efficient' },
        ],
        // Uses npx - auto-downloads, no install needed
        cli: 'npx',
        args: ['-y', '@google/gemini-cli'],
        envKey: 'GOOGLE_API_KEY'
    },
    openai: {
        id: 'openai',
        name: 'Codex',
        color: 'text-green-400',
        models: [
            { id: 'gpt-4o', name: 'GPT-4o', description: 'Multimodal flagship' },
            { id: 'o1', name: 'o1', description: 'Reasoning model' },
            { id: 'o3-mini', name: 'o3-mini', description: 'Fast reasoning' },
        ],
        // Uses npx - auto-downloads, no install needed
        cli: 'npx',
        args: ['-y', '@openai/codex'],
        envKey: 'OPENAI_API_KEY'
    },
    opencode: {
        id: 'opencode',
        name: 'OpenCode',
        color: 'text-purple-400',
        models: [
            { id: 'default', name: 'Multi-Model', description: 'GPT, Claude, Gemini, Ollama' },
        ],
        cli: 'opencode',
        args: [],
        envKey: '', // OpenCode uses its own config
        installCommand: {
            windows: 'powershell -Command "irm https://opencode.ai/install | iex"',
            unix: 'curl -fsSL https://opencode.ai/install | bash'
        }
    },
    cursor: {
        id: 'cursor',
        name: 'Cursor',
        color: 'text-cyan-400',
        models: [
            { id: 'default', name: 'Cursor AI', description: 'GPT-5, Claude 4' },
        ],
        cli: 'cursor',
        args: [],
        envKey: '', // Cursor uses its own auth
        installCommand: {
            windows: 'powershell -Command "irm https://cursor.com/install | iex"',
            unix: 'curl -fsSL https://cursor.com/install | bash'
        }
    },
    shell: {
        id: 'shell',
        name: 'Shell',
        color: 'text-zinc-400',
        models: [
            { id: 'default', name: 'Default Shell', description: 'PowerShell / Zsh' },
        ],
        cli: 'shell',
        args: [],
        envKey: ''
    }
}

export const getProviderById = (id: string): ProviderConfig | undefined => {
    return PROVIDERS[id]
}

export const getModelById = (providerId: string, modelId: string) => {
    const provider = PROVIDERS[providerId]
    return provider?.models.find(m => m.id === modelId)
}

export const getDefaultModel = (providerId: string): string => {
    const provider = PROVIDERS[providerId]
    return provider?.models[0]?.id || 'default'
}
