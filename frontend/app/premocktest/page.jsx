"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE;
const ML_BACKEND_URL = process.env.NEXT_PUBLIC_ML_API_BASE;

const dummyData = {
  tier: "freemium",
  questions: {
    open_questions: [
      "Describe the concept of closures in JavaScript. Provide a simple code example.",
      "What are the main differences between `let`, `const`, and `var` in JavaScript?",
      "Explain the box model in CSS.",
      "What is the purpose of the `useEffect` hook in React? Describe its dependency array.",
    ],
    mcq: [
      {
        question:
          "Which of the following is NOT a primitive data type in JavaScript?",
        options: [
          "a. String",
          "b. Number",
          "c. Object",
          "d. Boolean",
          "e. Undefined",
        ],
      },
      {
        question: "What does CSS stand for?",
        options: [
          "a. Creative Style Sheets",
          "b. Cascading Style Sheets",
          "c. Computer Style Sheets",
          "d. Colorful Style Sheets",
        ],
      },
      {
        question:
          "Which hook is used to manage state in a functional React component?",
        options: [
          "a. useEffect",
          "b. useContext",
          "c. useState",
          "d. useReducer",
        ],
      },
      {
        question: "What HTTP status code represents a successful request?",
        options: ["a. 200", "b. 404", "c. 500", "d. 301"],
      },
    ],
  },
  total_questions: 8,
  status: "success",
};

// --- Helper Objects for New Inputs ---
const difficultyLevels = ["novice", "intermediate", "actual", "challenge"];
const difficultyDescriptions = {
  novice:
    "Focuses on fundamental concepts and basic syntax. Ideal for beginners.",
  intermediate:
    "Covers a broader range of topics with more complex problems. Suitable for those with some experience.",
  actual:
    "Simulates a real interview scenario with questions matching the job description's expected skill level.",
  challenge:
    "Presents difficult problems and advanced concepts to push your knowledge to its limits.",
};

// --- Main Page Component ---

export default function TestSetupPage() {
  // --- State Management ---
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [token, setToken] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [difficulty, setDifficulty] = useState("actual");
  const [duration, setDuration] = useState("30");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const t = localStorage.getItem("token");
      if (t) {
        setToken(t);
        const decoded = jwtDecode(t);
        if (decoded?.role !== "user") router.push("/403");
      }
    } catch (err) {
      console.log(err);
      // router.push("/");
    }
  }, []);

  // --- Handlers ---
  const handleStartTest = async (e) => {
    e.preventDefault();
    if (!selectedResume || !jobDescription.trim()) {
      alert("Please select a resume and enter a job description.");
      return;
    }

    setIsLoading(true);
    console.log("Starting test with the following configuration:");
    console.log({
      resumeId: selectedResume,
      jobDescription: jobDescription,
      difficulty: difficulty,
      duration: `${duration} min`,
    });

    try {
      let resumeId = -1;
      resumes.forEach((val,idx)=>{
        if(val.resume_id==selectedResume){
          resumeId = idx
        }
      })
      console.log("id : ",resumeId);
      console.log("resumes : ",resumes);
      console.log({
        resume_url: resumes[resumeId].resume_url,
        job_description: jobDescription,
        difficulty: difficulty,
        duration: duration,
        tier: "free",
      });
      const res = await fetch(`${ML_BACKEND_URL}/generate-test/generate-test`, {
        method: "POST",
        headers: {
          "Content-type": "Application/json",
        },
        body: JSON.stringify({
          resume_url: resumes[resumeId].resume_url,
          job_description: jobDescription,
          difficulty: difficulty,
          duration: duration,
          tier: "free",
        }),
      });

      const resJSON = await res.json();

      setIsLoading(false);
      localStorage.setItem("mocktest_questions", JSON.stringify(resJSON));
      localStorage.setItem("mocktest_started", "false");
      router.push("/mocktest");
    } catch (err) {
      console.log(err);
    }
  };

  const handleDifficultyChange = (e) => {
    setDifficulty(difficultyLevels[e.target.value]);
  };

  useEffect(() => {
    if (token) {
      (async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/resumes`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const resJSON = await res.json();
          if (resJSON && resJSON.length > 0) {
            setResumes(resJSON);
            setSelectedResume(resJSON[0]?.resume_id);
          }
        } catch (error) {
          console.error("Failed to fetch resumes:", error);
        }
      })();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-2xl">
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-2xl shadow-black/30 backdrop-blur-sm">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white/90">
              Prepare Your Test
            </h1>
            <p className="text-white/60 mt-2">
              Select your resume and provide the job description to begin.
            </p>
          </div>

          <form onSubmit={handleStartTest} className="space-y-6">
            {/* Resume Selection Dropdown */}
            <div>
              <label
                htmlFor="resume-select"
                className="block text-sm font-medium text-white/70 mb-2"
              >
                Select Resume
              </label>
              <select
                id="resume-select"
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={!resumes.length}
              >
                {resumes.length > 0 ? (
                  resumes.map((resume) => (
                    <option
                      key={resume.resume_id}
                      value={resume.resume_id}
                      className="bg-gray-800 text-white"
                    >
                      {resume.resume_name}
                    </option>
                  ))
                ) : (
                  <option
                    value=""
                    disabled
                    className="bg-gray-800 text-white/50"
                  >
                    No resumes found
                  </option>
                )}
              </select>
            </div>

            {/* Job Description Textarea */}
            <div>
              <label
                htmlFor="job-description"
                className="block text-sm font-medium text-white/70 mb-2"
              >
                Job Description
              </label>
              <textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={8}
                className="w-full rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white/80 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y"
              />
            </div>

            {/* Difficulty Slider */}
            <div>
              <label
                htmlFor="difficulty-slider"
                className="block text-sm font-medium text-white/70 mb-2"
              >
                Difficulty:{" "}
                <span className="font-bold capitalize">{difficulty}</span>
              </label>
              <div className="relative pt-1">
                <input
                  type="range"
                  id="difficulty-slider"
                  min="0"
                  max="3"
                  value={difficultyLevels.indexOf(difficulty)}
                  onChange={handleDifficultyChange}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                {/* Checkpoints */}
                <div className="w-full flex justify-between text-xs text-white/40 px-1 mt-2">
                  {difficultyLevels.map((level) => (
                    <span key={level} className="capitalize">
                      {level}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-white/50 italic mt-2 h-8">
                {difficultyDescriptions[difficulty]}
              </p>
            </div>

            {/* Duration Radio Buttons */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Duration
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    id="duration-30"
                    name="duration"
                    type="radio"
                    value="30"
                    checked={duration === "30"}
                    onChange={(e) => setDuration(e.target.value)}
                    className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="duration-30"
                    className="ml-2 block text-sm text-white/90"
                  >
                    30 minutes
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="duration-60"
                    name="duration"
                    type="radio"
                    value="60"
                    checked={duration === "60"}
                    onChange={(e) => setDuration(e.target.value)}
                    className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="duration-60"
                    className="ml-2 block text-sm text-white/90"
                  >
                    60 minutes
                  </label>
                </div>
              </div>
            </div>

            {/* Start Test Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center rounded-md bg-blue-600 px-8 py-3 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Start Test"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
