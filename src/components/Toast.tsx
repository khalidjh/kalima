"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  duration?: number;
  onDismiss: () => void;
}

export default function Toast({
  message,
  duration = 2000,
  onDismiss,
}: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-white text-black font-bold px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300 pointer-events-none ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      dir="rtl"
    >
      {message}
    </div>
  );
}
