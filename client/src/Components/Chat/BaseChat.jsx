import React, { useState, useRef, useEffect } from "react";
import ChatPreview from "./ChatPreview";
import TextInput from "../TextInput";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const BaseChat = ({ onFirstPrompt = () => {}, sessionInfo }) => {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handlePromptSubmit = async (text) => {
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setLoading(true);

    try {
      const aiRes = await fetch(`${API_BASE}/api/ai/generate-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      const aiJson = await aiRes.json();
      const aiResponse = aiJson.text || "No response from AI.";

      let typed = "";
      const speed = 15;
      for (let i = 0; i < aiResponse.length; i++) {
        typed += aiResponse[i];
        await new Promise((r) => setTimeout(r, speed));
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[updated.length - 1]?.role === "ai")
            updated[updated.length - 1].content = typed;
          else updated.push({ role: "ai", content: typed });
          return updated;
        });
      }

      const created = await createSessionOnBackend(aiResponse);
      onFirstPrompt(aiResponse, created);
    } catch (err) {
      console.error("AI error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "❌ Error generating AI response." },
      ]);
    } finally {
      setLoading(false);
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

  return (
    <div className="relative flex flex-col w-full h-[calc(100vh-2rem)]   overflow-hidden border border-gray-800">
      {/* Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pt-4 pb-50 space-y-4">
        {messages.length > 0 ? (
          <ChatPreview messages={messages} />
        ) : (
          <div className="text-gray-500 text-sm text-center mt-10">
            Start by describing your app idea 👇
          </div>
        )}
        {loading && (
          <p className="text-gray-500 text-sm text-center animate-pulse">
            ⏳ Thinking...
          </p>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Sticky Text Input */}
      <div className="absolute bottom-0 left-0 w-full bg-[#171717]/95 backdrop-blur-md border-t border-gray-800 py-4 px-4">
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
