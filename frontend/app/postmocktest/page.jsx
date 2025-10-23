"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Import Child Components
import OverallScore from "../components/analysis/OverallScore";
import KeyInsightsCard from "../components/analysis/KeyInsightsCard";
import AnalyticsCharts from "../components/analysis/AnalyticsCharts";
import DetailedResults from "../components/analysis/DetailedResults";

const ML_BACKEND_URL = process.env.NEXT_PUBLIC_ML_API_BASE;

export default function PostMockTestPage() {
  const [analysisData, setAnalysisData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    (async function(){const dataString = localStorage.getItem("postmocktest");
    if (dataString) {
      try {
        const data = JSON.parse(dataString);
        // console.log(data);
        let answers = []
        for(var i=0;i<data.questions.length;i++) answers.push((i in data.answers)?data.answers[i]:"no response")

        const dataParsed = {...data, answers: answers }
        console.log(dataParsed);

        const res = await fetch(`${ML_BACKEND_URL}/evaluate/evaluate`, {
          method: "POST",
          headers: {
            "Content-type": "Application/json",
          },
          body: JSON.stringify(dataParsed),
        });
  
        const resJSON = await res.json();
        console.log(resJSON);
        if(res.status==200) setAnalysisData(resJSON)

      } catch (error) {
        console.error(
          "Failed to parse analysis data from localStorage:",
          error
        );
        // setAnalysisData(dummyData);
      }
    } else {
      console.warn("No analysis data found in localStorage. Using dummy data.");
    }})()
  }, []);

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center">
        <p className="text-lg text-white/80 mb-4">Loading Analysis...</p>
        
        {/* Progress Bar Container */}
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
          {/* Animated inner bar from 0% to 80% */}
          <motion.div
            className="h-full bg-blue-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "95%" }}
            transition={{
              duration: 10, // Adjust duration as needed
              ease: "easeOut", // Starts fast, slows down at the end
            }}
          />
        </div>
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
            "{analysisData.progress_summary}"
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
