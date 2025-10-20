import React from "react";

export default function Navbar() {
  return (
    <nav className="w-full sticky top-0 z-50  ">
      <div className="container mx-auto px-4 md:px-8 h-16 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <h1 className="text-lg font-semibold tracking-wide">
            ELARIC <span className="text-blue-500">AI</span>
          </h1>
        </div>

        <div className="hidden md:flex items-center gap-6 text-gray-400 text-sm">
          <button className="hover:text-white transition">Docs</button>
          <button className="hover:text-white transition">Examples</button>
          <button className="hover:text-white transition">GitHub</button>
        </div>

        <button className="md:hidden text-gray-400 hover:text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 5.25h16.5M3.75 12h16.5m-16.5 6.75h16.5"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}
