"use client";
import { useState, useEffect, createContext, useContext, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type = "info", duration = 4000 }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const toast = {
    success: (message) => addToast({ message, type: "success" }),
    error: (message) => addToast({ message, type: "error" }),
    info: (message) => addToast({ message, type: "info" }),
    warning: (message) => addToast({ message, type: "warning" }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-card
              max-w-sm w-full animate-fade-up
              ${t.type === "success" ? "bg-green-500/15 border-green-500/30 text-green-300" : ""}
              ${t.type === "error" ? "bg-red-500/15 border-red-500/30 text-red-300" : ""}
              ${t.type === "warning" ? "bg-amber-500/15 border-amber-500/30 text-amber-300" : ""}
              ${t.type === "info" ? "bg-blue-500/15 border-blue-500/30 text-blue-300" : ""}
            `}
          >
            <span className="text-lg shrink-0 mt-0.5">
              {t.type === "success" && "✅"}
              {t.type === "error" && "❌"}
              {t.type === "warning" && "⚠️"}
              {t.type === "info" && "ℹ️"}
            </span>
            <p className="font-body text-sm flex-1 leading-relaxed">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="text-current opacity-50 hover:opacity-100 transition-opacity shrink-0 mt-0.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
