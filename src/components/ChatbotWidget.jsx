import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', content: 'Hi! Ask me to analyze any news topic.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get response');
            }

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'bot', content: data.reply }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'bot', content: `Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleChat = () => setIsOpen(!isOpen);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-[350px] sm:w-[400px] h-[500px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700/50">
                                <img src="/bot-icon.png" alt="Bot" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm leading-tight">News Analyst</h3>
                                <p className="text-slate-400 text-xs">Powered by Gemini</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleChat}
                            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'bot' && (
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-slate-700">
                                        <img src="/bot-icon.png" alt="Bot" className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-sm'
                                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm prose prose-invert prose-sm max-w-none'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        msg.content
                                    ) : (
                                        <div dangerouslySetInnerHTML={{
                                            __html: msg.content
                                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                .replace(/\n/g, '<br />')
                                        }} />
                                    )}
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center border border-slate-700">
                                        <User className="w-4 h-4 text-slate-400" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-slate-700">
                                    <img src="/bot-icon.png" alt="Bot" className="w-full h-full object-cover" />
                                </div>
                                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm p-3 flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                                    <span className="text-slate-400 text-xs">Analyzing...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 bg-slate-800 border-t border-slate-700">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about a news topic..."
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="w-16 h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all transform hover:scale-105 overflow-hidden p-0"
                >
                    <img src="/bot-icon.png" alt="Chat" className="w-full h-full object-cover" />
                </button>
            )}
        </div>
    );
};

export default ChatbotWidget;
