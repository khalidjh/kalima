"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  duration?: number;
  onDismiss: () => void;
}

export default function Toast({ message, duration = 2000, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  return (
    <div
      className={`fixed top-16 inset-x-0 flex justify-center z-50 pointer-events-none transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
      dir="rtl"
    >
      <div className="bg-[#e0e0e0] text-black font-bold text-sm px-5 py-2.5 rounded-full shadow-xl max-w-[80%] text-center">
        {message}
      </div>
    </div>
  );
}
