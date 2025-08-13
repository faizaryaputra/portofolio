import React, { useRef, useEffect, useState, useCallback } from "react";
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

// Buat skill dengan ref
const createSkillsWithRefs = (skills) =>
  skills.map((skill) => ({
    ...skill,
    ref: React.createRef(),
  }));

const leftSkillsData = createSkillsWithRefs([
  { icon: <FaReact size={24} color="#61DAFB" />, name: "React" },
  { icon: <SiNextdotjs size={24} color="#FFFFFF" />, name: "Next.js" },
  { icon: <FaPhp size={24} color="#777BB4" />, name: "PHP" },
  { icon: <SiTailwindcss size={24} color="#38BDF8" />, name: "CSS" },
  { icon: <SiVite size={24} color="#646CFF" />, name: "Vite" },
  { icon: <SiGo size={24} color="#00ADD8" />, name: "Golang" },
]);

const rightSkillsData = createSkillsWithRefs([
  { icon: <FaLaravel size={24} color="#FF2D20" />, name: "Laravel" },
  { icon: <FaNodeJs size={24} color="#339933" />, name: "Node.js" },
  { icon: <SiFlutter size={24} color="#02569B" />, name: "Flutter" },
  { icon: <FaFigma size={24} color="#F24E1E" />, name: "Figma" },
  { icon: <SiVercel size={24} color="#FFFFFF" />, name: "Vercel" },
  { icon: <FaVuejs size={24} color="#4FC08D" />, name: "Vue.js" },
]);

export default function SkillsMap() {
  const containerRef = useRef(null);
  const centerRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const updateLines = useCallback(() => {
    const container = containerRef.current;
    const center = centerRef.current;
    if (!container || !center) return;

    const containerRect = container.getBoundingClientRect();
    const centerRect = center.getBoundingClientRect();

    const centerX =
      centerRect.left + centerRect.width / 2 - containerRect.left;
    const centerY =
      centerRect.top + centerRect.height / 2 - containerRect.top;

    setContainerSize({
      width: containerRect.width,
      height: containerRect.height,
    });

    const getSkillLines = (skills, isLeft) =>
      skills
        .map(({ ref }) => {
          if (!ref.current) return null;

          const rect = ref.current.getBoundingClientRect();
          const x = isLeft
            ? rect.right - containerRect.left
            : rect.left - containerRect.left;
          const y = rect.top + rect.height / 2 - containerRect.top;

          const cpX = isLeft
            ? (x + centerX) / 2 - 80
            : (x + centerX) / 2 + 80;

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

    const leftLines = getSkillLines(leftSkillsData, true);
    const rightLines = getSkillLines(rightSkillsData, false);
    setLines([...leftLines, ...rightLines]);
  }, []);

  useEffect(() => {
    updateLines();
    window.addEventListener("resize", updateLines);

    const observer = new ResizeObserver(() => updateLines());
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      window.removeEventListener("resize", updateLines);
      observer.disconnect();
    };
  }, [updateLines]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen flex items-center justify-center overflow-hidden"
    >
      {/* SVG Garis */}
      {containerSize.width > 0 && containerSize.height > 0 && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
          preserveAspectRatio="none"
        >
          {lines.map((line, i) => (
            <path
              key={i}
              d={`M ${line.x1} ${line.y1} Q ${line.cx} ${line.cy}, ${line.x2} ${line.y2}`}
              stroke="rgba(0, 174, 255, 0.35)"
              strokeWidth="2"
              fill="none"
              className="animate-pulse"
            />
          ))}
        </svg>
      )}

      {/* Titik Tengah */}
      <div
        ref={centerRef}
        className="z-10 px-10 py-5 rounded-xl bg-[#101827]/80 text-cyan-300 text-4xl font-bold shadow-lg backdrop-blur-md border border-cyan-400/30 transition-all animate-glow"
      >
        SKILLS
      </div>

      {/* Skill Kiri */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col justify-center gap-8 z-10">
        {leftSkillsData.map((skill, i) => (
          <button
            key={i}
            ref={skill.ref}
            className="flex items-center gap-2 px-4 py-2 border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 rounded-full backdrop-blur-md hover:bg-cyan-500/10 hover:scale-105 transition duration-300 shadow-md"
          >
            {skill.icon}
            <span className="text-base font-medium">{skill.name}</span>
          </button>
        ))}
      </div>

      {/* Skill Kanan */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col justify-center gap-8 z-10">
        {rightSkillsData.map((skill, i) => (
          <button
            key={i}
            ref={skill.ref}
            className="flex items-center gap-2 px-4 py-2 border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 rounded-full backdrop-blur-md hover:bg-cyan-500/10 hover:scale-105 transition duration-300 shadow-md"
          >
            {skill.icon}
            <span className="text-base font-medium">{skill.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
