import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Copy, RefreshCw, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const API_URL = "https://lakshya-ai-backend.onrender.com/chat";

const suggestions = [
  "Explain Artificial Intelligence in simple terms.",
  "Summarize this topic for my exam preparation.",
  "Generate a quiz on Data Structures.",
  "Help me prepare for a technical interview.",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  // Session ID setup
  useEffect(() => {
    let stored = localStorage.getItem("session_id");
    if (!stored) {
      stored = crypto.randomUUID();
      localStorage.setItem("session_id", stored);
    }
    setSessionId(stored);
  }, []);

  // Load chat history
  useEffect(() => {
    if (!sessionId) return;

    const loadHistory = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(
          `${API_URL}/history?session_id=${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) return;
        const data = await res.json();

        if (data.session_id) {
          localStorage.setItem("session_id", data.session_id);
          setSessionId(data.session_id);
        }

        const formatted: Message[] = data.flatMap((c: any) => [
          {
            id: crypto.randomUUID(),
            role: "user",
            content: c.question,
            timestamp: new Date(c.created_at),
          },
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: c.answer,
            timestamp: new Date(c.created_at),
          },
        ]);

        setMessages(formatted);
      } catch (err) {
        console.error("History load failed", err);
      }
    };

    loadHistory();
  }, [sessionId]);

  // Send message
  const sendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login again");
      return;
    }

    setInput("");

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: messageText,
          session_id: sessionId,
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        alert("Session expired. Please login again.");
        window.location.href = "/login";
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Server error");
      }

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.data?.answer || "No response",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `❌ ${error.message || "Server error"}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Retry last user message
  const retryLast = () => {
    const lastUserMsg = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastUserMsg) setInput(lastUserMsg.content);
  };

  // Copy assistant message
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col justify-center"
      >
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-8 w-8 text-primary" />
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-2">
              What's on your mind?
            </h1>
            <p className="text-muted-foreground mb-6">
              Ask anything. Learn everything with Lakshya AI.
            </p>

            {/* Suggested Prompts */}
            <div className="grid sm:grid-cols-2 gap-3">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(suggestion)}
                  className="p-3 text-sm rounded-lg border bg-muted/40 hover:bg-muted transition"
                >
                  <Sparkles className="inline h-4 w-4 mr-2 text-primary" />
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-primary text-white"
                      : "bg-muted"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1 mb-2 text-xs text-muted-foreground">
                      <Bot className="h-3 w-3" />
                      AI
                    </div>
                  )}

                  <div className="text-sm whitespace-pre-wrap">
                    {msg.content}
                  </div>

                  {msg.role === "assistant" && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => copyMessage(msg.content)}>
                        <Copy className="h-4 w-4" />
                      </button>
                      <button onClick={retryLast}>
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {isTyping && (
          <div className="text-sm text-muted-foreground">
            AI is thinking...
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-3 sm:px-6 pb-4 pt-2 sticky bottom-0 bg-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 bg-[#0f172a] border border-blue-800 rounded-2xl px-3 py-2 shadow-lg focus-within:ring-2 focus-within:ring-blue-500">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything... What do you want to learn today?"
              rows={1}
              className="flex-1 resize-none bg-transparent text-gray-200 placeholder-gray-400 text-sm outline-none max-h-32 overflow-y-auto"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button
              onClick={() => sendMessage()}
              disabled={!input || isTyping}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 p-2 rounded-xl transition"
            >
              <Send className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}