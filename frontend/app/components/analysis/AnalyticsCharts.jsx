import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Hourglass,
  Zap,
  Brain,
  Trophy,
  Check,
} from "lucide-react";

const chartCardClasses =
  "bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-xl p-4";

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/70 p-2 border border-white/20 rounded-md text-sm">
        <p className="label text-white/90">{label}</p>
        {payload.map((item, index) => (
          <p key={index} className="intro text-blue-400">
            {`${item.name || item.dataKey}: ${
              typeof item.value === "number"
                ? item.value.toFixed(1)
                : item.value
            }`}
            {item.name === "accuracy" && "%"}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// --- Chart Components ---

const TopicPerformanceChart = ({ data }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className={chartCardClasses}
  >
    <h4 className="text-md font-semibold text-white/90 mb-4">
      Performance by Topic
    </h4>
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <XAxis
          dataKey="topic"
          stroke="rgba(255,255,255,0.5)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="rgba(255,255,255,0.5)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          domain={[0, 10]}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "rgba(255,255,255,0.1)" }}
        />
        <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </motion.div>
);

const SkillRadarChart = ({ data }) => {
  const chartData = Object.keys(data).map((key) => ({
    subject: key,
    A: data[key],
    fullMark: 10,
  }));
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={chartCardClasses}
    >
      <h4 className="text-md font-semibold text-white/90 mb-4">Skill Radar</h4>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="rgba(255,255,255,0.2)" />
          <PolarAngleAxis
            dataKey="subject"
            stroke="rgba(255,255,255,0.7)"
            fontSize={12}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            stroke="rgba(255,255,255,0.2)"
          />
          <Radar
            name="Skills"
            dataKey="A"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

const ProgressChart = ({ data }) => {
  // FIX: Use optional chaining to prevent crash if data or data.scores is undefined.
  const chartData =
    data?.scores?.map((score, index) => ({
      name: `Q${index + 1}`,
      score: score,
    })) || []; // Fallback to an empty array.

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`${chartCardClasses} col-span-1 md:col-span-2`}
    >
      <h4 className="text-md font-semibold text-white/90 mb-4">
        Progress Over Questions
      </h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            fontSize={12}
            domain={[0, 10]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#16A34A"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

const PerformanceByTypeChart = ({ data }) => {
  const COLORS = ["#FF8042", "#00C49F"]; // Colors for open and MCQ
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={chartCardClasses}
    >
      <h4 className="text-md font-semibold text-white/90 mb-4">
        Performance by Type
      </h4>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="avg_score"
            nameKey="type"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2 text-sm text-white/70">
        {data.map((entry, index) => (
          <span key={`legend-${index}`} className="flex items-center">
            <span
              className="inline-block w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            ></span>
            {entry.type} (Avg: {entry.avg_score.toFixed(1)})
          </span>
        ))}
      </div>
    </motion.div>
  );
};

const DifficultyAnalysis = ({ data }) => {
  const chartData = Object.keys(data).map((difficulty) => ({
    difficulty,
    count: data[difficulty].count,
    avg_score: data[difficulty].avg_score,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className={chartCardClasses}
    >
      <h4 className="text-md font-semibold text-white/90 mb-4">
        Difficulty Analysis
      </h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
          <XAxis
            dataKey="difficulty"
            stroke="rgba(255,255,255,0.5)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="left"
            stroke="rgba(255,255,255,0.5)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="rgba(255,255,255,0.5)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 10]}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.1)" }}
          />
          <Bar
            yAxisId="left"
            dataKey="count"
            name="Questions"
            fill="#60A5FA"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="right"
            dataKey="avg_score"
            name="Avg Score"
            fill="#FBBF24"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// --- Metric Cards ---

const MetricCard = ({
  icon: Icon,
  title,
  value,
  unit,
  description,
  color = "text-blue-400",
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className={`${chartCardClasses} flex flex-col justify-between items-start gap-2 text-white/80 p-5`}
  >
    <div className="flex items-center">
      <Icon className={`w-6 h-6 mr-3 ${color}`} />
      <h5 className="font-semibold text-white/90">{title}</h5>
    </div>
    {unit === "secs" ? (
      <p className="text-3xl font-bold mt-2">
        {/* Render minutes if they exist */}
        {Math.floor(value / 60) > 0 && (
          <>
            {Math.floor(value / 60)}{" "}
            <span className="text-lg font-normal text-white/50">min </span>
          </>
        )}
        {/* Render the remaining seconds */}
        {value % 60}{" "}
        <span className="text-lg font-normal text-white/50">secs</span>
      </p>
    ) : (
      <p className="text-3xl font-bold mt-2">
        {value}{" "}
        <span className="text-lg font-normal text-white/50">{unit}</span>
      </p>
    )}
    {description && <p className="text-xs text-white/60">{description}</p>}
  </motion.div>
);

const TimeSpentAnalysisCard = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <MetricCard
      icon={Clock}
      title="Total Time"
      value={data.total_time_minutes}
      unit="mins"
      description="Overall duration of your test attempt."
    />
    <MetricCard
      icon={Hourglass}
      title="Avg Time/Q"
      value={data.avg_time_per_question_seconds}
      unit="secs"
      description="Average time spent on each question."
    />
    <MetricCard
      icon={Zap}
      title="Rushed Q's"
      value={data.questions_rushed.length}
      unit="questions"
      description={`Q${data.questions_rushed.join(", Q")}`}
      color="text-yellow-400"
    />
  </div>
);

const AnswerQualityMetricsCard = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <MetricCard
      icon={Brain}
      title="Avg Length"
      value={data.avg_length_words}
      unit="words"
      description="Average length of your open answers."
    />
    <MetricCard
      icon={Check}
      title="Completeness"
      value={data.completeness_score}
      unit="/10"
      description="How thoroughly you addressed question points."
      color="text-green-400"
    />
    <MetricCard
      icon={Trophy}
      title="Clarity"
      value={data.clarity_score}
      unit="/10"
      description="How clear and concise your answers were."
      color="text-purple-400"
    />
    <MetricCard
      icon={Trophy}
      title="Accuracy"
      value={data.technical_accuracy}
      unit="/10"
      description="Technical correctness of your answers."
      color="text-red-400"
    />
  </div>
);

const ComparisonMetricsCard = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <MetricCard
      icon={TrendingUp}
      title="Percentile"
      value={data.percentile}
      unit="%"
      description="Compared to other test takers."
      color="text-green-400"
    />
    <MetricCard
      icon={TrendingUp}
      title="Above Avg By"
      value={data.better_than_average_by.toFixed(1)}
      unit="score"
      description="Your score difference from average."
      color="text-green-400"
    />
  </div>
);

const AnalyticsCharts = ({ analytics }) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Chart Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopicPerformanceChart data={analytics.performance_by_topic} />
        <SkillRadarChart data={analytics.skill_radar} />
      </div>

      {/* Chart Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PerformanceByTypeChart data={analytics.performance_by_type} />
        <DifficultyAnalysis data={analytics.difficulty_analysis} />
      </div>

      {/* Progress Over Questions Chart (Full width) */}
      <ProgressChart data={analytics.progress_over_questions} />

      {/* Metric Cards Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-4 space-y-6"
      >
        <h3 className="text-xl font-semibold text-white/90">
          Additional Metrics
        </h3>
        <TimeSpentAnalysisCard data={analytics.time_spent_analysis} />
        {analytics.answer_quality_metrics && (
          <AnswerQualityMetricsCard data={analytics.answer_quality_metrics} />
        )}
        {analytics.comparison_metrics && (
          <ComparisonMetricsCard data={analytics.comparison_metrics} />
        )}
      </motion.div>
    </div>
  );
};

export default AnalyticsCharts;
