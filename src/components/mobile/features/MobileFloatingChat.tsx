"use client";

import { MessageCircle } from "lucide-react";

export function MobileFloatingChat() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors">
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}