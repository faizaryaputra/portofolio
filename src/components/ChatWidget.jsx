import { useState } from "react";

export default function ChatWidget({ onStartChat }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Popup Chat kecil */}
      {isOpen && (
        <div className="bg-[#1a103d] text-white w-80 p-4 rounded-xl shadow-lg border border-orange-500 animate-fadeIn">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold">✨ Chat with 5Z</span>
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>
          <p className="text-sm mb-4">
            Curious about Faiz Arya Putra? Ask me anything about his projects, skills, interests, or background. I’m here to help!
          </p>
          <button
            onClick={() => {
              setIsOpen(false);
              onStartChat(); // buka popup besar
            }}
            className="bg-orange-600 hover:bg-orange-700 w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            💬 Start Chat
          </button>
        </div>
      )}

      {/* Tombol Bulat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-lg"
        >
          💬
        </button>
      )}
    </div>
  );
}
