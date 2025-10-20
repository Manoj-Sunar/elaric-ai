import React from "react";
import Navbar from "./Components/Navbar";
import FrontIndex from "./Screen/FrontIndex";




export default function App() {
  return (
    <div className="min-h-screen bg-[#171717] text-white font-sans flex flex-col">
      <Navbar/>
      <main className="flex-grow container mx-auto px-4 md:px-8 pb-5 flex justify-center items-center">
       <FrontIndex/>
      </main>
     
    </div>
  );
}
