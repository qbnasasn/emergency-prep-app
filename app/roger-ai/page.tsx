'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Send, Bot, Wifi, WifiOff, Copy, Terminal, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const WINDOWS_SCRIPT = `@echo off
title Roger AI Setup
echo Setting up Local Brain...

:: Check for Ollama
where ollama >nul 2>nul
if %errorlevel% neq 0 (
    echo Ollama not found. Installing...
    winget install Ollama.Ollama
)

:: Pull Llama 3 Model
echo Downloading Brain (Llama 3)...
ollama pull llama3

:: Set CORS to allow browser access (Critical)
set OLLAMA_ORIGINS="*"

:: Start Server
echo Roger is ready! Keep this window open.
ollama serve
`;

const LINUX_SCRIPT = `#!/bin/bash
echo "Setting up Local Brain..."

# Check for Ollama
if ! command -v ollama &> /dev/null; then
    curl -fsSL https://ollama.com/install.sh | sh
fi

# Pull Llama 3 Model
ollama pull llama3

# Set CORS and Start
export OLLAMA_ORIGINS="*"
echo "Roger is ready! Keep this terminal open."
ollama serve
`;

export default function RogerPage() {
  const [mode, setMode] = useState<'local' | 'cloud'>('cloud');
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { messages, setMessages, status, sendMessage } = useChat({
    api: '/api/chat',
    onError: (err) => {
        toast.error("Cloud Chat Error: " + err.message);
    }
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }
  }, [messages, status]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Script copied to clipboard");
  };

  const renderMessageContent = (m: any) => {
      if (Array.isArray(m.parts)) {
          return m.parts.map((p: any, i: number) => {
              if (p.type === 'text') return p.text;
              return '';
          }).join('');
      }
      if (typeof m.content === 'string') return m.content;
      return '';
  };

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const currentInput = input;
    setInput(''); // Clear input immediately

    // Add user message to state
    const userMessage = {
        role: 'user' as const,
        id: Date.now().toString(),
        parts: [{ type: 'text', text: currentInput }]
    };

    // @ts-ignore
    setMessages(prev => [...prev, userMessage]);

    // Create a placeholder for assistant message
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage = {
        role: 'assistant' as const,
        id: assistantMessageId,
        parts: [{ type: 'text', text: '' }]
    };

    // @ts-ignore
    setMessages(prev => [...prev, assistantMessage]);

    try {
        // Prepare context for Ollama (history + new message)
        const contextMessages = messages.map(m => ({
            role: m.role,
            content: renderMessageContent(m)
        }));
        // Append the new user message (since 'messages' state update might be async/batched, but here we use prev logic, but for fetching we need current)
        // Actually messages from useChat might not be updated yet.
        // So we append mapped messages + current input.
        contextMessages.push({ role: 'user', content: currentInput });

        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3',
                messages: contextMessages,
                stream: true
            })
        });

        if (!response.ok) {
            throw new Error("Failed to connect to Local Roger");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        let assistantContent = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
                try {
                    const json = JSON.parse(line);
                    if (json.message?.content) {
                        assistantContent += json.message.content;

                        setMessages(prev => {
                            const newMessages = [...prev];
                            const index = newMessages.findIndex(m => m.id === assistantMessageId);
                            if (index !== -1) {
                                // @ts-ignore
                                newMessages[index] = {
                                    ...newMessages[index],
                                    parts: [{ type: 'text', text: assistantContent }]
                                };
                            }
                            return newMessages;
                        });
                    }
                } catch (e) {
                    console.error("Error parsing JSON chunk from Ollama", e);
                }
            }
        }

    } catch (error) {
        console.error("Local Roger Error:", error);
        setMessages(prev => prev.filter(m => m.id !== assistantMessageId));
        setShowSetupModal(true);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (mode === 'local') {
        handleLocalSubmit(e);
    } else {
        const currentInput = input;
        setInput('');
        await sendMessage({ text: currentInput });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl h-[calc(100vh-2rem)] flex flex-col">
      <Card className="flex-1 flex flex-col min-h-0 shadow-lg border-2">
        <CardHeader className="border-b pb-4 bg-card/50">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-500/10 rounded-xl">
                        <Bot className="w-6 h-6 text-orange-600 dark:text-orange-500" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Roger AI</CardTitle>
                        <CardDescription>Your personal preparedness assistant</CardDescription>
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border">
                    <Button
                        variant={mode === 'local' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setMode('local')}
                        className={`gap-2 text-xs font-medium transition-all ${mode === 'local' ? 'shadow-sm' : ''}`}
                    >
                        <WifiOff className="w-3.5 h-3.5" />
                        Local
                    </Button>
                    <Button
                        variant={mode === 'cloud' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setMode('cloud')}
                        className={`gap-2 text-xs font-medium transition-all ${mode === 'cloud' ? 'shadow-sm' : ''}`}
                    >
                        <Wifi className="w-3.5 h-3.5" />
                        Cloud
                    </Button>
                </div>
            </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 min-h-0 relative bg-background/50">
            <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                <div className="space-y-6 pb-4 max-w-3xl mx-auto">
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground mt-20">
                            <Bot className="w-16 h-16 mx-auto mb-6 opacity-20" />
                            <h3 className="text-lg font-medium mb-2">Hello! I'm Roger.</h3>
                            <p>How can I help you prepare today?</p>
                            <p className="text-sm opacity-60 mt-4 bg-muted/50 inline-block px-3 py-1 rounded-full border">
                                Running in <span className="font-semibold text-foreground">{mode === 'local' ? 'Local (Ollama)' : 'Cloud (Groq)'}</span> mode
                            </p>
                        </div>
                    )}

                    {messages.map(m => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm ${
                                    m.role === 'user'
                                    ? 'bg-orange-600 text-white rounded-br-sm'
                                    : 'bg-white dark:bg-muted text-foreground rounded-bl-sm border'
                                }`}
                            >
                                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                                    {renderMessageContent(m)}
                                </p>
                            </div>
                        </div>
                    ))}
                    {isLoading && mode === 'cloud' && (
                        <div className="flex justify-start">
                             <div className="bg-white dark:bg-muted text-foreground rounded-2xl rounded-bl-sm px-5 py-3.5 border shadow-sm flex items-center gap-2">
                                <Bot className="w-4 h-4 animate-bounce opacity-50" />
                                <span className="text-sm opacity-70">Roger is thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </CardContent>

        <div className="p-4 border-t bg-card">
            <form onSubmit={onSubmit} className="max-w-3xl mx-auto flex gap-3">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={mode === 'local' ? "Message Roger (Local mode - Offline capable)..." : "Message Roger (Cloud mode - Powered by Groq)..."}
                    className="flex-1"
                    autoFocus
                />
                <Button
                    type="submit"
                    disabled={(isLoading && mode === 'cloud') || (!input.trim())}
                    className="bg-orange-600 hover:bg-orange-700 text-white w-12 px-0"
                >
                    <Send className="w-5 h-5" />
                    <span className="sr-only">Send</span>
                </Button>
            </form>
        </div>
      </Card>

      <Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                    <Server className="w-5 h-5 text-orange-500" />
                    Local Roger Setup Required
                </DialogTitle>
                <DialogDescription className="text-base pt-2">
                    Roger couldn't connect to your local Ollama instance at <code className="text-xs bg-muted px-1 py-0.5 rounded">localhost:11434</code>.
                    Please run one of the scripts below to initialize your local AI brain.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                <div className="space-y-3">
                    <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur py-2 z-10 border-b">
                        <Label className="flex items-center gap-2 font-bold text-foreground">
                            <Terminal className="w-4 h-4" />
                            Windows (setup_roger.bat)
                        </Label>
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(WINDOWS_SCRIPT)} className="h-8">
                            <Copy className="w-3 h-3 mr-2" />
                            Copy
                        </Button>
                    </div>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-xl text-xs overflow-x-auto font-mono custom-scrollbar border shadow-inner">
                        {WINDOWS_SCRIPT}
                    </pre>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur py-2 z-10 border-b">
                        <Label className="flex items-center gap-2 font-bold text-foreground">
                            <Terminal className="w-4 h-4" />
                            Linux / Mac (setup_roger.sh)
                        </Label>
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(LINUX_SCRIPT)} className="h-8">
                            <Copy className="w-3 h-3 mr-2" />
                            Copy
                        </Button>
                    </div>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-xl text-xs overflow-x-auto font-mono custom-scrollbar border shadow-inner">
                        {LINUX_SCRIPT}
                    </pre>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
