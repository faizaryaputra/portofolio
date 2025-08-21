import React, { useEffect, useState } from "react";
import { FaReact, FaEye } from "react-icons/fa";
import { SiTailwindcss, SiFramer } from "react-icons/si";
import { WiSunrise, WiDaySunny, WiSunset, WiNightClear } from "react-icons/wi";

// Firebase
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";

function Footer() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");
  const [icon, setIcon] = useState(null);
  const [visitors, setVisitors] = useState(0);
  const [greetingColor, setGreetingColor] = useState("");

  // Ambil dan update counter dari Firestore
  useEffect(() => {
    const fetchVisitorCount = async () => {
      const visitorRef = doc(db, "stats", "visitorCount");
      const snap = await getDoc(visitorRef);

      if (snap.exists()) {
        // Ambil data count
        const currentCount = snap.data().count || 0;

        // Update +1 ke Firestore
        await updateDoc(visitorRef, {
          count: increment(1),
        });

        // Set ke state
        setVisitors(currentCount + 1);
      } else {
        console.log("Document tidak ditemukan");
      }
    };

    fetchVisitorCount();
  }, []);

  // === Bagian Greeting ===
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const hour = now.getHours();
      if (hour >= 5 && hour < 11) {
        setGreeting("GOOD MORNING");
        setIcon(<WiSunrise className="text-yellow-300 text-3xl" />);
        setGreetingColor("bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-500");
      } else if (hour >= 11 && hour < 15) {
        setGreeting("GOOD AFTERNOON");
        setIcon(<WiDaySunny className="text-yellow-200 text-3xl" />);
        setGreetingColor("bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600");
      } else if (hour >= 15 && hour < 18) {
        setGreeting("GOOD EVENING");
        setIcon(<WiSunset className="text-orange-400 text-3xl" />);
        setGreetingColor("bg-gradient-to-r from-orange-500 via-red-500 to-orange-600");
      } else {
        setGreeting("GOOD NIGHT");
        setIcon(<WiNightClear className="text-blue-400 text-3xl" />);
        setGreetingColor("bg-gradient-to-r from-purple-700 via-indigo-800 to-purple-900");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString("id-ID", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <footer className="py-8 text-gray-400">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Kiri */}
        <div className="text-center md:text-left">
          <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent animate-gradient-x hover:scale-105 transition-transform duration-300">
            FAIZ ARYA PUTRA
          </div>
          <div className="text-sm mt-1">
            © {new Date().getFullYear()} | Designed & Developed by Faiz Arya Putra
          </div>
        </div>

        {/* Tengah */}
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="flex items-center gap-3 animate-fadeIn">
            {/* Visitor Counter */}
            <div className="flex items-center gap-2 text-white text-sm md:text-base bg-cyan-500 px-3 py-1 rounded-full shadow-md hover:bg-cyan-600 transition-colors">
              <FaEye className="text-white" />
              <span>{visitors} visitors</span>
            </div>

            {/* Greeting */}
            <div
              style={{
                backgroundSize: "200% 200%",
                animation: "gradient-x 5s ease infinite",
              }}
              className={`flex items-center gap-2 text-sm md:text-base font-semibold text-white px-3 py-1 rounded-full shadow-md hover:scale-105 transition-all duration-300 ${greetingColor}`}
            >
              {icon}
              <span className="tracking-wide">{greeting}</span>
              <style>{`
                @keyframes gradient-x {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
              `}</style>
            </div>
          </div>

          <div className="text-sm md:text-base text-gray-300 mt-2">
            {formattedDate}
          </div>

          <div className="text-3xl md:text-4xl font-mono font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-lg tracking-widest">
            {formattedTime}
          </div>
        </div>

        {/* Kanan */}
        <div className="text-center md:text-right">
          <div className="text-[16px] md:text-[18px] mb-3 font-bold bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 bg-clip-text text-transparent animate-gradient-x">
            Built with using
          </div>
          <div className="flex gap-4 justify-center md:justify-end">
            <FaReact className="text-cyan-400 text-5xl hover:scale-110 hover:rotate-12 transition-all duration-300 drop-shadow-md" />
            <SiTailwindcss className="text-sky-500 text-5xl hover:scale-110 hover:-rotate-12 transition-all duration-300 drop-shadow-md" />
            <SiFramer className="text-pink-500 text-5xl hover:scale-110 hover:rotate-6 transition-all duration-300 drop-shadow-md" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
