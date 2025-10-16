"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

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
const Timer = ({ timeLeft }) => {
  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");
  const isLowTime = timeLeft <= 300; // 5 minutes

  return (
    <div
      className={`px-4 py-2 rounded-lg text-lg font-mono tracking-wider ${
        isLowTime ? "bg-red-500/20 text-red-300" : "bg-white/5 text-white/80"
      }`}
    >
      {minutes}:{seconds}
    </div>
  );
};

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
  const router = useRouter()
  
  // --- Handlers ---

  // FIX: Wrapped handleSubmit in useCallback for stability and to prevent unnecessary re-renders.
  const handleSubmit = useCallback(() => {
    console.log("Submitting final answers:", answers);

    // FIX: Clear all test-related data from localStorage upon successful submission.
    localStorage.removeItem("mocktest_questions");
    localStorage.removeItem("mocktest_answers");
    localStorage.removeItem("mocktest_endTime");
    localStorage.removeItem("mocktest_started");

    setIsSubmitted(true); // Show submission confirmation screen
    setTimeLeft(0); // Stop the timer
  }, [answers]);

  // --- Effects ---

  // FIX: Added logic to prevent test re-entry on page reload.
  useEffect(() => {
    // If a 'started' flag exists in localStorage, it means the user is reloading
    // an in-progress test. The desired behavior is to end that session and redirect.
    if (localStorage.getItem("mocktest_started")==="true") {
      // Clear all remnants of the old test.
      localStorage.removeItem("mocktest_questions");
      localStorage.removeItem("mocktest_answers");
      localStorage.removeItem("mocktest_endTime");
      localStorage.removeItem("mocktest_started");
      // Redirect to the page where new tests are initiated.
      // window.location.href = "/premocktest";
      router.push("/premocktest")
      return; // Stop further execution in this component.
    }

    // 1. Check for question data. If it's missing, the user probably navigated here directly.
    const questionsDataString = localStorage.getItem("mocktest_questions");
    if (!questionsDataString) {
      router.push("/premocktest")
      return;
    }

    // This is a valid, first-time entry for this test.
    // Set the 'started' flag to prevent reloads/re-entry.
    localStorage.setItem("mocktest_started", "true");

    // 2. Parse and set questions.
    try {
      const questionsData = JSON.parse(questionsDataString);
      const flattenQuestions = (data) => {
        const open = data.questions.open_questions.map((q) => ({ type: "open", text: q }));
        const mcqs = data.questions.mcq.map((q) => ({ type: "mcq", text: q.question, options: q.options }));
        return [...open, ...mcqs];
      };
      setAllQuestions(flattenQuestions(questionsData));
    } catch (error) {
      console.error("Failed to parse mock test data:", error);
      localStorage.removeItem("mocktest_questions");
      localStorage.removeItem("mocktest_started"); // Clean up flag if parsing fails
      window.location.href = "/premocktest"; // Redirect on parsing error
      return;
    }

    // 3. Initialize the timer for a new test session.
    // We don't need to check for an existing timer since reloads are disabled.
    const newEndTime = Date.now() + 30 * 60 * 1000;
    localStorage.setItem("mocktest_endTime", JSON.stringify(newEndTime));
    setTimeLeft(30 * 60);

    setIsLoading(false); // Mark loading as complete
  }, []); // Empty dependency array ensures this runs only once on initial mount.

  // FIX: Corrected timer effect. It's now robust and handles auto-submission correctly.
  useEffect(() => {
    if (isLoading || isSubmitted) return; // Don't run the timer if loading or submitted.

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId); // Cleanup interval on component unmount or re-render.
  }, [timeLeft, isLoading, isSubmitted, handleSubmit]);

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

  // FIX: Replaced alert() with a dedicated submission screen for a better UX.
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center text-center p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-4xl font-bold mb-2">Test Submitted!</h1>
        <p className="text-white/70 text-lg">Your answers have been recorded. You can now safely close this page.</p>
         <button
            onClick={() => window.location.href = '/premocktest'}
            className="mt-8 px-8 py-3 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
          >
            Take Another Test
          </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex font-sans">
      {/* Collapsible Sidebar for Question Navigation */}
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-semibold text-white/90">
              Question {currentQuestionIndex + 1}
              <span className="text-base font-normal text-white/50 ml-2">
                / {allQuestions.length}
              </span>
            </h1>
          </div>
          <Timer timeLeft={timeLeft} />
        </header>

        {/* Question and Answer Area */}
        <div className="flex-1 bg-white/5 rounded-xl border border-white/10 p-6 overflow-y-auto">
          <p className="text-lg text-white/90 mb-6 leading-relaxed">
            {allQuestions[currentQuestionIndex].text}
          </p>

          {/* Conditional rendering for answer input type */}
          {allQuestions[currentQuestionIndex].type === "open" ? (
            <textarea
              // FIX: Use `|| ""` to prevent React's uncontrolled/controlled component warning.
              value={answers[currentQuestionIndex] || ""}
              onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
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
                    onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
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
              onClick={() => setCurrentQuestionIndex((p) => Math.min(allQuestions.length - 1, p + 1))}
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


