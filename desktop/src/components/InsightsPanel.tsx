import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function InsightsPanel() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            // Add generic loading placeholder
            setMessages(prev => [...prev, { role: 'assistant', content: 'Thinking...' }]);

            const response = await (window as any).electronAPI.askInsights(userMsg);

            // Replace placeholder
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs.pop(); // remove thinking
                return [...newMsgs, { role: 'assistant', content: response }];
            });
        } catch (error) {
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs.pop(); // remove thinking
                return [...newMsgs, { role: 'assistant', content: `Error: ${error}` }];
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-zinc-900/50">
                <div className="p-2 rounded-lg bg-purple-500/10">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white">Insights</h2>
                    <p className="text-xs text-zinc-400">Ask about your codebase</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-zinc-500 mt-20">
                        <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Ask me anything about your project's architecture, dependencies, or logic.</p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user'
                                ? 'bg-teal-600 text-white'
                                : 'bg-zinc-800 text-zinc-200 border border-white/5'
                            }`}>
                            <div className="flex items-center gap-2 mb-1 text-xs opacity-50">
                                {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                <span>{msg.role === 'user' ? 'You' : 'Squadron AI'}</span>
                            </div>
                            <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/10 bg-zinc-900/80">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="How does the fs_tool work?"
                        className="flex-1 bg-zinc-800 border-none rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="p-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg disabled:opacity-50 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
