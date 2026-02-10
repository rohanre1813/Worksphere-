import { motion } from "framer-motion";

const lanes = [30, 45, 60];
const dots = Array.from({ length: 16 });
const ghosts = ["#ff1744", "#00e5ff", "#ffea00"];

function PacMan({ top, delay }) {
  return (
    <motion.div
      className="absolute -left-32"
      style={{ top: `${top}%` }}
      animate={{ x: "120vw" }}
      transition={{
        duration: 10,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <motion.div
        className="w-20 h-20 bg-yellow-400 rounded-full shadow-[0_0_30px_rgba(250,204,21,0.8)]"
        animate={{
          clipPath: [
            "polygon(50% 50%, 100% 0%, 100% 100%)",
            "polygon(50% 50%, 100% 45%, 100% 55%)",
            "polygon(50% 50%, 100% 0%, 100% 100%)",
          ],
        }}
        transition={{
          duration: 0.25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}

function Ghost({ color, top, delay }) {
  return (
    <motion.div
      className="absolute -left-32"
      style={{ top: `${top}%` }}
      animate={{ x: "120vw" }}
      transition={{
        duration: 12,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <motion.div
        className="w-16 h-16 rounded-t-full relative"
        style={{ backgroundColor: color }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {/* Eyes */}
        <div className="absolute top-4 left-3 w-3 h-3 bg-white rounded-full">
          <div className="w-1.5 h-1.5 bg-black rounded-full ml-1 mt-1" />
        </div>
        <div className="absolute top-4 right-3 w-3 h-3 bg-white rounded-full">
          <div className="w-1.5 h-1.5 bg-black rounded-full ml-1 mt-1" />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PacManAnimatedBackground() {
  return (
    <div className="fixed inset-0 z-10 pointer-events-none bg-black overflow-hidden">
      {/* Dots */}
      {lanes.map((top, laneIndex) => (
        <div
          key={laneIndex}
          className="absolute left-0 right-0 flex justify-around opacity-60"
          style={{ top: `${top}%` }}
        >
          {dots.map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-yellow-300 rounded-full"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1, delay: i * 0.15, repeat: Infinity }}
            />
          ))}
        </div>
      ))}

      {/* Pac-Men */}
      {lanes.map((top, i) => (
        <PacMan key={i} top={top} delay={i * 1.5} />
      ))}

      {/* Ghosts */}
      {ghosts.map((color, i) => (
        <Ghost key={i} color={color} top={lanes[i]} delay={i * 2} />
      ))}
    </div>
  );
}
