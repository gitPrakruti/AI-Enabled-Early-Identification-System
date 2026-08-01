import { useLocation, useNavigate } from 'react-router-dom'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line,
  ResponsiveContainer
} from 'recharts'
import ChatbotWidget from '../components/chatbot/ChatbotWidget'

const recommendations = {
  'Fast Learner': [
    'Keep up the great work and help peers who struggle',
    'Challenge yourself with advanced topics',
    'Participate in competitions and hackathons',
    'Mentor slower learners in your class',
  ],
  'Average Learner': [
    'Increase daily study hours gradually to 3-4 hours',
    'Attend at least 85% of classes consistently',
    'Use active recall and practice tests weekly',
    'Join a peer study group for difficult subjects',
  ],
  'Slow Learner': [
    'Focus on understanding basics before moving forward',
    'Speak to your professor during office hours',
    'Break study sessions into 25-min focused chunks',
    'Use YouTube tutorials for visual learning',
  ],
  'Very Slow Learner': [
    'Seek immediate help from your academic counselor',
    'Attend all extra classes and remedial sessions',
    'Study with a partner or tutor daily',
    'Focus on one subject at a time, do not multitask',
  ],
}

function Result() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const form = state?.form || {
    attendance: parseFloat(localStorage.getItem('paceiq_latest_attendance') || '75'),
    prevGrade: parseFloat(localStorage.getItem('paceiq_latest_prev_grade') || '70'),
    studyHours: parseFloat(localStorage.getItem('paceiq_latest_study_hours') || '2'),
    gender: localStorage.getItem('paceiq_latest_gender') || 'female',
    parentalSupport: localStorage.getItem('paceiq_latest_parental_support') || 'medium',
    onlineClasses: localStorage.getItem('paceiq_latest_online_classes') || 'no'
  }
  const category = state?.category || localStorage.getItem('paceiq_latest_category') || 'Average Learner'
  const badgeColor = state?.badgeColor || (
    category === 'Fast Learner' ? '#00C853' :
    category === 'Average Learner' ? '#FFA000' :
    category === 'Slow Learner' ? '#FF6D00' : '#E53935'
  )
  const riskScore = state?.riskScore !== undefined ? state.riskScore : parseInt(localStorage.getItem('paceiq_latest_risk') || '42')
  const confidenceScore = state?.confidenceScore !== undefined ? state.confidenceScore : parseInt(localStorage.getItem('paceiq_latest_confidence') || '87')

  const radarData = [
    { subject: 'Attendance', value: parseFloat(form.attendance || 0) },
    { subject: 'Prev Grade', value: parseFloat(form.prevGrade || 0) * 10 },
    { subject: 'Study hrs', value: Math.min(parseFloat(form.studyHours || 0) * 10, 100) },
  ]

  const barData = [
    { name: 'Attendance', score: parseFloat(form.attendance || 0) },
    { name: 'Prev Grade', score: parseFloat(form.prevGrade || 0) * 10 },
    { name: 'Study hrs', score: Math.min(parseFloat(form.studyHours || 0) * 10, 100) },
  ]

  const tips = recommendations[category] || recommendations['Average Learner']
  const isDark = localStorage.getItem('paceiq_theme') === 'dark'

  const savedHistory = JSON.parse(localStorage.getItem('paceiq_assessment_history') || '[]')
  const trendData = savedHistory.map((item, index) => ({
    name: item.date ? item.date.split(',')[0] : `Attempt ${index + 1}`,
    risk: item.risk,
    category: item.category
  }))

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Fast Learner': return '#059669'
      case 'Average Learner': return '#D97706'
      case 'Slow Learner':
      case 'Very Slow Learner':
      default:
        return '#DC2626'
    }
  }
  const displayColor = getCategoryColor(category)

  return (
    <div className="min-h-screen bg-[#F5F3FF] dark:bg-[#0B0F19] pb-10 animate-fade-in transition-colors duration-200">

      {/* Header */}
      <div className="bg-white dark:bg-[#161B26] border-b border-[#EDE9FE] dark:border-[#1F2937] px-6 py-4 flex items-center gap-3 transition-colors duration-200">
        <button
          onClick={() => navigate('/home')}
          className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#7C3AED] dark:hover:text-[#C084FC] text-xl font-bold hover:scale-110 active:scale-90 transition-all duration-200"
          aria-label="Go back to home"
        >
          ←
        </button>
        <h2 className="font-bold text-[#1E1B4B] dark:text-[#F3F4F6]">Your Result</h2>
      </div>

      <div className="px-6 max-w-lg mx-auto mt-6 space-y-5">

        {/* Category Badge */}
        <div
          className="rounded-full py-3 px-6 text-center font-extrabold text-white text-lg shadow-sm tracking-wide"
          style={{ backgroundColor: displayColor }}
        >
          {category}
        </div>

        {/* Metric Cards - Glassmorphism */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/70 dark:bg-[#161B26]/75 backdrop-blur-md rounded-2xl p-4 border border-white/40 dark:border-[#1F2937] text-center shadow-sm hover:shadow-md transition-shadow duration-200">
            <p className="text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">Risk score</p>
            <p className="text-3xl font-extrabold text-[#1E1B4B] dark:text-[#F3F4F6] mt-1">{riskScore}</p>
          </div>
          <div className="bg-white/70 dark:bg-[#161B26]/75 backdrop-blur-md rounded-2xl p-4 border border-white/40 dark:border-[#1F2937] text-center shadow-sm hover:shadow-md transition-shadow duration-200">
            <p className="text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">Model confidence</p>
            <p className="text-3xl font-extrabold text-[#1E1B4B] dark:text-[#F3F4F6] mt-1">{confidenceScore}%</p>
          </div>
        </div>

        {/* Radar Chart Card */}
        <div className="bg-white dark:bg-[#161B26] rounded-2xl p-5 border border-[#EDE9FE] dark:border-[#1F2937] shadow-sm hover:shadow-md transition-shadow duration-200">
          <h4 className="text-sm font-bold text-[#1E1B4B] dark:text-[#F3F4F6] mb-3 uppercase tracking-wider text-left">Performance Radar</h4>
          <ResponsiveContainer width="99%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={isDark ? '#374151' : '#E5E7EB'} />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: isDark ? '#9CA3AF' : '#1E1B4B' }} />
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
        <div className="bg-white dark:bg-[#161B26] rounded-2xl p-5 border border-[#EDE9FE] dark:border-[#1F2937] shadow-sm hover:shadow-md transition-shadow duration-200">
          <h4 className="text-sm font-bold text-[#1E1B4B] dark:text-[#F3F4F6] mb-3 uppercase tracking-wider text-left">Score Breakdown</h4>
          <ResponsiveContainer width="99%" height={180}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: isDark ? '#9CA3AF' : '#1E1B4B' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: isDark ? '#9CA3AF' : '#1E1B4B' }} />
              <Tooltip contentStyle={isDark ? { backgroundColor: '#1F2937', borderColor: '#374151', color: '#FFF' } : undefined} />
              <Bar dataKey="score" fill="#2979FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Trend History Chart Card */}
        {trendData.length > 0 && (
          <div className="bg-white dark:bg-[#161B26] rounded-2xl p-5 border border-[#EDE9FE] dark:border-[#1F2937] shadow-sm hover:shadow-md transition-shadow duration-200">
            <h4 className="text-sm font-bold text-[#1E1B4B] dark:text-[#F3F4F6] mb-3 uppercase tracking-wider text-left">Academic Risk Trend</h4>
            <ResponsiveContainer width="99%" height={180}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#E5E7EB'} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: isDark ? '#9CA3AF' : '#1E1B4B' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: isDark ? '#9CA3AF' : '#1E1B4B' }} />
                <Tooltip contentStyle={isDark ? { backgroundColor: '#1F2937', borderColor: '#374151', color: '#FFF' } : undefined} />
                <Line type="monotone" dataKey="risk" stroke="#EF4444" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-[9px] font-semibold text-[#6B7280] dark:text-[#9CA3AF] mt-2 text-center">
              Lower Risk indicates better academic performance. Track your progress across attempts.
            </p>
          </div>
        )}

        {/* Recommendations - separate cards with purple left border */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#7C3AED] dark:text-[#C084FC] uppercase tracking-wider px-1">Recommendations</h4>
          {tips.map((tip, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#161B26] rounded-xl p-4 border-l-4 border-l-[#7C3AED] dark:border-l-[#C084FC] border-y border-r border-[#EDE9FE] dark:border-[#1F2937] shadow-sm flex items-start gap-3 hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="text-[#059669] font-bold text-sm bg-[#EDE9FE] dark:bg-[#064E3B]/20 w-6 h-6 rounded-full flex items-center justify-center shrink-0">✓</span>
              <span className="text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/assessment')}
          className="w-full border-2 border-[#7C3AED] dark:border-[#C084FC] text-[#7C3AED] dark:text-[#C084FC] font-bold py-3.5 rounded-2xl text-sm bg-transparent hover:bg-[#EDE9FE] dark:hover:bg-[#1E1B4B]/30 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm"
        >
          Retake Assessment
        </button>
        <ChatbotWidget />
      </div>
    </div>
  )
}

export default Result