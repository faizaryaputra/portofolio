import React, { useEffect, useState } from "react";
import { FaReact } from "react-icons/fa";
import { SiTailwindcss, SiFramer } from "react-icons/si";
import { WiSunrise, WiDaySunny, WiSunset, WiNightClear } from "react-icons/wi";

function Footer() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const hour = now.getHours();

      if (hour >= 5 && hour < 11) {
        setGreeting("GOOD MORNING");
        setIcon(<WiSunrise className="text-yellow-400 text-3xl" />);
      } else if (hour >= 11 && hour < 15) {
        setGreeting("GOOD AFTERNOON");
        setIcon(<WiDaySunny className="text-yellow-300 text-3xl" />);
      } else if (hour >= 15 && hour < 18) {
        setGreeting("GOOD EVENING");
        setIcon(<WiSunset className="text-orange-400 text-3xl" />);
      } else {
        setGreeting("GOOD NIGHT");
        setIcon(<WiNightClear className="text-blue-400 text-3xl" />);
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
          <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent animate-gradient-x">
            FAIZ ARYA PUTRA
          </div>
          <div className="text-sm mt-1">
            © {new Date().getFullYear()} All rights reserved.
          </div>
        </div>

        {/* Tengah */}
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="flex items-center gap-2 animate-fadeIn">
            {icon}
            <span className="text-lg md:text-xl font-semibold tracking-wide text-white drop-shadow-md">
              {greeting}
            </span>
          </div>

          <div className="text-sm md:text-base text-gray-300">
            {formattedDate}
          </div>

          <div
            className="text-3xl md:text-4xl font-mono font-bold bg-gradient-to-r 
            from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-lg tracking-widest"
          >
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
