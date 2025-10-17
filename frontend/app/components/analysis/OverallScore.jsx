import { motion } from "framer-motion";
import { Circle, CheckCircle2 } from "lucide-react";

const OverallScore = ({ score, grade }) => {
  const scorePercentage = score * 10;
  const circumference = 2 * Math.PI * 55; // 2 * pi * radius

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center h-full">
      <h3 className="text-xl font-semibold text-white/90 mb-4">Overall Performance</h3>
      <div className="relative w-40 h-40">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          {/* Background Circle */}
          <circle
            cx="60"
            cy="60"
            r="55"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="10"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="60"
            cy="60"
            r="55"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (scorePercentage / 100) * circumference }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            transform="rotate(-90 60 60)"
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-bold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {score.toFixed(1)}
          </motion.span>
          <span className="text-sm text-white/50">/ 10</span>
        </div>
      </div>
      <div className="mt-4">
        <span className="text-sm text-white/60">Your Grade</span>
        <p className="text-3xl font-bold text-green-400">{grade}</p>
      </div>
    </div>
  );
};

export default OverallScore;