// src/pages/FrontIndex.jsx
import React from 'react';
import SplitLayout from '../components/chatLayout/SplitLayout';

const FrontIndex = () => {
  return (
    <div className="flex flex-col items-center   text-white">
      <header className="w-full max-w-7xl px-6 ">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Build native mobile apps, <span className="text-[#E47D2F]">fast</span>.
        </h1>
        <p className="mt-3 text-gray-400 max-w-xl">
          Elaric builds complete, cross-platform mobile apps using AI and React Native.
        </p>
      </header>

      <main className="w-full flex-1 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <SplitLayout />
        </div>
      </main>
    </div>
  );
};

export default FrontIndex;
