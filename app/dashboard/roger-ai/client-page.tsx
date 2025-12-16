'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Send, Bot, Wifi, WifiOff, Copy, Terminal, RefreshCw, CheckCircle2, AlertCircle, Settings2, Server } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { buildOfflineContext } from '@/lib/ai/local-context';

// Simplified scripts that focus ONLY on the network access/CORS issue
const WINDOWS_SCRIPT = `# Run this in PowerShell as Administrator to unlock Roger
[Environment]::SetEnvironmentVariable("OLLAMA_ORIGINS", "*", "User")
Write-Host "Security unlocked! Please RIGHT-CLICK the Ollama icon in your tray, select QUIT, and then restart it."
`;

const MAC_LINUX_SCRIPT = `# Run this in Terminal to unlock Roger
launchctl setenv OLLAMA_ORIGINS "*"
# Or if running manually: OLLAMA_ORIGINS="*" ollama serve
echo "Security unlocked! Please Restart Ollama."
`;

type LocalModel = {
    name: string;
    size: number;
    details: { parameter_size?: string; family?: string };
};

export default function RogerPage() {
  const [mode, setMode] = useState<'local' | 'cloud'>('cloud');
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [input, setInput] = useState('');

  // Local State
  const [isLocalConnected, setIsLocalConnected] = useState(false);
  const [localModels, setLocalModels] = useState<LocalModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isWindows, setIsWindows] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { messages, setMessages, status, append } = useChat({
    api: '/api/chat',
    onError: (err) => {
        toast.error("Cloud Chat Error: " + err.message);
    }
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // Detect OS for script display
  useEffect(() => {
      if (typeof navigator !== 'undefined') {
          setIsWindows(navigator.userAgent.includes('Windows'));
      }
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }
  }, [messages, status]);

  // Check Local Connection on Mode Switch
  useEffect(() => {
      if (mode === 'local') {
          checkLocalConnection();
      }
  }, [mode]);

  const checkLocalConnection = async () => {
      setIsCheckingConnection(true);
      setConnectionError(null);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2000ms timeout

      try {
          // We fetch the 'tags' endpoint to list models. This confirms connectivity AND gets us useful data.
          const res = await fetch('http://localhost:11434/api/tags', {
              signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (!res.ok) throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);

          const data = await res.json();
          setLocalModels(data.models || []);
          setIsLocalConnected(true);
          setConnectionError(null);

          // Auto-select a model if none selected
          if (data.models?.length > 0 && !selectedModel) {
              // Prefer llama3 if available, otherwise first one
              const bestMatch = data.models.find((m: any) => m.name.includes('llama3')) || data.models[0];
              setSelectedModel(bestMatch.name);
          }

          if (!isLocalConnected) {
             toast.success("Connected to Local Roger!");
          }
      } catch (err: any) {
          console.error("Local connection error:", err);
          setIsLocalConnected(false);
          setLocalModels([]);

          let errorMessage = "Unknown Error";
          if (err.name === 'AbortError') {
              errorMessage = "Connection Timed Out (Is Ollama running?)";
          } else if (err.message.includes('Failed to fetch')) {
              errorMessage = "Network Error (Is Ollama running? Check CORS.)";
          } else {
              errorMessage = err.message;
          }
          setConnectionError(errorMessage);

          // Only show modal automatically if user explicitly clicked retry or switched modes
          if (mode === 'local') setShowSetupModal(true);
      } finally {
          setIsCheckingConnection(false);
      }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Script copied to clipboard");
  };

  const renderMessageContent = (m: any) => {
      if (Array.isArray(m.parts)) {
          return m.parts.map((p: any) => p.text || '').join('');
      }
      return m.content || '';
  };

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!isLocalConnected) {
        setShowSetupModal(true);
        return;
    }

    const currentInput = input;
    setInput('');

    // Add user message
    const userMessage = { role: 'user' as const, id: Date.now().toString(), content: currentInput };
    // @ts-ignore
    setMessages(prev => [...prev, userMessage]);

    // Add placeholder assistant message
    const assistantId = (Date.now() + 1).toString();
    // @ts-ignore
    setMessages(prev => [...prev, { role: 'assistant', id: assistantId, content: '' }]);

    try {
        const localContext = await buildOfflineContext();
        const systemPrompt = `You are ROGER, a Tactical Advisor.

[LIVE INTEL]
${localContext}

[INSTRUCTIONS]
Use the [LIVE INTEL] above to answer the user's questions about their inventory, kits, and plans.
Be concise, practical, and focused on preparedness.`;

        const contextMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({
                role: m.role,
                content: renderMessageContent(m)
            })),
            { role: 'user', content: currentInput }
        ];

        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: selectedModel || 'llama3',
                messages: contextMessages,
                stream: true
            })
        });

        if (!response.ok) throw new Error("Ollama API Error");

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No stream");

        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line

            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const json = JSON.parse(line);
                    if (json.message?.content) {
                        fullContent += json.message.content;
                        setMessages(prev => {
                            const newMsgs = [...prev];
                            const idx = newMsgs.findIndex(m => m.id === assistantId);
                            if (idx !== -1) {
                                // @ts-ignore
                                newMsgs[idx] = { ...newMsgs[idx], content: fullContent };
                            }
                            return newMsgs;
                        });
                    }
                } catch (e) { /* ignore parse errors */ }
            }
        }
    } catch (err) {
        console.error(err);
        toast.error("Failed to talk to local AI. Check connection.");
        setMessages(prev => prev.filter(m => m.id !== assistantId));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'local') {
        handleLocalSubmit(e);
        return;
    }

    if (!input.trim()) return;
    const currentInput = input;
    setInput('');

    // 1. Optimistically add User Message
    const userMsg = { id: Date.now().toString(), role: 'user', content: currentInput };
    // @ts-ignore
    setMessages(prev => [...prev, userMsg]);

    // 2. Build Context
    let context = '';
    try {
        context = await buildOfflineContext();
    } catch (e) {
        console.error("Context error", e);
    }

    try {
        // 3. Send Manual Request (Standard HTTP)
        const payload = {
            messages: [...messages, userMsg],
            context: context
        };

        console.log("Sending Payload:", payload);

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Server ${response.status}: ${errText}`);
        }

        const data = await response.json();

        if (data.error) throw new Error(data.error);

        // 4. Add AI Response
        const aiMsg = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.content };
        // @ts-ignore
        setMessages(prev => [...prev, aiMsg]);

    } catch (err: any) {
        console.error("Chat Failed:", err);
        toast.error("Roger is offline: " + (err.message || "Connection failed"));
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl h-[calc(100vh-2rem)] flex flex-col">
      <Card className="flex-1 flex flex-col min-h-0 shadow-lg border-2">

        {/* Header */}
        <CardHeader className="border-b pb-4 bg-card/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="p-2.5 bg-orange-500/10 rounded-xl relative">
                        <Bot className="w-6 h-6 text-orange-600 dark:text-orange-500" />
                        {mode === 'local' && (
                            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${isLocalConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        )}
                    </div>
                    <div>
                        <CardTitle className="text-xl">Roger AI</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                            {mode === 'local' ? (
                                isLocalConnected ?
                                <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Local Brain Active</span> :
                                <span className="text-red-500 flex items-center gap-1" title={connectionError || ''}><AlertCircle className="w-3 h-3"/> {connectionError || "Local Brain Disconnected"}</span>
                            ) : "Cloud Assistant Ready"}
                        </CardDescription>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    {/* Model Selector (Local Mode Only) */}
                    {mode === 'local' && isLocalConnected && (
                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                            <SelectTrigger className="w-[180px] h-9 text-xs">
                                <SelectValue placeholder="Select Model" />
                            </SelectTrigger>
                            <SelectContent>
                                {localModels.map(m => (
                                    <SelectItem key={m.name} value={m.name} className="text-xs">
                                        {m.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {/* Mode Toggle */}
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border">
                        <Button
                            variant={mode === 'local' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setMode('local')}
                            className="gap-2 text-xs font-medium"
                        >
                            <WifiOff className="w-3.5 h-3.5" />
                            Local
                        </Button>
                        <Button
                            variant={mode === 'cloud' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setMode('cloud')}
                            className="gap-2 text-xs font-medium"
                        >
                            <Wifi className="w-3.5 h-3.5" />
                            Cloud
                        </Button>
                    </div>

                    {/* Setup Trigger */}
                    {mode === 'local' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => checkLocalConnection()}
                            title="Retry Connection"
                        >
                            <RefreshCw className={`w-4 h-4 ${isCheckingConnection ? 'animate-spin' : ''}`} />
                        </Button>
                    )}
                </div>
            </div>
        </CardHeader>

        {/* Chat Area */}
        <CardContent className="flex-1 p-0 min-h-0 relative bg-background/50">
            <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                <div className="space-y-6 pb-4 max-w-3xl mx-auto">
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground mt-20">
                            <Bot className="w-16 h-16 mx-auto mb-6 opacity-20" />
                            <h3 className="text-lg font-medium mb-2">Hello! I'm Roger.</h3>
                            <p className="max-w-md mx-auto">
                                I can help you create emergency plans, check inventory, or answer survival questions.
                            </p>
                            {mode === 'local' && !isLocalConnected && (
                                <div className="mt-6 p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg max-w-sm mx-auto">
                                    <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-3">
                                        Roger is not detected on your computer.
                                    </p>
                                    <Button size="sm" variant="destructive" onClick={() => setShowSetupModal(true)}>
                                        <Settings2 className="w-4 h-4 mr-2" />
                                        Unlock Local Connection
                                    </Button>
                                </div>
                            )}
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
                    placeholder={mode === 'local' ? (isLocalConnected ? `Message Roger (${selectedModel || 'Local'})...` : "Local Brain Disconnected") : "Message Roger (Cloud)..."}
                    className="flex-1"
                    disabled={mode === 'local' && !isLocalConnected}
                    autoFocus
                />
                <Button
                    type="submit"
                    disabled={(isLoading && mode === 'cloud') || (!input.trim()) || (mode === 'local' && !isLocalConnected)}
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
                    Unlock Local Connection
                </DialogTitle>
                <DialogDescription className="text-base pt-2">
                    To let this website talk to your local Roger (Ollama), you need to allow "Cross-Origin" access.
                    Run one of these commands once to unlock it.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                <div className="space-y-3">
                    <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur py-2 z-10 border-b">
                        <Label className="flex items-center gap-2 font-bold text-foreground">
                            <Terminal className="w-4 h-4" />
                            Windows (PowerShell Admin)
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
                            Mac / Linux (Terminal)
                        </Label>
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(MAC_LINUX_SCRIPT)} className="h-8">
                            <Copy className="w-3 h-3 mr-2" />
                            Copy
                        </Button>
                    </div>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-xl text-xs overflow-x-auto font-mono custom-scrollbar border shadow-inner">
                        {MAC_LINUX_SCRIPT}
                    </pre>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
