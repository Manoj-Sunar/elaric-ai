import React, { useState, useRef, useEffect } from "react";
import ChatPreview from "./ChatPreview";
import TextInput from "../TextInput";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const BaseChat = ({ onFirstPrompt = () => {}, sessionInfo }) => {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef(null);

  // 🔽 Scroll to bottom
  const scrollToBottom = (instant = false) => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: instant ? "auto" : "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages.length]);

  useEffect(() => {
    if (loading) scrollToBottom();
  }, [loading, messages]);

  const handlePromptSubmit = async (text) => {
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setLoading(true);

    // ⚡ Immediately create temporary session for emulator
    const placeholderSession = await createSessionOnBackend("// Initializing preview...");
    onFirstPrompt("// Initializing preview...", placeholderSession);

    try {
      const aiRes = await fetch(`${API_BASE}/api/ai/generate-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      const aiJson = await aiRes.json();
      const aiResponse = aiJson.text || "No response from AI.";

      // ✍️ Typing effect
      let typed = "";
      const speed = 15;
      for (let i = 0; i < aiResponse.length; i++) {
        typed += aiResponse[i];
        await new Promise((r) => setTimeout(r, speed));
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[updated.length - 1]?.role === "ai") {
            updated[updated.length - 1].content = typed;
          } else {
            updated.push({ role: "ai", content: typed });
          }
          return updated;
        });
        scrollToBottom();
      }

      // ✅ Update backend session
      const updatedSession = await createSessionOnBackend(aiResponse);
      onFirstPrompt(aiResponse, updatedSession);
    } catch (err) {
      console.error("AI error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "❌ Error generating AI response." },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const createSessionOnBackend = async (aiOutput) => {
    const project = {
      title: "AI Preview",
      html: `<div style="font-family:system-ui;padding:20px;color:#111;background:#fff;border-radius:8px">
               <h2>AI Preview</h2>
               <pre style="white-space:pre-wrap; font-family:monospace">${escapeHtml(aiOutput)}</pre>
             </div>`,
      code: aiOutput,
    };

    const res = await fetch(`${API_BASE}/api/session/create-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project }),
    });

    if (!res.ok) throw new Error(`Failed to create session: ${res.status}`);
    return res.json();
  };

  const hasMessages = messages.length > 0;

  return (
    <div
      className={`relative flex flex-col w-full transition-all duration-500  ${
        hasMessages
          ? "h-[calc(100vh-2rem)] bg-[#171717] rounded-2xl border border-gray-800 overflow-hidden"
          : " bg-transparent p-2"
      }`}
    >
      {/* Chat content - only visible after first send */}
      {hasMessages && (
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-4 custom-scrollbar"
          style={{ scrollBehavior: "smooth" }}
        >
          <ChatPreview messages={messages} />

          {loading && (
            <p className="text-gray-500 text-sm text-center animate-pulse">
              ⏳ Thinking...
            </p>
          )}
        </div>
      )}

      {/* Input Section */}
      {hasMessages ? (
        // 🧠 Fixed at bottom after first send
        <div className="absolute bottom-0 left-0 w-full bg-[#171717]/95 backdrop-blur-md  px-4">
          <div className="max-w-2xl mx-auto">
            <TextInput
              prompt={prompt}
              setPrompt={setPrompt}
              onSubmit={handlePromptSubmit}
              placeholder="Describe your app or feature idea..."
              disabled={loading}
            />
          </div>
        </div>
      ) : (
        // 🎯 Centered input before first send
        <div className="flex flex-col items-center justify-center  text-center px-4">
          <div className="min-w-3xl w-full">
            
            <TextInput
              prompt={prompt}
              setPrompt={setPrompt}
              onSubmit={handlePromptSubmit}
              placeholder="Describe your app or feature idea..."
              disabled={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

function escapeHtml(text = "") {
  return String(text).replace(/[&<>"']/g, (m) =>
    (
      {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      }
    )[m]
  );
}

export default BaseChat;
