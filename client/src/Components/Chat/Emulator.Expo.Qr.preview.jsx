import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import io from "socket.io-client";

const API_ROOT = import.meta.env.VITE_API_ROOT || "http://localhost:4000";

export default function EmulatorExpoQrpreview({ sessionInfo }) {
  const [qrValue, setQrValue] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!sessionInfo) return;

    // prefer snackUrl (runnable RN)
    const preferred = sessionInfo.snackUrl || sessionInfo.previewUrl || sessionInfo.qrDataUrl || "";
    // replace localhost with LAN hostname so mobile can access
    const host = window.location.hostname;
    const fixed = preferred.replace(/localhost/g, host);

    setPreviewUrl(fixed);
    // QR: only set if it's a normal http(s) url and not a huge data url
    if (/^https?:\/\//.test(fixed) && fixed.length < 2000) {
      setQrValue(fixed);
    } else {
      setQrValue("");
    }

    const socket = io(API_ROOT, { transports: ["websocket"] });
    socket.emit("join", sessionInfo.sessionId);
    socket.on("session:update", (msg) => {
      if (msg.previewUrl) {
        const fixed2 = msg.previewUrl.replace(/localhost/g, host);
        setPreviewUrl(fixed2);
        if (/^https?:\/\//.test(fixed2) && fixed2.length < 2000) setQrValue(fixed2);
      }
    });

    return () => socket.disconnect();
  }, [sessionInfo]);

  return (
    <div className="w-full h-full flex flex-col text-gray-200 p-4">
      <div className="flex border-b border-gray-800 mb-3">
        <button className="px-4 py-2 -mb-px font-semibold text-sm border-b-2 border-blue-500 text-white">
          Live Preview
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center gap-8 flex-1">
        <div className="relative flex flex-col items-center">
          <div className="relative w-[260px] h-[520px] bg-black rounded-[40px] shadow-inner flex items-center justify-center border-[3px] border-gray-800 overflow-hidden">
            <div className="w-[230px] h-[500px] bg-white rounded-[28px] flex items-center justify-center border border-gray-700 overflow-auto">
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  title="Live Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 p-4">
                  <p className="text-sm">Preview not ready</p>
                </div>
              )}
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 text-center w-60">
            This is a live emulator showing your app’s UI
          </p>
        </div>

        <div className="flex flex-col items-center  w-full md:w-[300px]">
          <h2 className="text-lg font-semibold mb-4">Test on your phone</h2>

          {qrValue ? (
            <QRCodeCanvas value={qrValue} size={200} bgColor="#171717" fgColor="#ffffff" level="H" />
          ) : (
            <div className="w-[180px] h-[180px] bg-[#0E0E0E] border border-gray-700 rounded-lg flex items-center justify-center text-gray-600 text-xs">
              QR Code not available
            </div>
          )}

          <div className="flex items-start justify-start flex-col">
          <p className="mt-4 text-gray-300 text-center text-lg font-bold text-3xl">Scan QR code to test</p>
             <p>To test on your device:</p>
             <ol>
              <li className="text-sm">1. Open Camera app</li>
              <li className="text-sm">2. Scan the QR code above</li>
             </ol>
          </div>
         
        </div>
      </div>
    </div>
  );
}
