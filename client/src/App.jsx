import React from "react";
import Navbar from "./Components/Navbar";
import SplitLayout from "./Components/chatLayout/SplitLayout";
import Hero from "./Components/Hero";


export default function App() {
  return (
    <div className="min-h-screen bg-[#171717] text-white font-sans flex flex-col">
      <Navbar/>
      <Hero/>
      <main className="flex-grow container mx-auto px-4 md:px-8 pb-16">
        <SplitLayout/>
      </main>
     
    </div>
  );
}
