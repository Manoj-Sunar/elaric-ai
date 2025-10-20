import React from "react";
import { motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const ChatPreview = ({ messages = [] }) => {
  return (
    <div className="w-full h-full flex flex-col space-y-6 overflow-y-auto overflow-x-hidden px-1">
      {messages.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className={`flex ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm sm:text-base leading-relaxed break-words ${
              msg.role === "user"
                ? "bg-gray-800 text-gray-200 text-center rounded-full px-4"
                : " text-gray-200"
            }`}
          >
            <RenderMessage content={msg.content} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const RenderMessage = ({ content }) => {
  const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts = [];
  let last = 0;
  let match;

  while ((match = codeRegex.exec(content))) {
    const [block, lang, code] = match;
    const before = content.slice(last, match.index);
    if (before.trim()) parts.push({ type: "text", text: before });
    parts.push({ type: "code", lang: lang || "javascript", code });
    last = match.index + block.length;
  }
  const after = content.slice(last);
  if (after.trim()) parts.push({ type: "text", text: after });

  return (
    <div className="space-y-3">
      {parts.map((p, idx) =>
        p.type === "code" ? (
          <div
            key={idx}
            className="rounded-md overflow-hidden border border-gray-900 bg-[#0f0f0f] overflow-x-auto"
          >
            <SyntaxHighlighter
              language={p.lang}
              style={oneDark}
              wrapLongLines
              customStyle={{
                background: "transparent",
                fontSize: "0.85rem",
                padding: "1rem",
                minWidth: "300px",
              }}
            >
              {p.code.trim()}
            </SyntaxHighlighter>
          </div>
        ) : (
          <p key={idx} className="whitespace-pre-line text-gray-300">
            {p.text.trim()}
          </p>
        )
      )}
    </div>
  );
};

export default ChatPreview;
