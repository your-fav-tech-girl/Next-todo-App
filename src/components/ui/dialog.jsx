import React from "react";
import { createPortal } from "react-dom";

export function Dialog({ open, onClose, children }) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="bg-white dark:bg-gray-900 w-full max-w-md mx-4 rounded-xl shadow-lg overflow-hidden animate-fade-in"
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export function DialogHeader({ children }) {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold text-lg">
      {children}
    </div>
  );
}

export function DialogBody({ children }) {
  return <div className="p-4 space-y-3">{children}</div>;
}

export function DialogFooter({ children }) {
  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
      {children}
    </div>
  );
}
