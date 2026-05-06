// src/components/Preloader.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Linkedin, Instagram } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import LightRays from './LightRays';
import Spline from '@splinetool/react-spline';

const Preloader = ({ onFinished }) => {
  const [typedText, setTypedText] = useState('');
  const [showContent, setShowContent] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [isAssetLoaded, setIsAssetLoaded] = useState(false);

  // 🔥 lebih AI feel
  const fullText = ">>> CONNECTING TO FAIZ SYSTEM...";

  const handleAssetLoad = () => setIsAssetLoaded(true);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (showContent) {
      if (typedText.length < fullText.length) {
        const t = setTimeout(() => {
          setTypedText(fullText.slice(0, typedText.length + 1));
        }, 50);
        return () => clearTimeout(t);
      } else if (isAssetLoaded) {
        const t = setTimeout(() => {
          setFadeOut(true);
          setTimeout(onFinished, 900);
        }, 1200);
        return () => clearTimeout(t);
      }
    }
  }, [typedText, showContent, isAssetLoaded]);

  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          exit={{
            opacity: 0,
            scale: 1.03,
            filter: 'blur(10px)',
            transition: { duration: 0.9 }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#060010] text-white overflow-hidden"
        >
          {/* BACKGROUND */}
          <LightRays />

          {/* 🔥 SOFT GLOW CORE */}
          <motion.div
            className="absolute w-[420px] h-[420px] bg-cyan-400/10 blur-[120px] rounded-full"
            animate={{ opacity: [0.06, 0.14, 0.06] }}
            transition={{ duration: 6, repeat: Infinity }}
          />

          {/* 🔥 FLOATING AI PARTICLES */}
          <motion.div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-[2px] h-[2px] bg-cyan-300/40 rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.2, 0.7, 0.2],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </motion.div>

          {/* MAIN */}
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center relative z-10"
            >

              {/* SPLINE */}
              <motion.div
                layoutId="main-spline"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1 }}
                className="mx-auto w-[320px] h-[180px] md:w-[480px] md:h-[260px]"
              >
                <Spline
                  scene="https://prod.spline.design/FcZ66SFMX1YbF-0I/scene.splinecode"
                  onLoad={handleAssetLoad}
                />
              </motion.div>

              {/* NAME */}
              <motion.h1
                className="text-4xl md:text-6xl font-moderniz font-bold mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  textShadow: "0 0 18px rgba(0,255,255,0.2)"
                }}
              >
                Faiz Arya Putra
              </motion.h1>

              {/* TEXT */}
              <div className="relative mt-4 font-cascadia text-gray-400 text-lg md:text-xl">
                <span>{typedText}</span>
                <span className="animate-pulse">▌</span>

                {/* scan effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </div>

              {/* 🔥 AI STATUS SYSTEM */}
              <motion.div
                className="mt-4 text-sm font-mono text-cyan-300/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.span
                  key={typedText.length}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {typedText.length < fullText.length * 0.3 && "Booting neural core..."}
                  {typedText.length >= fullText.length * 0.3 && typedText.length < fullText.length * 0.6 && "Synchronizing data streams..."}
                  {typedText.length >= fullText.length * 0.6 && typedText.length < fullText.length && "Calibrating interface..."}
                  {typedText.length === fullText.length && "System ready. Launching experience..."}
                </motion.span>
              </motion.div>

              {/* SOCIAL */}
              <motion.div
                className="flex justify-center gap-6 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {[Github, Linkedin, Instagram].map((Icon, i) => (
                  <motion.a
                    key={i}
                    whileHover={{ scale: 1.15 }}
                    className="text-gray-400 hover:text-cyan-300 transition"
                  >
                    <Icon size={26} />
                  </motion.a>
                ))}
                <motion.a
                  whileHover={{ scale: 1.15 }}
                  className="text-gray-400 hover:text-cyan-300 transition"
                >
                  <FaWhatsapp size={26} />
                </motion.a>
              </motion.div>

            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;