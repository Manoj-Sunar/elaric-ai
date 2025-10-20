import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import io from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const EmulatorExpoQrpreview = ({ sessionInfo }) => {
  const [qrValue, setQrValue] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!sessionInfo) return;

    const { sessionId, previewUrl: backendPreviewUrl } = sessionInfo;
    const localIP = window.location.hostname;

    // ✅ Replace localhost with your local IP for mobile QR access
    const fixedPreviewUrl = backendPreviewUrl?.replace("localhost", localIP);

    setPreviewUrl(fixedPreviewUrl || `${API_BASE}/preview/${sessionId}`);
    setQrValue(fixedPreviewUrl || `${API_BASE}/preview/${sessionId}`);

    // ✅ Connect socket for live updates
    const socket = io(API_BASE, { transports: ["websocket"] });
    socket.emit("join", sessionId);

    socket.on("session:update", (msg) => {
      console.log("Session updated:", msg);
      if (msg.previewUrl) setPreviewUrl(msg.previewUrl);
    });

    return () => socket.disconnect();
  }, [sessionInfo]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0E0E0E] text-gray-200 p-4">
      {/* Header Tabs */}
      <div className="flex border-b border-gray-800 mb-3">
        <button className="px-4 py-2 -mb-px font-semibold text-sm border-b-2 border-blue-500 text-white">
          Live Preview
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center gap-8 flex-1">
        {/* 📱 Mobile Emulator */}
        <div className="relative flex flex-col items-center">
          <div className="relative w-[260px] h-[520px] bg-black rounded-[40px] shadow-inner flex items-center justify-center border-[3px] border-gray-800 overflow-hidden">
            <div className="w-[230px] h-[500px] bg-black rounded-[28px] flex items-center justify-center border border-gray-700 overflow-hidden">
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  title="Live Preview"
                  className="w-full h-full border-0 scale-100 transform origin-top bg-white"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <p className="text-sm">Preview not ready</p>
                </div>
              )}
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 text-center w-60">
            This is a live emulator showing your app’s UI
          </p>
        </div>

        {/* 📱 QR Section */}
        <div className="flex flex-col items-center bg-[#171717] rounded-xl p-6 shadow-lg border border-gray-800 w-full md:w-[300px]">
          <h2 className="text-lg font-semibold mb-4">Test on your phone</h2>

          {qrValue ? (
            <QRCodeCanvas
              value={qrValue}
              size={180}
              bgColor="#171717"
              fgColor="#ffffff"
              level="H"
            />
          ) : (
            <div className="w-[180px] h-[180px] bg-[#0E0E0E] border border-gray-700 rounded-lg flex items-center justify-center text-gray-600 text-xs">
              QR Code
            </div>
          )}

          <p className="mt-4 text-gray-400 text-center text-sm">
            Scan to open preview (use same Wi-Fi)
          </p>

          <div className="bg-[#0E0E0E] text-gray-500 text-xs rounded-lg mt-6 p-3 border border-gray-800 text-center w-full">
            ⚠️ Ensure your mobile & PC are on same Wi-Fi network.
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmulatorExpoQrpreview;
