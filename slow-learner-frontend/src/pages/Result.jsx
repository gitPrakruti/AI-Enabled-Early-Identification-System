import { useLocation, useNavigate } from 'react-router-dom'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import ChatbotWidget from '../components/chatbot/ChatbotWidget'


function Result() {
  const navigate = useNavigate()
const { state } = useLocation()

const storedPrediction = JSON.parse(
  localStorage.getItem("latest_prediction") || "{}"
)

const data = state || storedPrediction

const form = data.form || {}

const prediction = data.prediction || "Unknown"

const confidence = Number(data.confidence || 0)

const riskScore = Number(
  data.riskScore ?? data.risk_score ?? 0
)

const backendRecommendations =
  data.recommendations || []

const badgeColor = data.badgeColor || "#DC2626"

  const radarData = [
    { subject: 'Attendance', value: form.attendance },
    { subject: 'Prev Grade', value: parseFloat(form.prevGrade || 0) },
    { subject: 'Study hrs', value: Math.min(parseFloat(form.studyHours || 0) * 10, 100) },
  ]

  const barData = [
    { name: 'Attendance', score: form.attendance },
    { name: 'Prev Grade', score: parseFloat(form.prevGrade || 0) },
    { name: 'Study hrs', score: Math.min(parseFloat(form.studyHours || 0) * 10, 100) },
  ]

  const tips = backendRecommendations

  const displayColor = badgeColor

  return (
    <div className="min-h-screen bg-[#F5F3FF] pb-10 animate-fade-in">

      {/* Header */}
      <div className="bg-white border-b border-[#EDE9FE] px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/home')}
          className="text-[#6B7280] hover:text-[#7C3AED] text-xl font-bold hover:scale-110 active:scale-90 transition-all duration-200"
          aria-label="Go back to home"
        >
          ←
        </button>
        <h2 className="font-bold text-[#1E1B4B]">Your Result</h2>
      </div>

      <div className="px-6 max-w-lg mx-auto mt-6 space-y-5">

        {/* Category Badge */}
        <div
          className="rounded-full py-3 px-6 text-center font-extrabold text-white text-lg shadow-sm tracking-wide"
          style={{ backgroundColor: displayColor }}
        >
          {prediction}
        </div>

        {/* Metric Cards - Glassmorphism */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/40 text-center shadow-sm hover:shadow-md transition-shadow duration-200">
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Risk score</p>
            <p className="text-3xl font-extrabold text-[#1E1B4B] mt-1">{riskScore.toFixed(2)}</p>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/40 text-center shadow-sm hover:shadow-md transition-shadow duration-200">
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Model confidence</p>
            <p className="text-3xl font-extrabold text-[#1E1B4B] mt-1">{confidence.toFixed(2)}%</p>
          </div>
        </div>

        {/* Radar Chart Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDE9FE] shadow-sm hover:shadow-md transition-shadow duration-200">
          <h4 className="text-sm font-bold text-[#1E1B4B] mb-3 uppercase tracking-wider text-left">Performance Radar</h4>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#2979FF"
                fill="#2979FF"
                fillOpacity={0.25}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDE9FE] shadow-sm hover:shadow-md transition-shadow duration-200">
          <h4 className="text-sm font-bold text-[#1E1B4B] mb-3 uppercase tracking-wider text-left">Score Breakdown</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="score" fill="#2979FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recommendations - separate cards with purple left border */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider px-1">Recommendations</h4>
          {tips.map((tip, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 border-l-4 border-l-[#7C3AED] border-y border-r border-[#EDE9FE] shadow-sm flex items-start gap-3 hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="text-[#059669] font-bold text-sm bg-[#EDE9FE] w-6 h-6 rounded-full flex items-center justify-center shrink-0">✓</span>
              <span className="text-sm font-semibold text-[#6B7280] leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/assessment')}
          className="w-full border-2 border-[#7C3AED] text-[#7C3AED] font-bold py-3.5 rounded-2xl text-sm bg-transparent hover:bg-[#EDE9FE] hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm"
        >
          Retake Assessment
        </button>
        <ChatbotWidget />
      </div>
    </div>
  )
}

export default Result