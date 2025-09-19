import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "../lib/utils";

const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
  glow = true,
  glowType = "blue", // "blue" | "fire"
  colorClass = "text-white",
}) => {
  const [scope, animate] = useAnimate();
  let wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
        scale: [1.05, 1],
      },
      {
        duration: duration,
        delay: stagger(0.15),
        ease: "easeOut",
      }
    );
  }, [scope, animate, duration, filter]);

  const getGlow = () => {
    if (!glow) return "none";
    if (glowType === "fire") {
      // Glow api lembut
      return "0 0 4px rgba(255,140,0,0.6), 0 0 8px rgba(255,69,0,0.4), 0 0 12px rgba(255,215,0,0.3)";
    }
    // Default glow biru
    return "0 0 4px rgba(0,240,255,0.6), 0 0 8px rgba(0,240,255,0.4)";
  };

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="flex flex-wrap gap-x-1">
        {wordsArray.map((word, idx) => (
          <motion.span
            key={word + idx}
            className={cn(colorClass, "opacity-0")}
            style={{
              filter: filter ? "blur(6px)" : "none",
              textShadow: getGlow(),
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    );
  };

  return (
    <div className={cn("font-cascadia", className)}>
      <div className="mt-4">
        <div className="text-md leading-snug tracking-wide sm:text-center md:text-center lg:text-left">
          {renderWords()}
        </div>
      </div>
    </div>
  );
};

export default TextGenerateEffect;
