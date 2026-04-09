import { useState, useRef, useEffect } from "react";
import { Upload, Send, Loader2, FileText } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function PDFChatAssistant() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // =========================
  // AUTO SCROLL
  // =========================
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  // =========================
  // LOAD SESSION
  // =========================
  useEffect(() => {
    const saved = localStorage.getItem("pdf_chat_session");
    if (saved) setSessionId(saved);
  }, []);

  // =========================
  // UPLOAD PDF
  // =========================
  const uploadPDF = async (f: File) => {
    setUploading(true);
    setUploadError("");
    setPdfReady(false);

    const formData = new FormData();
    formData.append("file", f);

    try {
      const res = await fetch("https://lakshya-ai-backend.onrender.com/pdf/upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Upload failed");
      }

      setPdfReady(true);
    } catch (err: any) {
      setUploadError(err.message);
    }

    setUploading(false);
  };

  const handleFile = async (f: File) => {
    setFile(f);
    await uploadPDF(f);
  };

  // =========================
  // ASK QUESTION
  // =========================
  const askQuestion = async () => {
    if (!question.trim()) return;

    if (!pdfReady) {
      alert("Upload PDF first");
      return;
    }

    const userMsg: Message = {
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const currentQ = question;
    setQuestion("");

    try {
      const res = await fetch("https://lakshya-ai-backend.onrender.com/pdf/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          question: currentQ,
          session_id: sessionId,
        }),
      });

      const data = await res.json();

      // SAVE SESSION
      if (!sessionId && data.session_id) {
        setSessionId(data.session_id);
        localStorage.setItem("pdf_chat_session", data.session_id);
      }

      const botMsg: Message = {
        role: "assistant",
        content:
          data?.data?.answer || data?.response || "No response from AI",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Error occurred" },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] text-white">

      {/* HEADER */}
      <div className="px-4 py-3 border-b border-blue-900">
        <h1 className="text-lg font-semibold">📄 PDF Assistant</h1>
        <p className="text-xs text-blue-300">
          Ask anything about your PDF
        </p>
      </div>

      {/* UPLOAD */}
      <div className="px-4 py-3 border-b border-blue-900 flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept=".pdf"
          hidden
          ref={fileInputRef}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm"
        >
          <Upload className="h-4 w-4" />
          {file ? "Change PDF" : "Upload PDF"}
        </button>

        {file && (
          <div className="text-xs text-blue-300 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {file.name}
          </div>
        )}

        {uploading && (
          <div className="flex items-center gap-2 text-xs text-blue-300">
            <Loader2 className="animate-spin h-4 w-4" />
            Processing...
          </div>
        )}

        {uploadError && (
          <div className="text-red-400 text-xs">{uploadError}</div>
        )}

        {pdfReady && (
          <div className="text-green-400 text-xs">✅ Ready</div>
        )}
      </div>

      {/* CHAT AREA */}
      <div
        ref={chatRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-3">
              📄 Chat with your PDF
            </h2>
            <p className="text-blue-300 text-sm sm:text-base max-w-md">
              Upload a document and ask questions. Get instant answers,
              summaries, and explanations powered by AI.
            </p>
            {!pdfReady && (
              <p className="mt-4 text-xs text-gray-400">
                Start by uploading a PDF above 👆
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`
                    max-w-[85%] sm:max-w-[65%]
                    px-4 py-3 rounded-2xl text-sm
                    ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-[#0f172a] border border-blue-900 text-gray-200"
                    }
                  `}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-sm text-blue-400 animate-pulse">
                AI is thinking...
              </div>
            )}
          </div>
        )}
      </div>

      {/* INPUT (FIXED LIKE CHAT PAGE) */}
      <div className="px-3 sm:px-6 pb-4 pt-2 bg-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="
            flex items-center gap-2
            bg-[#0f172a] border border-blue-800
            rounded-2xl px-3 py-2
            shadow-lg
            focus-within:ring-2 focus-within:ring-blue-500
          ">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={
                pdfReady
                  ? "Message PDF AI..."
                  : "Upload a PDF first..."
              }
              rows={1}
              className="
                flex-1 resize-none bg-transparent
                text-gray-200 placeholder-gray-400
                text-sm outline-none
                max-h-32 overflow-y-auto
              "
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  askQuestion();
                }
              }}
            />

            <button
              onClick={askQuestion}
              disabled={!pdfReady || loading || !question.trim()}
              className="
                bg-blue-600 hover:bg-blue-700
                disabled:opacity-50
                p-2 rounded-xl
                transition
              "
            >
              <Send className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}