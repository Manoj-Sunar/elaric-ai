import React, { useState } from "react";
import BaseChat from "../Chat/BaseChat";
import EmulatorExpoQrpreview from "../Chat/Emulator.Expo.Qr.preview";

const SplitLayout = () => {
  const [aiCode, setAiCode] = useState("");
  const [sessionInfo, setSessionInfo] = useState(null);

  return (
    <div
      className={`transition-all duration-500 grid w-full ${
        sessionInfo ? "md:grid-cols-2 gap-6" : "grid-cols-1"
      }`}
    >
      {/* Chat Section */}
      <div className="flex flex-col w-full justify-between">
        <BaseChat
          onFirstPrompt={(generatedCode, createdSession) => {
            setAiCode(generatedCode);
            setSessionInfo(createdSession);
          }}
          sessionInfo={sessionInfo}
        />
      </div>

      {/* Emulator Section */}
      {sessionInfo && (
        <div className="flex flex-col items-center justify-center w-full max-h-[90vh] overflow-hidden rounded-2xl bg-[#0F0F0F]/70 backdrop-blur-md border border-gray-800 shadow-xl">
          <EmulatorExpoQrpreview aiCode={aiCode} sessionInfo={sessionInfo} />
        </div>
      )}
    </div>
  );
};

export default SplitLayout;
