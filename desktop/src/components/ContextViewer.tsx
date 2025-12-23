import { useState, useEffect } from 'react';
import { FileText, RefreshCw } from 'lucide-react';

export function ContextViewer() {
    const [content, setContent] = useState<string>('Loading knowledge map...');
    const [loading, setLoading] = useState(false);

    const loadMap = async () => {
        setLoading(true);
        try {
            const map = await (window as any).electronAPI.getKnowledgeMap();
            setContent(map);
        } catch (error) {
            setContent(`Error loading map: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMap();
    }, []);

    return (
        <div className="flex flex-col h-full bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-900/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-500/10">
                        <FileText className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Context Viewer</h2>
                        <p className="text-xs text-zinc-400">Knowledge Graph View</p>
                    </div>
                </div>
                <button
                    onClick={loadMap}
                    disabled={loading}
                    className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex-1 overflow-auto p-4 font-mono text-sm text-zinc-300">
                <pre className="whitespace-pre-wrap">{content}</pre>
            </div>
        </div>
    );
}
