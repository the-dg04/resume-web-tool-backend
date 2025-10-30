"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import useAntiCheat from "../hooks/useAnticheat"; // Adjust path as needed

// --- Helper Components ---

// A single button in the question navigation sidebar
const QuestionNavItem = ({ index, isActive, isAnswered, onClick }) => (
  <button
    onClick={onClick}
    className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-semibold transition-colors duration-200 ${
      isActive
        ? "bg-blue-600 border-blue-500 text-white"
        : isAnswered
        ? "bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30"
        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"
    }`}
  >
    {index + 1}
  </button>
);

// The countdown timer component
const Timer = ({ timeLeft, violationCount }) => {
  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");
  const isLowTime = timeLeft <= 300; // 5 minutes

  return (
    <div className="flex items-center gap-4">
      {/* Violation Counter */}
      {violationCount > 0 && (
        <div
          className={`px-4 py-2 rounded-lg text-lg font-mono tracking-wider ${
            violationCount >= 4 // Show red on 4th violation (one before auto-submit)
              ? "bg-red-500/20 text-red-300"
              : "bg-yellow-500/20 text-yellow-300"
          }`}
          title={`${violationCount} anti-cheat violation(s) detected`}
        >
          Violations: {violationCount} / 5
        </div>
      )}

      {/* Timer */}
      <div
        className={`px-4 py-2 rounded-lg text-lg font-mono tracking-wider ${
          isLowTime ? "bg-red-500/20 text-red-300" : "bg-white/5 text-white/80"
        }`}
      >
        {minutes}:{seconds}
      </div>
    </div>
  );
};

// --- Violation Modal Component ---
const ViolationModal = ({ isOpen, onClose, violationType, violationCount }) => {
  if (!isOpen) return null;

  const violationMessages = {
    tab_switch: "You switched tabs or minimized the window.",
    copy: "Copying text is not allowed.",
    paste: "Pasting text is not allowed.",
    cut: "Cutting text is not allowed.",
    right_click: "Right-clicking is not allowed.",
  };

  const message =
    violationMessages[violationType] || "A violation was detected.";
  const isFinalWarning = violationCount === 4;
  const isAutoSubmit = violationCount >= 5;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-gray-900 border border-red-500/50 rounded-lg shadow-xl p-6 w-full max-w-md text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-red-500 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-white mb-3">
          {isAutoSubmit
            ? "Test Auto-Submitted"
            : isFinalWarning
            ? "Final Warning!"
            : "Violation Detected"}
        </h2>
        <p className="text-white/80 mb-2">{message}</p>
        <p className="text-yellow-300 text-lg font-bold mb-6">
          Violation Count: {violationCount} / 5
        </p>
        {!isAutoSubmit && (
          <button
            onClick={onClose}
            className="w-full px-6 py-2 rounded-md bg-red-600 text-white font-bold hover:bg-red-500 transition-colors"
          >
            I Understand
          </button>
        )}
      </div>
    </div>
  );
};

// --- Start Test Overlay Component ---
const StartTestOverlay = ({ onStart }) => (
  <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center text-center p-8">
    <h1 className="text-4xl font-bold mb-4">Mock Test</h1>
    <p className="text-white/70 text-lg max-w-xl mb-8">
      This test will run in fullscreen mode. Any attempt to exit fullscreen,
      switch tabs, copy, or paste will be flagged as a violation.
      <br />
      <strong className="text-yellow-300 mt-2 block">
        5 violations will result in an automatic submission of your test.
      </strong>
    </p>
    <button
      onClick={onStart}
      className="px-10 py-4 rounded-md bg-blue-600 text-white text-lg font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
    >
      Start Test in Fullscreen
    </button>
  </div>
);

// --- Main Page Component ---

export default function MockTestPage() {
  // --- State Management ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // Default: 30 minutes
  const [allQuestions, setAllQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTestStarted, setIsTestStarted] = useState(false); // New state for start overlay
  const [isViolationModalOpen, setIsViolationModalOpen] = useState(false); // New state for modal
  const [lastViolationType, setLastViolationType] = useState(""); // New state for modal
  const router = useRouter();

  // --- Handlers ---

  // Wrapped handleSubmit in useCallback
  const handleSubmit = useCallback(() => {
    // Prevent multiple submissions
    if (isSubmitted) return;
    
    console.log("Submitting final answers:", answers);

    localStorage.removeItem("mocktest_questions");
    localStorage.removeItem("mocktest_answers");
    localStorage.removeItem("mocktest_endTime");
    localStorage.removeItem("mocktest_started");

    localStorage.setItem(
      "postmocktest",
      JSON.stringify({
        questions: allQuestions,
        answers: answers,
        testDuration: 30 * 60,
        attemptDuration: 30 * 60 - timeLeft,
        difficulty: "actual",
      })
    );

    setIsSubmitted(true);
    setTimeLeft(0);
    // Exit fullscreen if user is still in it
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, [answers, allQuestions, timeLeft, isSubmitted]);

  // --- Anti-Cheat Hook ---
  const handleViolation = useCallback(
    (violationType, newCount) => {
      console.warn(
        `Anti-cheat violation detected: ${violationType}, Count: ${newCount}`
      );
      setLastViolationType(violationType);
      setIsViolationModalOpen(true);

      if (newCount >= 5) {
        // Auto-submit. We don't close the modal, it will be replaced by the submit screen.
        setTimeout(() => handleSubmit(), 2000); // Short delay so user sees the "auto-submit" message
      }
    },
    [handleSubmit]
  );

  const { violationCount, requestFullscreen } = useAntiCheat({
    onViolation: handleViolation,
    enabled: isTestStarted && !isLoading && !isSubmitted, // Only enable when test is active
  });

  // --- New Handler for Starting Test ---
  const handleStartTest = () => {
    requestFullscreen(); // Request fullscreen
    setIsTestStarted(true); // Hide overlay, show test

    // Initialize the timer
    const newEndTime = Date.now() + 30 * 60 * 1000;
    localStorage.setItem("mocktest_endTime", JSON.stringify(newEndTime));
    setTimeLeft(30 * 60);
  };

  // --- Effects ---

  // Effect for loading questions (runs once)
  useEffect(() => {
    if (localStorage.getItem("mocktest_started") === "true") {
      localStorage.removeItem("mocktest_questions");
      localStorage.removeItem("mocktest_answers");
      localStorage.removeItem("mocktest_endTime");
      localStorage.removeItem("mocktest_started");
      router.push("/premocktest");
      return;
    }

    const questionsDataString = localStorage.getItem("mocktest_questions");
    if (!questionsDataString) {
      router.push("/premocktest");
      return;
    }

    localStorage.setItem("mocktest_started", "true");

    try {
      const questionsData = JSON.parse(questionsDataString);
      const flattenQuestions = (data) => {
        const open = data.questions.open_questions.map((q) => ({
          type: "open",
          text: q,
        }));
        const mcqs = data.questions.mcq.map((q) => ({
          type: "mcq",
          text: q.question,
          options: q.options,
        }));
        return [...open, ...mcqs];
      };
      setAllQuestions(flattenQuestions(questionsData));
    } catch (error) {
      console.error("Failed to parse mock test data:", error);
      localStorage.removeItem("mocktest_questions");
      localStorage.removeItem("mocktest_started");
      router.push("/premocktest");
      return;
    }

    // Timer logic is MOVED to handleStartTest
    setIsLoading(false);
  }, [router]);

  // Corrected timer effect
  useEffect(() => {
    // Don't run timer if test hasn't started, is loading, or is submitted
    if (!isTestStarted || isLoading || isSubmitted) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isTestStarted, isLoading, isSubmitted, handleSubmit]);

  const handleAnswerChange = (index, answer) => {
    setAnswers((prev) => ({ ...prev, [index]: answer }));
  };

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <p className="text-lg animate-pulse">Loading Test...</p>
      </div>
    );
  }

  // Show Start Overlay first
  if (!isTestStarted) {
    return <StartTestOverlay onStart={handleStartTest} />;
  }

  // Show Submission Screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center text-center p-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-24 w-24 text-green-400 mb-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="text-4xl font-bold mb-2">Test Submitted!</h1>
        {violationCount >= 5 && (
           <p className="text-red-400 text-lg mb-2">This test was auto-submitted due to {violationCount} violations.</p>
        )}
        <p className="text-white/70 text-lg">
          Your answers have been recorded. You can now safely close this page.
        </p>
        <button
          onClick={() => router.push("/postmocktest")}
          className="mt-8 px-8 py-3 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
        >
          View Analysis
        </button>
      </div>
    );
  }

  // --- Main Test UI ---
  return (
    <div className="min-h-screen bg-black text-white flex font-sans">
      {/* Violation Modal */}
      <ViolationModal
        isOpen={isViolationModalOpen}
        onClose={() => setIsViolationModalOpen(false)}
        violationType={lastViolationType}
        violationCount={violationCount}
      />

      {/* Collapsible Sidebar */}
      <aside
        className={`bg-gray-900/80 backdrop-blur-sm border-r border-white/10 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64 p-4" : "w-0 p-0 overflow-hidden"
        }`}
      >
        <h2 className="text-xl font-bold mb-4 text-white/90">Questions</h2>
        <div className="grid grid-cols-4 gap-2">
          {allQuestions.map((_, index) => (
            <QuestionNavItem
              key={index}
              index={index}
              isActive={index === currentQuestionIndex}
              isAnswered={!!answers[index]}
              onClick={() => setCurrentQuestionIndex(index)}
            />
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 md:p-8 relative">
        {/* Header Section */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-semibold text-white/90">
              Question {currentQuestionIndex + 1}
              <span className="text-base font-normal text-white/50 ml-2">
                / {allQuestions.length}
              </span>
            </h1>
          </div>
          <Timer timeLeft={timeLeft} violationCount={violationCount} />
        </header>

        {/* Question and Answer Area */}
        <div className="flex-1 bg-white/5 rounded-xl border border-white/10 p-6 overflow-y-auto">
          <p className="text-lg text-white/90 mb-6 leading-relaxed">
            {allQuestions[currentQuestionIndex].text}
          </p>

          {allQuestions[currentQuestionIndex].type === "open" ? (
            <textarea
              value={answers[currentQuestionIndex] || ""}
              onChange={(e) =>
                handleAnswerChange(currentQuestionIndex, e.target.value)
              }
              placeholder="Type your answer here..."
              className="w-full h-48 p-3 bg-black/30 border border-white/10 rounded-lg text-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          ) : (
            <div className="space-y-3">
              {allQuestions[currentQuestionIndex].options.map((option, i) => (
                <label
                  key={i}
                  className={`flex items-center p-3 rounded-lg border transition-colors cursor-pointer ${
                    answers[currentQuestionIndex] === option
                      ? "bg-blue-500/20 border-blue-500"
                      : "bg-black/20 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={option}
                    checked={answers[currentQuestionIndex] === option}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestionIndex, e.target.value)
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-600 ring-offset-gray-800 focus:ring-2"
                  />
                  <span className="ml-3 text-white/90">{option}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer Navigation & Submission */}
        <footer className="mt-6 flex justify-between items-center">
          <div>
            <button
              onClick={() => setCurrentQuestionIndex((p) => Math.max(0, p - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 rounded-md bg-white/10 text-sm hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentQuestionIndex((p) =>
                  Math.min(allQuestions.length - 1, p + 1)
                )
              }
              disabled={currentQuestionIndex === allQuestions.length - 1}
              className="ml-4 px-6 py-2 rounded-md bg-white/10 text-sm hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>

          <button
            onClick={handleSubmit}
            className="px-8 py-3 rounded-md bg-green-600 text-white font-bold hover:bg-green-500 transition-colors shadow-lg shadow-green-600/20"
          >
            Submit Test
          </button>
        </footer>
      </main>
    </div>
  );
}

