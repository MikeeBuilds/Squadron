import { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { getProviderById, PROVIDERS, type ProviderConfig } from '@/lib/providers'

interface XTermComponentProps {
    id: string
    onData?: (data: string) => void
    providerId?: string
    modelId?: string
    cwd?: string
    isActive?: boolean
}

export function XTermComponent({ id, providerId = 'shell', modelId, cwd, isActive }: XTermComponentProps) {
    const termRef = useRef<HTMLDivElement>(null)
    const terminalInstance = useRef<Terminal | null>(null)
    const fitAddon = useRef<FitAddon | null>(null)

    useEffect(() => {
        if (!termRef.current) return

        // Initialize xterm
        const term = new Terminal({
            cursorBlink: true,
            fontSize: 10,
            fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, "Courier New", monospace',
            fontWeight: 'normal',
            lineHeight: 1.1,
            letterSpacing: 0,
            allowTransparency: true,
            theme: {
                background: 'transparent',
                foreground: '#a1a1aa',
                cursor: '#eab308',
                selectionBackground: '#eab30833',
                black: '#09090b',
                red: '#ef4444',
                green: '#22c55e',
                yellow: '#eab308',
                blue: '#3b82f6',
                magenta: '#d946ef',
                cyan: '#06b6d4',
                white: '#e4e4e7',
            }
        })

        const fit = new FitAddon()
        term.loadAddon(fit)
        term.open(termRef.current)
        fit.fit()

        terminalInstance.current = term
        fitAddon.current = fit

        // Get provider configuration
        const provider = getProviderById(providerId) || PROVIDERS.shell
        const api = (window as any).electronAPI

        // Check if CLI needs installation and auto-install if needed
        const checkAndInstallCli = async (provider: ProviderConfig): Promise<boolean> => {
            // Skip for npx-based CLIs (they auto-download)
            if (provider.cli === 'npx' || provider.cli === 'shell') {
                return true
            }

            // Check if CLI is installed
            const isInstalled = await api.checkCliInstalled(provider.cli)

            if (!isInstalled && provider.installCommand) {
                term.writeln(`\x1b[33m[Squadron] ${provider.name} CLI not found. Installing...\x1b[0m`)
                term.writeln(`\x1b[90m$ ${provider.installCommand.windows || provider.installCommand.unix}\x1b[0m`)

                const command = globalThis?.process?.platform === 'win32'
                    ? provider.installCommand.windows
                    : provider.installCommand.unix

                const result = await api.installCli(command)

                if (result.success) {
                    term.writeln(`\x1b[32m[Squadron] ${provider.name} CLI installed successfully!\x1b[0m`)
                    term.writeln('')
                    return true
                } else {
                    term.writeln(`\x1b[31m[Squadron] Failed to install ${provider.name} CLI:\x1b[0m`)
                    term.writeln(`\x1b[31m${result.output}\x1b[0m`)
                    term.writeln('')
                    term.writeln(`\x1b[33mPlease install manually and try again.\x1b[0m`)
                    return false
                }
            }

            return isInstalled
        }

        // Build spawn configuration
        const spawnTerminal = async () => {
            let shell = provider.cli
            let args = [...provider.args]
            let env: Record<string, string> = {}

            // For AI providers, check and auto-install CLI if needed
            if (providerId !== 'shell') {
                const cliReady = await checkAndInstallCli(provider)
                if (!cliReady && provider.cli !== 'npx') {
                    return // Don't spawn if CLI couldn't be installed
                }
            }

            // For AI providers, get the API key and add to env
            if (providerId !== 'shell' && provider.envKey) {
                try {
                    const apiKey = await api.getApiKey(providerId)
                    if (apiKey) {
                        env[provider.envKey] = apiKey
                    }
                } catch (err) {
                    console.error(`Failed to get API key for ${providerId}:`, err)
                }
            }

            // Spawn the terminal with the correct CLI and env
            api.spawnTerminal(id, shell, args, cwd, env)
        }

        spawnTerminal()

        const cleanupData = api.onTerminalData(id, (data: string) => {
            term.write(data)
        })

        term.onData((data) => {
            api.writeTerminal(id, data)
        })

        const handleResize = () => {
            fit.fit()
            api.resizeTerminal(id, term.cols, term.rows)
        }

        window.addEventListener('resize', handleResize)

        // Initial resize
        setTimeout(handleResize, 100)

        return () => {
            cleanupData()
            window.removeEventListener('resize', handleResize)
            term.dispose()
        }
    }, [id, providerId, modelId, cwd])

    useEffect(() => {
        if (isActive && fitAddon.current) {
            setTimeout(() => {
                fitAddon.current?.fit()
                // Focus terminal when it becomes active
                terminalInstance.current?.focus()
            }, 100)
        }
    }, [isActive])

    // Focus terminal when clicked
    const handleClick = () => {
        terminalInstance.current?.focus()
    }

    return (
        <div
            className="h-full w-full bg-transparent p-0 overflow-hidden [&_.xterm-viewport]:scrollbar-hide cursor-text"
            onClick={handleClick}
        >
            <style dangerouslySetInnerHTML={{
                __html: `
                .xterm-viewport::-webkit-scrollbar { display: none !important; width: 0 !important; }
                .xterm-viewport { -ms-overflow-style: none !important; scrollbar-width: none !important; }
            `}} />
            <div ref={termRef} className="h-full w-full" />
        </div>
    )
}
