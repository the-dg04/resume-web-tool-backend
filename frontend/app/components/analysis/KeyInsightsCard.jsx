import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

const InsightList = ({ title, items, icon: Icon, colorClass }) => (
  <div>
    <h4 className={`flex items-center text-lg font-semibold mb-3 ${colorClass}`}>
      <Icon className="w-5 h-5 mr-2" />
      {title}
    </h4>
    <ul className="space-y-2">
      {items.map((item, index) => (
        <motion.li
          key={index}
          className="flex items-start text-sm text-white/80"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + index * 0.1 }}
        >
          <span className={`mr-2 mt-1 ${colorClass}`}>•</span>
          {item}
        </motion.li>
      ))}
    </ul>
  </div>
);

const KeyInsightsCard = ({ feedback }) => {
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 h-full space-y-6">
      <h3 className="text-xl font-semibold text-white/90">Key Insights</h3>
      <InsightList title="Strengths" items={feedback.strengths} icon={CheckCircle2} colorClass="text-green-400" />
      <InsightList title="Areas for Improvement" items={feedback.weaknesses} icon={XCircle} colorClass="text-red-400" />
      <InsightList title="Suggestions" items={feedback.suggestions} icon={Lightbulb} colorClass="text-yellow-400" />
    </div>
  );
};

export default KeyInsightsCard;