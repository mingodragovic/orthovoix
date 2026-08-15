// src/app/components/common/Toast.tsx
import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-[#48BB78] text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-sm font-medium whitespace-nowrap">
        <CheckCircle size={16} />
        {message}
      </div>
    </div>
  );
}