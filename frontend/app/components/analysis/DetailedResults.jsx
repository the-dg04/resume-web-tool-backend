import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X } from 'lucide-react';

const ResultItem = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);

    const scoreColor = item.score >= 8 ? 'text-green-400' : item.score >= 6 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="border-b border-white/10">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left hover:bg-white/5 transition-colors"
            >
                <span className="flex-1 font-medium text-white/90">
                    Q{item.question_number}: <span className="text-white/70 font-normal">{item.question}</span>
                </span>
                <div className="flex items-center ml-4">
                    <span className={`font-bold mr-4 ${scoreColor}`}>{item.score.toFixed(1)}/10</span>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                        <ChevronDown className="w-5 h-5 text-white/50" />
                    </motion.div>
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 bg-black/20 text-sm space-y-4">
                            <div>
                                <h5 className="font-semibold text-white/70 mb-1">Your Answer:</h5>
                                <p className="text-white/80 leading-relaxed bg-black/30 p-3 rounded-md border border-white/10">{item.answer}</p>
                            </div>
                             <div>
                                <h5 className="font-semibold text-white/70 mb-1">Feedback:</h5>
                                <p className="text-white/80 leading-relaxed">{item.feedback}</p>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h5 className="font-semibold text-green-400 mb-2">Key Points Covered</h5>
                                    <ul className="space-y-1">
                                        {item.key_points_covered.map((point, i) => (
                                            <li key={i} className="flex items-center text-white/80"><Check className="w-4 h-4 mr-2 text-green-500" /> {point}</li>
                                        ))}
                                    </ul>
                                </div>
                                 <div>
                                    <h5 className="font-semibold text-red-400 mb-2">Key Points Missed</h5>
                                    <ul className="space-y-1">
                                        {item.key_points_missed.map((point, i) => (
                                            <li key={i} className="flex items-center text-white/80"><X className="w-4 h-4 mr-2 text-red-500" /> {point}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DetailedResults = ({ results }) => (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-xl">
         <h3 className="text-xl font-semibold text-white/90 p-4 border-b border-white/10">Detailed Question Analysis</h3>
        <div>
            {results.map((item) => (
                <ResultItem key={item.question_number} item={item} />
            ))}
        </div>
    </div>
);

export default DetailedResults;