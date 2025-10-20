// src/Components/chatLayout/SplitLayout.jsx
import React, { useState } from "react";
import BaseChat from "../Chat/BaseChat";
import EmulatorExpoQrpreview from "../Chat/Emulator.Expo.Qr.preview";

const SplitLayout = ({ onStartChat }) => {
  const [aiCode, setAiCode] = useState("");
  const [sessionInfo, setSessionInfo] = useState(null);

  return (
    <div
      className={`transition-all duration-500 w-full px-4 sm:px-6 py-4 grid ${
        sessionInfo ? "md:grid-cols-2 gap-6" : "grid-cols-1"
      }`}
    >
      {/* 💬 Chat Section */}
      <div className="flex flex-col w-full justify-between">
        <BaseChat
          onFirstPrompt={(generatedCode, createdSession) => {
            // Called when user sends the first prompt
            setAiCode(generatedCode);
            setSessionInfo(createdSession);
            if (onStartChat) onStartChat(); // 🔥 Notify parent to hide Hero
          }}
          sessionInfo={sessionInfo}
        />
      </div>

      {/* 📱 Emulator Section */}
      {sessionInfo && (
        <div className="flex flex-col items-center justify-center w-full overflow-hidden rounded-2xl backdrop-blur-md">
          <EmulatorExpoQrpreview aiCode={aiCode} sessionInfo={sessionInfo} />
        </div>
      )}
    </div>
  );
};

export default SplitLayout;
