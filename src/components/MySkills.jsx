import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

import {
  FaReact,
  FaPhp,
  FaLaravel,
  FaNodeJs,
  FaVuejs,
  FaFigma,
} from "react-icons/fa";

import {
  SiNextdotjs,
  SiFlutter,
  SiTailwindcss,
  SiVite,
  SiVercel,
  SiGo,
} from "react-icons/si";

/* =========================
   CREATE SKILLS WITH REFS
========================= */

const createSkillsWithRefs = (skills) =>
  skills.map((skill) => ({
    ...skill,
    ref: React.createRef(),
  }));

const leftSkillsData = createSkillsWithRefs([
  { icon: <FaReact size={24} />, name: "React" },
  { icon: <SiNextdotjs size={24} />, name: "Next.js" },
  { icon: <FaPhp size={24} />, name: "PHP" },
  { icon: <SiTailwindcss size={24} />, name: "Tailwind" },
  { icon: <SiVite size={24} />, name: "Vite" },
  { icon: <SiGo size={24} />, name: "Golang" },
]);

const rightSkillsData = createSkillsWithRefs([
  { icon: <FaLaravel size={24} />, name: "Laravel" },
  { icon: <FaNodeJs size={24} />, name: "Node.js" },
  { icon: <SiFlutter size={24} />, name: "Flutter" },
  { icon: <FaFigma size={24} />, name: "Figma" },
  { icon: <SiVercel size={24} />, name: "Vercel" },
  { icon: <FaVuejs size={24} />, name: "Vue.js" },
]);

export default function SkillsMap() {

  const containerRef = useRef(null);
  const centerRef = useRef(null);

  const [lines, setLines] = useState([]);
  const [containerSize, setContainerSize] =
    useState({ width: 0, height: 0 });

  /* =========================
     UPDATE LINE POSITIONS
  ========================= */

  const updateLines = useCallback(() => {

    const container = containerRef.current;
    const center = centerRef.current;

    if (!container || !center) return;

    const containerRect =
      container.getBoundingClientRect();

    const centerRect =
      center.getBoundingClientRect();

    const centerX =
      centerRect.left +
      centerRect.width / 2 -
      containerRect.left;

    const centerY =
      centerRect.top +
      centerRect.height / 2 -
      containerRect.top;

    setContainerSize({
      width: containerRect.width,
      height: containerRect.height,
    });

    const getLines = (skills, isLeft) =>
      skills
        .map(({ ref }) => {

          if (!ref.current) return null;

          const rect =
            ref.current.getBoundingClientRect();

          const x = isLeft
            ? rect.right - containerRect.left
            : rect.left - containerRect.left;

          const y =
            rect.top +
            rect.height / 2 -
            containerRect.top;

          const cpX = isLeft
            ? (x + centerX) / 2 - 120
            : (x + centerX) / 2 + 120;

          return {
            x1: x,
            y1: y,
            cx: cpX,
            cy: y,
            x2: centerX,
            y2: centerY,
          };

        })
        .filter(Boolean);

    const left =
      getLines(leftSkillsData, true);

    const right =
      getLines(rightSkillsData, false);

    setLines([...left, ...right]);

  }, []);

  useEffect(() => {

    updateLines();

    window.addEventListener(
      "resize",
      updateLines
    );

    const observer =
      new ResizeObserver(() =>
        updateLines()
      );

    if (containerRef.current)
      observer.observe(containerRef.current);

    return () => {

      window.removeEventListener(
        "resize",
        updateLines
      );

      observer.disconnect();

    };

  }, [updateLines]);

  return (

    <div
      ref={containerRef}
      className="
      relative
      w-full
      h-screen
      flex
      items-center
      justify-center
      overflow-hidden
    "
    >
      {/* SVG LINES */}

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
      >

        <defs>

          {/* MAIN GRADIENT */}

          <linearGradient
            id="lineGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >

            <stop
              offset="0%"
              stopColor="#00f7ff"
            />

            <stop
              offset="100%"
              stopColor="#8b5cf6"
            />

          </linearGradient>

        </defs>

        {lines.map((line, i) => (

          <g key={i}>

            {/* GLOW LINE */}

            <motion.path

              d={`M ${line.x1} ${line.y1}
                  Q ${line.cx} ${line.cy},
                  ${line.x2} ${line.y2}`}

              stroke="url(#lineGradient)"

              strokeWidth="6"

              opacity="0.2"

              fill="none"

              strokeDasharray="4 14"

              animate={{
                strokeDashoffset: [0, -120],
              }}

              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.1,
              }}

            />

            {/* ELECTRIC LINE */}

            <motion.path

              d={`M ${line.x1} ${line.y1}
                  Q ${line.cx} ${line.cy},
                  ${line.x2} ${line.y2}`}

              stroke="url(#lineGradient)"

              strokeWidth="2"

              fill="none"

              strokeDasharray="6 10"

              animate={{
                strokeDashoffset: [0, -80],
              }}

              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.1,
              }}

            />

          </g>

        ))}

      </svg>

      {/* CENTER NODE */}

      <motion.div
        ref={centerRef}

        animate={{
          scale: [1, 1.08, 1],
        }}

        transition={{
          duration: 2,
          repeat: Infinity,
        }}

        className="
        z-10
        px-14
        py-7
        rounded-2xl
        text-cyan-300
        text-4xl
        font-bold
        bg-[#0f172a]/80
        backdrop-blur-xl
        border
        border-cyan-400/30
        shadow-[0_0_60px_rgba(0,255,255,0.5)]
      "
      >

        SKILLS

      </motion.div>

      {/* LEFT SKILLS */}

      <div
        className="
        absolute
        left-12
        top-1/2
        -translate-y-1/2
        flex
        flex-col
        gap-8
        z-10
      "
      >

        {leftSkillsData.map(
          (skill, i) => (

            <motion.button

              key={i}
              ref={skill.ref}

              whileHover={{
                scale: 1.1,
                boxShadow:
                  "0 0 25px rgba(0,255,255,0.8)",
              }}

              className="
              flex
              items-center
              gap-3
              px-6
              py-2
              rounded-full
              bg-cyan-500/10
              border
              border-cyan-400/30
              text-cyan-300
              backdrop-blur-md
              transition
            "
            >

              {skill.icon}
              {skill.name}

            </motion.button>

          )
        )}

      </div>

      {/* RIGHT SKILLS */}

      <div
        className="
        absolute
        right-12
        top-1/2
        -translate-y-1/2
        flex
        flex-col
        gap-8
        z-10
      "
      >

        {rightSkillsData.map(
          (skill, i) => (

            <motion.button

              key={i}
              ref={skill.ref}

              whileHover={{
                scale: 1.1,
                boxShadow:
                  "0 0 25px rgba(139,92,246,0.8)",
              }}

              className="
              flex
              items-center
              gap-3
              px-6
              py-2
              rounded-full
              bg-purple-500/10
              border
              border-purple-400/30
              text-purple-300
              backdrop-blur-md
              transition
            "
            >

              {skill.icon}
              {skill.name}

            </motion.button>

          )
        )}

      </div>

    </div>

  );
}