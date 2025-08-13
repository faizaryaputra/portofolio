// src/components/ChatPage.jsx
import { useState, useEffect, useRef } from "react";
import Fuse from "fuse.js"; // 🔹 Tambahkan ini
import faq from "../data/faq.json";
import aiIcon from "../assets/images/icons-ai-96.png";

export default function ChatPage({ isPopup = false, onClose }) {
  const rootRef = useRef(null);
  const textareaRef = useRef(null);
  const chatEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [topGap, setTopGap] = useState(80);

  // 🔹 Setup Fuse.js hanya sekali
  const fuse = new Fuse(faq, {
    keys: ["question"],
    threshold: 0.4, // Semakin kecil semakin ketat pencarian
  });

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: `Welcome! I'm 5Z ETERNITY...
Feel free to ask me anything about the project, technology, or contact details in English/Indonesian. How can I help you today?`,
      },
    ]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isPopup) {
      const candidates = [
        document.querySelector(".navbar"),
        document.querySelector("header"),
        document.querySelector(".site-header"),
      ];
      const navbar = candidates.find(Boolean);
      if (navbar) setTopGap(navbar.getBoundingClientRect().height);
    }
  }, [isPopup]);

  useEffect(() => {
    if (isPopup) {
      const t = setTimeout(() => textareaRef.current?.focus(), 40);
      return () => clearTimeout(t);
    }
  }, [isPopup]);

  useEffect(() => {
    if (!isPopup || typeof onClose !== "function") return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isPopup, onClose]);

  // 🔹 Versi findFaqAnswer pakai Fuse.js
  const findFaqAnswer = (text) => {
    if (!text.trim()) return null;

    const result = fuse.search(text.trim());
    if (result.length > 0) {
      return result[0].item.answer;
    }

    return null; // kalau tidak ada hasil
  };

  const sendMessage = () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    const userMsg = { role: "user", content: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
  const answer = findFaqAnswer(userText);

  // Deteksi bahasa sederhana (bisa diperluas lagi)
  const isIndonesian = /apa|siapa|berapa|halo|hai|bagaimana|dimana/i.test(userText);

  const defaultReplyID = "Maaf, saya belum punya jawabannya untuk itu. Anda bisa bertanya tentang proyek, teknologi yang digunakan, atau informasi kontak.";
  const defaultReplyEN = "Sorry, I don't have an answer for that yet. You can ask about projects, tech stack, or contact info.";

  const reply = answer || (isIndonesian ? defaultReplyID : defaultReplyEN);

  const botMsg = { role: "assistant", content: reply };
  setMessages((prev) => [...prev, botMsg]);
  setLoading(false);
}, 450);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isPopup) {
    return (
      <div ref={rootRef} className="w-full max-w-3xl mx-auto my-8">
        <div className="relative rounded-xl overflow-hidden flex flex-col h-[78vh] bg-gradient-to-br from-[#0b0f1a] via-[#10193d] to-[#0b0f1a] border border-red-800 shadow-[0_0_30px_rgba(128,0,255,0.3)] backdrop-blur-lg">

          {/* header */}
          <div className="flex items-center gap-3 p-3 bg-[#0a0a0a] border-b border-red-500 shadow-[0_0_10px_rgba(0,255,0,0.3)]">
  <div className="relative">
    <img
      src={aiIcon}
      alt="AI Icon"
      className="w-10 h-10 rounded-full border border-blue-500 shadow-[0_0_8px_rgba(0,0,255,0.6)]"
    />
    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full shadow-[0_0_6px_rgba(0,0,255,0.6)]"></span>
  </div>

  <div className="flex flex-col">
    <h2 className="font-extrabold text-lg tracking-wide text-white drop-shadow-[0_0_6px_rgba(0,0,255,0.6)]">
      5Z ETERNITY
    </h2>
    <p className="text-green-400 text-sm flex items-center gap-1">
      <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_6px_rgba(0,0,255,0.6)]"></span>
      Online
    </p>
  </div>

  {/* kanan: tombol close */}
  {typeof onClose === "function" && (
    <button
      onClick={onClose}
      aria-label="Close chat"
      className="ml-auto text-white text-2xl hover:text-red-400 transition-all duration-200 ease-in-out transform hover:scale-110"
    >
      ✕
    </button>
  )}
</div>

          {/* messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col custom-scrollbar">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[75%] p-3 rounded-2xl shadow-md backdrop-blur-sm ${
                  msg.role === "assistant"
                    ? "bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white self-start"
                    : "bg-gradient-to-br from-blue-400 to-cyan-400 text-black self-end ml-auto"
                }`}
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <p className="text-sm text-gray-400 italic self-start animate-pulse">
                Bot is typing...
              </p>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* input */}
          <div className="p-4 border-t border-red-600 flex gap-2 bg-black/30 backdrop-blur-md">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder="Type your message..."
              className="flex-1 p-2 rounded-lg bg-black/30 text-white border border-red-600 focus:border-red-400 focus:ring focus:ring-red-500/40 outline-none resize-none transition-colors duration-200"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-bold shadow-md transition-all duration-200 ${
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-br from-red-600 to-yellow-500 hover:brightness-110"
              }`}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    );
  }
}
