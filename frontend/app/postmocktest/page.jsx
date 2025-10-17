"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Import Child Components
import OverallScore from "../components/analysis/OverallScore";
import KeyInsightsCard from "../components/analysis/KeyInsightsCard";
import AnalyticsCharts from "../components/analysis/AnalyticsCharts";
import DetailedResults from "../components/analysis/DetailedResults";

// --- CORRECTED DUMMY DATA ---
// const dummyData = {
//   overall_score: 7.8,
//   progress_summary: "bhai padhai karle thodi",
//   grade: "B+",
//   feedback: {
//     strengths: [
//       "Strong understanding of JavaScript fundamentals",
//       "Good explanation of closures with practical examples",
//       "Accurate MCQ responses",
//     ],
//     weaknesses: [
//       "Could improve depth in CSS box model explanation",
//       "React hooks answer lacked code examples",
//     ],
//     suggestions: [
//       "Practice more React hooks with real-world scenarios",
//       "Study CSS layout techniques in depth",
//       "Work on structuring longer technical answers",
//     ],
//   },
//   detailed_results: [
//     {
//       question_number: 1,
//       type: "open",
//       question:
//         "Describe the concept of closures in JavaScript. Provide a simple code example.",
//       answer:
//         "Closures are functions that retain access to their lexical scope even when executed outside that scope. Example: function outer(){ let x=1; return function(){ return x; } }",
//       score: 8.5,
//       topic: "JavaScript",
//       feedback:
//         "Excellent explanation and example; could mention memory implications and garbage collection interaction.",
//       key_points_covered: ["definition", "lexical scope", "example"],
//       key_points_missed: [
//         "memory implications",
//         "common pitfalls (e.g., loop variable capture)",
//       ],
//     },
//     {
//       question_number: 2,
//       type: "open",
//       question:
//         "What are the main differences between let, const, and var in JavaScript?",
//       answer:
//         "let and const are block-scoped; var is function-scoped. const creates bindings that can't be reassigned; let allows reassignment. var hoists differently and doesn't have TDZ.",
//       score: 7.5,
//       topic: "JavaScript",
//       feedback:
//         "Covered core differences; missed explicit discussion of Temporal Dead Zone and reassignment vs mutation distinctions for const.",
//       key_points_covered: ["scope differences", "reassignment vs binding"],
//       key_points_missed: [
//         "Temporal Dead Zone (TDZ)",
//         "const mutation vs reassignment nuance",
//       ],
//     },
//     {
//       question_number: 3,
//       type: "open",
//       question: "Explain the box model in CSS.",
//       answer:
//         "The CSS box model consists of content, padding, border, and margin. Width/height apply to content box by default; box-sizing can change this behavior.",
//       score: 6.5,
//       topic: "CSS",
//       feedback:
//         "Basic elements described correctly but lacked examples or diagrams and didn't cover box-sizing values in depth or collapsing margins.",
//       key_points_covered: ["content", "padding", "border", "margin"],
//       key_points_missed: [
//         "box-sizing impact (content-box vs border-box)",
//         "collapsing margins and layout implications",
//       ],
//     },
//     {
//       question_number: 4,
//       type: "open",
//       question:
//         "What is the purpose of the useEffect hook in React? Describe its dependency array.",
//       answer:
//         "useEffect runs side-effects after render. The dependency array controls when the effect runs: empty array runs once, omitted runs every render, listed dependencies rerun effect when they change.",
//       score: 7.5,
//       topic: "React",
//       feedback:
//         "Correct description and dependency rules; would benefit from code examples showing cleanup, and mention of stale closures and recommended patterns.",
//       key_points_covered: [
//         "purpose (side-effects)",
//         "dependency array behavior",
//         "empty array vs omitted",
//       ],
//       key_points_missed: [
//         "cleanup functions",
//         "stale closure pitfalls and lint rules (exhaustive-deps)",
//       ],
//     },
//     {
//       question_number: 5,
//       type: "mcq",
//       question:
//         "Which of the following is NOT a primitive data type in JavaScript?",
//       answer: "c. Object",
//       score: 10.0,
//       topic: "JavaScript",
//       feedback: "Correct — Object is not a primitive type.",
//       key_points_covered: ["correct identification of non-primitive type"],
//       key_points_missed: [],
//     },
//     {
//       question_number: 6,
//       type: "mcq",
//       question: "What does CSS stand for?",
//       answer: "b. Cascading Style Sheets",
//       score: 10.0,
//       topic: "CSS",
//       feedback: "Correct — Cascading Style Sheets.",
//       key_points_covered: ["correct acronym expansion"],
//       key_points_missed: [],
//     },
//     {
//       question_number: 7,
//       type: "mcq",
//       question:
//         "Which hook is used to manage state in a functional React component?",
//       answer: "c. useState",
//       score: 9.0,
//       topic: "React",
//       feedback:
//         "Correct — useState is used for state; partial credit deduction for not mentioning useReducer for more complex state patterns.",
//       key_points_covered: ["correct identification of state hook"],
//       key_points_missed: ["mentioning useReducer for complex state"],
//     },
//     {
//       question_number: 8,
//       type: "mcq",
//       question: "What HTTP status code represents a successful request?",
//       answer: "a. 200",
//       score: 9.0,
//       topic: "HTTP",
//       feedback: "Correct — 200 OK. Could mention other 2xx codes for nuance.",
//       key_points_covered: ["correct identification of success status code"],
//       key_points_missed: [
//         "mentioning other successful 2xx status codes for nuance",
//       ],
//     },
//   ],
//   analytics: {
//     performance_by_topic: [
//       { topic: "JavaScript", score: 8.2 },
//       { topic: "CSS", score: 6.5 },
//       { topic: "React", score: 7.5 },
//       { topic: "HTTP", score: 9.0 },
//     ],
//     performance_by_type: [
//       { type: "open", avg_score: 7.5, count: 4 },
//       { type: "mcq", avg_score: 9.25, count: 4, accuracy: 0.875 },
//     ],
//     difficulty_analysis: {
//       easy: { count: 2, avg_score: 9.5 },
//       medium: { count: 4, avg_score: 7.75 },
//       hard: { count: 2, avg_score: 7.5 },
//     },
//     answer_quality_metrics: {
//       avg_length_words: 85,
//       completeness_score: 7.8,
//       clarity_score: 8.2,
//       technical_accuracy: 7.5,
//     },
//     time_spent_analysis: {
//       total_time_minutes: 25,
//       avg_time_per_question_seconds: 187,
//       questions_rushed: [2, 5],
//       questions_overthought: [],
//     },
//     skill_radar: {
//       "Technical Knowledge": 8.0,
//       "Problem Solving": 7.5,
//       Communication: 8.5,
//       "Depth of Understanding": 7.0,
//       "Practical Application": 7.8,
//     },
//     comparison_metrics: {
//       percentile: 72,
//       better_than_average_by: 1.2,
//     },
//     // FIX: This object is now correctly populated
//     progress_over_questions: {
//       scores: [8.5, 7.0, 6.5, 8.0, 9.0, 7.5, 8.5, 7.0],
//     },
//   },
//   recommendations: {
//     focus_areas: ["CSS layouts", "React advanced patterns"],
//     practice_resources: [
//       { topic: "CSS", resource: "MDN Box Model Guide" },
//       { topic: "React", resource: "React Hooks Documentation" },
//     ],
//     next_steps: "Consider taking intermediate React assessment",
//   },
// };

const dummyData = {
  progress_summary:
    "The candidate demonstrated a solid understanding of fundamental concepts, particularly excelling in multiple-choice questions, but showed some areas for deeper elaboration in open-ended responses.",
  overall_score: 8,
  grade: "B",
  feedback: {
    strengths: [
      "Strong foundational knowledge across JavaScript, React, CSS, and HTTP.",
      "Excellent accuracy on multiple-choice questions, indicating a good grasp of core definitions and facts.",
      "Correctly identified key differences between let, const, and var and the basic purpose of useEffect.",
    ],
    weaknesses: [
      "Open-ended answers often lacked the depth and comprehensive detail expected at an intermediate level.",
      "Failed to provide a code example for closures, despite it being explicitly requested in the question.",
      "Explanations for the CSS Box Model and useEffect hook were concise but could have been more thorough, covering nuances and practical implications.",
    ],
    suggestions: [
      "Practice elaborating on conceptual questions, providing more context, examples, and practical applications.",
      "Ensure all parts of a question are addressed, especially when code examples or specific descriptions are requested.",
      "Focus on understanding the 'how' and 'why' behind concepts, not just the 'what', to demonstrate deeper knowledge.",
    ],
  },
  detailed_results: [
    {
      question_number: 1,
      type: "open",
      question:
        "Describe the concept of closures in JavaScript. Provide a simple code example.",
      answer:
        "A closure is when a function can access variables from its outer scope even after the outer function has returned.",
      score: 6,
      topic: "JavaScript",
      feedback:
        "The definition of a closure is accurate, correctly identifying the core mechanism. However, the answer is incomplete as it explicitly requested a code example, which was not provided. For an intermediate level, a brief mention of lexical scoping or practical use cases would also enhance the answer.",
      key_points_covered: [
        "Function accessing outer scope variables",
        "Persistence after outer function returns",
      ],
      key_points_missed: [
        "Code example (explicitly requested)",
        "Lexical scoping context",
        "Practical applications (e.g., data privacy, currying)",
      ],
    },
    {
      question_number: 2,
      type: "open",
      question:
        "What are the main differences between let, const, and var in JavaScript?",
      answer:
        "let and const are block-scoped, var is function-scoped. const variables cannot be reassigned.",
      score: 8,
      topic: "JavaScript",
      feedback:
        "This answer correctly identifies the primary differences regarding scoping (block vs. function) and the immutability of const variables. It's a solid explanation for an intermediate level, covering the most critical distinctions.",
      key_points_covered: [
        "Block-scoping for let/const",
        "Function-scoping for var",
        "Const prevents reassignment",
      ],
      key_points_missed: [
        "Hoisting behavior differences",
        "Temporal Dead Zone (TDZ)",
        "Re-declaration differences",
      ],
    },
    {
      question_number: 3,
      type: "open",
      question: "Explain the box model in CSS.",
      answer:
        "The box model defines how elements are structured using content, padding, border, and margin.",
      score: 5,
      topic: "CSS",
      feedback:
        "The answer correctly lists the components of the CSS box model. However, for an intermediate level, it lacks depth. A more comprehensive explanation would describe the role of each component and how they contribute to an element's total size, ideally mentioning the box-sizing property and its impact.",
      key_points_covered: ["Content, padding, border, margin components"],
      key_points_missed: [
        "Explanation of each component's function",
        "Impact on element's total dimensions",
        "box-sizing property (content-box vs. border-box)",
      ],
    },
    {
      question_number: 4,
      type: "open",
      question:
        "What is the purpose of the useEffect hook in React? Describe its dependency array.",
      answer:
        "useEffect allows you to perform side effects in function components, controlled by the dependency array.",
      score: 7,
      topic: "React",
      feedback:
        "The answer correctly states the purpose of useEffect (side effects) and mentions the dependency array's role in control. For an intermediate level, more detail on what constitutes a 'side effect' (e.g., data fetching, subscriptions) and a clearer explanation of how the dependency array controls execution (e.g., empty array for mount, no array for every render, specific dependencies for updates) would improve the answer.",
      key_points_covered: [
        "Perform side effects in functional components",
        "Controlled by dependency array",
      ],
      key_points_missed: [
        "Examples of side effects",
        "Detailed explanation of dependency array behavior (empty, no array, specific values)",
        "Cleanup function concept",
      ],
    },
    {
      question_number: 5,
      type: "mcq",
      question:
        "Which of the following is NOT a primitive data type in JavaScript?",
      answer: "c. Object",
      score: 10,
      topic: "JavaScript",
      feedback: "Correct answer.",
      key_points_covered: ["Correctly identified Object as non-primitive"],
      key_points_missed: [],
    },
    {
      question_number: 6,
      type: "mcq",
      question: "What does CSS stand for?",
      answer: "b. Cascading Style Sheets",
      score: 10,
      topic: "CSS",
      feedback: "Correct answer.",
      key_points_covered: ["Correctly identified full form of CSS"],
      key_points_missed: [],
    },
    {
      question_number: 7,
      type: "mcq",
      question:
        "Which hook is used to manage state in a functional React component?",
      answer: "c. useState",
      score: 10,
      topic: "React",
      feedback: "Correct answer.",
      key_points_covered: [
        "Correctly identified useState for state management",
      ],
      key_points_missed: [],
    },
    {
      question_number: 8,
      type: "mcq",
      question: "What HTTP status code represents a successful request?",
      answer: "a. 200",
      score: 10,
      topic: "HTTP",
      feedback: "Correct answer.",
      key_points_covered: ["Correctly identified 200 as success status code"],
      key_points_missed: [],
    },
  ],
  analytics: {
    performance_by_topic: [
      {
        topic: "JavaScript",
        score: 8,
      },
      {
        topic: "CSS",
        score: 7,
      },
      {
        topic: "React",
        score: 8,
      },
      {
        topic: "HTTP",
        score: 10,
      },
    ],
    performance_by_type: [
      {
        type: "open",
        avg_score: 6,
        count: 4,
        accuracy: 65,
      },
      {
        type: "mcq",
        avg_score: 10,
        count: 4,
        accuracy: 100,
      },
    ],
    difficulty_analysis: {
      easy: {
        count: 4,
        avg_score: 10,
      },
      medium: {
        count: 2,
        avg_score: 7,
      },
      hard: {
        count: 2,
        avg_score: 5,
      },
    },
    answer_quality_metrics: {
      avg_length_words: 8,
      completeness_score: 7,
      clarity_score: 9,
      technical_accuracy: 9,
    },
    time_spent_analysis: {
      total_time_minutes: 14,
      avg_time_per_question_seconds: 106,
      questions_rushed: [1, 3, 4],
      questions_overthought: [],
    },
    skill_radar: {
      "Technical Knowledge": 8,
      "Problem Solving": 7,
      Clarity: 9,
      Depth: 6,
    },
    comparison_metrics: {
      percentile: 75,
      better_than_average_by: 1.25,
    },
    progress_over_questions: {
      scores: [6, 8, 5, 7, 10, 10, 10, 10],
    },
  },
  recommendations: {
    focus_areas: [
      "JavaScript Closures (including practical examples and code)",
      "CSS Box Model (detailed explanation of components and box-sizing)",
      "React useEffect Hook (nuances of dependency array, cleanup function, common side effects)",
    ],
    practice_resources: [
      {
        topic: "JavaScript",
        resource: "MDN Web Docs: Closures, Scoping",
      },
      {
        topic: "CSS",
        resource: "MDN Web Docs: The Box Model, box-sizing",
      },
      {
        topic: "React",
        resource: "React Official Documentation: Hooks (useEffect)",
      },
      {
        topic: "General",
        resource:
          "Interactive coding platforms (e.g., LeetCode, HackerRank) for applying concepts",
      },
    ],
    next_steps:
      "Review fundamental concepts with an emphasis on providing detailed explanations and practical examples. Practice articulating technical concepts verbally and in writing to improve depth of understanding and communication skills.",
  },
};

export default function PostMockTestPage() {
  const [analysisData, setAnalysisData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const dataString = localStorage.getItem("postmocktest");
    if (dataString) {
      try {
        const data = JSON.parse(dataString);
        setAnalysisData({ ...dummyData, ...data });
      } catch (error) {
        console.error(
          "Failed to parse analysis data from localStorage:",
          error
        );
        setAnalysisData(dummyData);
      }
    } else {
      console.warn("No analysis data found in localStorage. Using dummy data.");
      setAnalysisData(dummyData);
    }
  }, []);

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <p className="text-lg animate-pulse">Loading Analysis...</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans p-4 md:p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto"
      >
        <motion.header variants={itemVariants} className="mb-8">
          <h1 className="text-4xl font-bold text-white/90">Test Report</h1>
          <p className="text-white/60 mt-1 italic mb-2">
            "{dummyData.progress_summary}"
          </p>
          <p className="text-white/60 mt-1">
            Here's a detailed breakdown of your performance.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <motion.div variants={itemVariants}>
              <OverallScore
                score={analysisData.overall_score}
                grade={analysisData.grade}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KeyInsightsCard feedback={analysisData.feedback} />
            </motion.div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <motion.div variants={itemVariants}>
              <AnalyticsCharts analytics={analysisData.analytics} />
            </motion.div>
          </div>
        </div>

        <motion.div variants={itemVariants} className="mt-6">
          <DetailedResults results={analysisData.detailed_results} />
        </motion.div>

        <motion.div variants={itemVariants} className="mt-12 text-center">
          <button
            onClick={() => router.push("/premocktest")}
            className="px-8 py-3 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
          >
            Take Another Test
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
