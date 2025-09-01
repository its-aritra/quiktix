"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { supabase } from '@/lib/supabaseClient';

export default function ScannerPage() {
  const [status, setStatus] = useState("Scan a QR code...");
  const [result, setResult] = useState<string | null>(null);

  const handleScan = async (results: { rawValue: string }[]) => {
    if (results.length > 0) {
      const bookingId = results[0].rawValue;
      setResult(bookingId);
      setStatus("Validating...");

      const { data: booking, error } = await supabase.rpc("validateBooking", {
        pbookingid: bookingId,
      });

      if (error) {
        setStatus(`❌ Error: ${error.message}`);
      } else if (!booking || booking.length === 0) {
        setStatus("❌ Invalid or already used ticket");
      } else {
        setStatus("✅ Ticket valid! Entry allowed");
      }
    }
  };

  const handleError = (err: unknown) => {
    console.error(err);
    setStatus("❌ Camera error");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <h1 className="text-2xl font-bold">QuikTix Scanner</h1>

      <div className="w-72 h-72 border-4 border-gray-300 rounded-xl overflow-hidden">
        <Scanner
          onScan={handleScan}
          onError={handleError}
          constraints={{ facingMode: "environment" }}
        />
      </div>

      <div
        className={`text-lg font-semibold ${
          status.includes("✅") ? "text-green-600" : "text-red-600"
        }`}
      >
        {status}
      </div>

      {result && (
        <p className="text-sm text-gray-500">Scanned ID: {result}</p>
      )}
    </div>
  );
}
