// src/pages/FrontIndex.jsx
import React, { useState } from "react";
import SplitLayout from "../Components/chatLayout/SplitLayout";
import Hero from "../Components/Hero";

const FrontIndex = () => {
  const [hasStarted, setHasStarted] = useState(false); // ✅ Track if user has sent first prompt

  return (
    <div className="flex flex-col items-center text-white  transition-all duration-500">
      {/* Hide Hero after first chat prompt */}
      {!hasStarted && (
        <div className="w-full transition-all duration-700">
          <Hero />
        </div>
      )}

      <main
        className={`w-full px-6 pb-1 transition-all duration-500 ${
          hasStarted ? "pt-4" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <SplitLayout onStartChat={() => setHasStarted(true)} />
        </div>
      </main>
    </div>
  );
};

export default FrontIndex;
