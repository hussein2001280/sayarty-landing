"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      richColors
      theme="dark"
      toastOptions={{
        style: {
          background: "#111416",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#F5F5F3",
        },
      }}
    />
  );
}
