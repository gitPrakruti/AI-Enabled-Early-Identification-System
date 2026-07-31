import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatbotWidget from '../components/chatbot/ChatbotWidget'


const VOCABULARY_WORDS = [
  { word: 'Serendipity', type: 'n.', definition: 'The occurrence of events by chance in a happy or beneficial way.' },
  { word: 'Erudite', type: 'adj.', definition: 'Having or showing great knowledge or learning.' },
  { word: 'Meticulous', type: 'adj.', definition: 'Showing great attention to detail; very careful and precise.' },
  { word: 'Resilient', type: 'adj.', definition: 'Able to withstand or recover quickly from difficult conditions.' },
  { word: 'Tenacity', type: 'n.', definition: 'The quality or fact of being able to grip something firmly; determination.' },
  { word: 'Cognitive', type: 'adj.', definition: 'Relating to the mental action or process of acquiring knowledge and understanding.' },
  { word: 'Sagacity', type: 'n.', definition: 'The quality of being sagacious; keen mental discernment and soundness of judgment.' },
  { word: 'Perspicacity', type: 'n.', definition: 'The quality of having a ready penetration into things; sharpness of sight or understanding.' },
  { word: 'Equanimity', type: 'n.', definition: 'Mental calmness, composure, and evenness of temper, especially in a difficult situation.' },
  { word: 'Ebullient', type: 'adj.', definition: 'Cheerful and full of energy; exuberant.' },
  { word: 'Luminous', type: 'adj.', definition: 'Full of or shedding light; bright or shining, especially in the dark.' },
  { word: 'Ephemeral', type: 'adj.', definition: 'Lasting for a very short time; transient.' }
]

const handlePronounce = (word) => {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.rate = 0.95
      window.speechSynthesis.speak(utterance)
    }
  } catch (err) {
    console.error(err)
  }
}

function Home() {
  const navigate = useNavigate()
  const [chatOpen, setChatOpen] = useState(false)
  const [streak, setStreak] = useState(0)
  const [studyTime, setStudyTime] = useState('0h')
  const [completedCount, setCompletedCount] = useState(0)
  const [dailyProgress, setDailyProgress] = useState(0)

  // Calculate dynamic Word of the Day based on the calendar date
  const getWordOfTheDay = () => {
    try {
      const day = new Date().getDate()
      const index = day % VOCABULARY_WORDS.length
      return VOCABULARY_WORDS[index]
    } catch (e) {
      return VOCABULARY_WORDS[0]
    }
  }
  const wordOfTheDay = getWordOfTheDay()

  // Profile sidebar states
  const [userName, setUserName] = useState('Student User')
  const [userEmail, setUserEmail] = useState('student@paceiq.edu')
  const [roll, setRoll] = useState("")
  const [dept, setDept] = useState("")
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(
  localStorage.getItem("paceiq_theme") || "light"
)
useEffect(() => {
  const savedTheme = localStorage.getItem("paceiq_theme") || "light";

  setTheme(savedTheme);

  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}, []);

  // Profile editing fields state
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editRoll, setEditRoll] = useState('')
  const [editDept, setEditDept] = useState('')


  useEffect(() => {
    try {
      // 1. Load streak and verify check-in window
      const savedStreak = parseInt(localStorage.getItem('paceiq_streak') || '0')
      const lastCheck = localStorage.getItem('paceiq_last_check')
      if (savedStreak > 0 && lastCheck) {
        const lastDate = new Date(lastCheck)
        const diffDays = Math.ceil(Math.abs(new Date() - lastDate) / (1000 * 60 * 60 * 24))
        if (diffDays > 1) {
          // Streak broken
          localStorage.setItem('paceiq_streak', '0')
          setStreak(0)
        } else {
          setStreak(savedStreak)
        }
      } else {
        setStreak(savedStreak)
      }

      // 2. Load total study hours
      const savedHours = parseFloat(localStorage.getItem('paceiq_total_study_hours') || '0')
      setStudyTime(savedHours > 0 ? `${savedHours.toFixed(1)}h` : '0h')

      // 3. Load completed count
      const assessmentsCount = parseInt(localStorage.getItem('paceiq_assessments_count') || '0')
      const checklistsCount = parseInt(localStorage.getItem('paceiq_checklists_count') || '0')
      const totalCompleted = assessmentsCount + checklistsCount
      setCompletedCount(totalCompleted)

      // 4. Calculate progress percentage (say, daily goal is 2 completed tasks today)
      const progressPercent = Math.min(Math.round((totalCompleted / 2) * 100), 100)
      setDailyProgress(progressPercent)

      // 5. Load student profile data
      const savedName = localStorage.getItem('paceiq_user_name')
      if (savedName) setUserName(savedName)

      const savedEmail = localStorage.getItem('paceiq_user_email')
      if (savedEmail) setUserEmail(savedEmail)

      const savedRoll = localStorage.getItem('paceiq_user_roll')
      if (savedRoll) setRoll(savedRoll)

      const savedDept = localStorage.getItem('paceiq_user_dept')
      if (savedDept) setDept(savedDept)
    } catch (err) {
      console.error(err)
    }
  }, [])

  const handleStartEdit = () => {
    setEditName(userName)
    setEditEmail(userEmail)
    setEditRoll(roll)
    setEditDept(dept)
    setIsEditing(true)
  }

  const handleSaveChanges = () => {
  
    try {
      localStorage.setItem('paceiq_user_name', editName)
      localStorage.setItem('paceiq_user_email', editEmail)
      localStorage.setItem('paceiq_user_roll', editRoll)
      localStorage.setItem('paceiq_user_dept', editDept)

      setUserName(editName)
      setUserEmail(editEmail)
      setRoll(editRoll)
      setDept(editDept)
      setIsEditing(false)
    } catch (err) {
      console.error(err)
    }
  }
  
  const toggleTheme = () => {
  const newTheme = theme === "dark" ? "light" : "dark";

  setTheme(newTheme);
  localStorage.setItem("paceiq_theme", newTheme);

  if (newTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  window.dispatchEvent(new Event("themeChanged"));
};

  return (
    <div className="min-h-screen bg-[#F5F3FF] dark:bg-[#0B0F19] pb-10 animate-fade-in transition-colors duration-200">

      {/* Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => {
            setSidebarOpen(false)
            setIsEditing(false)
          }}
          className="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-40 animate-fade-in"
        />
      )}

      {/* Sidebar Drawer */}
{isSidebarOpen && (
  <div className="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-[#161B26] shadow-2xl z-50 p-6 flex flex-col justify-between border-r border-[#EDE9FE] dark:border-[#1F2937] overflow-y-auto transition-colors duration-200">

    {/* TOP CONTENT */}
    <div>

      {/* Drawer Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#EDE9FE] dark:border-[#1F2937]">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="PaceIQ Logo"
            className="w-6 h-6 object-contain"
          />
          <span className="font-extrabold text-[#1E1B4B] dark:text-white">
            {isEditing ? "Edit Profile" : "PaceIQ Profile"}
          </span>
        </div>

        <button
          onClick={() => {
            setSidebarOpen(false)
            setIsEditing(false)
          }}
          className="w-7 h-7 rounded-full bg-[#F5F3FF] dark:bg-[#1F2937] flex items-center justify-center"
        >
          ✕
        </button>
      </div>

      {/* Profile Card */}

      {!isEditing ? (

        <div className="text-center mb-6">

          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#9F67FF] text-white flex items-center justify-center mx-auto text-2xl font-bold mb-3">

            {userName.charAt(0).toUpperCase()}

          </div>

          <h2 className="font-bold text-lg dark:text-white">
            {userName}
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {userEmail}
          </p>

        </div>

      ) : (

        <div className="space-y-3 mb-6">

          <input
            value={editName}
            onChange={(e)=>setEditName(e.target.value)}
            placeholder="Full Name"
            className="w-full p-2 rounded-lg border dark:bg-[#1F2937]"
          />

          <input
            value={editEmail}
            onChange={(e)=>setEditEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 rounded-lg border dark:bg-[#1F2937]"
          />

        </div>

      )}

      {/* Student Details */}

      <div className="space-y-3">

        <h3 className="text-xs font-bold uppercase text-[#7C3AED]">
          Student Details
        </h3>

        {!isEditing ? (

          <div className="bg-[#F9FAFB] dark:bg-[#1F2937] rounded-xl p-4 space-y-2">

            <div className="flex justify-between">
              <span>Roll</span>
              <span>{roll}</span>
            </div>

            <div className="flex justify-between">
              <span>Department</span>
              <span>{dept}</span>
            </div>

          </div>

        ) : (

          <div className="space-y-3">

            <input
              value={editRoll}
              onChange={(e)=>setEditRoll(e.target.value)}
              placeholder="Roll Number"
              className="w-full p-2 rounded-lg border dark:bg-[#1F2937]"
            />

            <input
              value={editDept}
              onChange={(e)=>setEditDept(e.target.value)}
              placeholder="Department"
              className="w-full p-2 rounded-lg border dark:bg-[#1F2937]"
            />

          </div>

        )}

      </div>

      {/* Appearance */}

      <div className="mt-6 border-t pt-4">

        <h3 className="text-xs font-bold uppercase text-[#7C3AED] mb-3">
          Appearance
        </h3>

        <button
          onClick={toggleTheme}
          className="w-full flex justify-between items-center px-4 py-3 rounded-xl border bg-[#F9FAFB] dark:bg-[#1F2937]"
        >
          <span>
            {theme==="dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </span>

          <span>
            {theme==="dark" ? "ON" : "OFF"}
          </span>

        </button>

      </div>

    </div>

              {/* Drawer Footer Actions */}

    <div className="space-y-3 pt-5 border-t border-[#EDE9FE] dark:border-[#1F2937] mt-6">

      {!isEditing ? (

        <>
          <button
            onClick={handleStartEdit}
            className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold py-2.5 rounded-xl transition"
          >
            ✏️ Edit Profile
          </button>

          <button
            onClick={() => {
              setSidebarOpen(false)
              navigate("/assessment")
            }}
            className="w-full bg-[#F5F3FF] dark:bg-[#1F2937] text-[#7C3AED] dark:text-[#C084FC] border border-[#EDE9FE] dark:border-[#374151] font-bold py-2.5 rounded-xl"
          >
            📝 Take Assessment
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("token")
              navigate("/login")
            }}
            className="w-full bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800 font-bold py-2.5 rounded-xl"
          >
            🚪 Logout
          </button>
        </>

      ) : (

        <div className="flex gap-2">

          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 bg-gray-200 dark:bg-[#1F2937] py-2.5 rounded-xl font-bold"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveChanges}
            className="flex-1 bg-[#7C3AED] text-white py-2.5 rounded-xl font-bold"
          >
            Save
          </button>

        </div>

      )}

    </div>

  </div>
)}

      {/* Header */}
      <div className="bg-white dark:bg-[#161B26] border-b border-[#EDE9FE] dark:border-[#1F2937] px-6 py-4 flex items-center justify-between shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 rounded-full bg-[#EDE9FE]/75 dark:bg-[#1F2937] text-[#7C3AED] dark:text-[#C084FC] flex items-center justify-center font-extrabold hover:scale-105 active:scale-95 transition-all shadow-sm border border-[#EDE9FE] dark:border-[#374151] shrink-0 select-none"
            aria-label="Open profile sidebar"
            title="View Student Profile"
          >
            {userName ? userName.charAt(0).toUpperCase() : 'S'}
          </button>
          <img src="/logo.png" alt="PaceIQ Logo" className="w-8 h-8 rounded-lg shadow-sm" />
          <span className="font-extrabold text-[#1E1B4B] dark:text-[#F3F4F6] text-lg tracking-tight">PaceIQ</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-[#EDE9FE] dark:bg-[#201B4B] px-3 py-1 rounded-full text-xs font-bold text-[#7C3AED] dark:text-[#C084FC] shadow-sm select-none border border-[#EDE9FE]/55 dark:border-[#3B0764]">
            <span>🔥</span>
            <span>{streak > 0 ? `${streak} Day Streak` : 'No Streak'}</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-lg mx-auto space-y-6">

        {/* Hero Banner Card */}
        <div className="bg-[#EDE9FE]/55 dark:bg-[#201B4B]/20 rounded-3xl p-6 relative overflow-hidden flex items-center justify-between border border-[#EDE9FE] dark:border-[#1F2937] shadow-sm transition-colors duration-200">
          <div className="flex items-center gap-5 z-10 max-w-[70%]">
            {/* Circular Progress Ring */}
            <div className="relative w-20 h-20 shrink-0 bg-white dark:bg-[#161B26] rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#F5F3FF" strokeWidth="6" fill="transparent" className="stroke-[#F5F3FF] dark:stroke-[#1F2937]" />
                <circle cx="32" cy="32" r="28" stroke="#7C3AED" strokeWidth="6" fill="transparent"
                  strokeDasharray="175" strokeDashoffset={175 - (175 * dailyProgress / 100)} strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-sm font-extrabold text-[#1E1B4B] dark:text-[#F3F4F6]">{dailyProgress}%</span>
                <span className="text-[7px] font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">Goal</span>
              </div>
            </div>
            {/* Greeting & Subtext */}
            <div>
              <h2 className="text-lg font-extrabold text-[#1E1B4B] dark:text-[#E9D5FF] leading-tight">Keep it up!</h2>
              <p className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mt-1 leading-relaxed">
                {dailyProgress >= 100
                  ? "Daily goal reached! You're doing amazing today."
                  : "Complete tasks from your today's plan to boost your goal progress!"}
              </p>
            </div>
          </div>
          {/* Illustration on the right */}
          <div className="absolute right-0 bottom-0 top-0 w-[30%] flex items-end justify-end pointer-events-none">
            <img src="/student_illustration.png" alt="Student studying" className="h-[92%] object-contain object-bottom" />
          </div>
        </div>

        {/* Today's Plan Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-extrabold text-[#1E1B4B] dark:text-[#F3F4F6]">Today's Plan</h3>
            <button
              onClick={() => navigate('/assessment')}
              className="text-xs font-bold text-[#7C3AED] dark:text-[#C084FC] hover:underline flex items-center gap-0.5"
            >
              View all ➔
            </button>
          </div>

          <div className="space-y-3">
            {/* Assessment Quiz (Green theme) */}
            <div
              onClick={() => navigate('/assessment')}
              className="bg-white dark:bg-[#161B26] rounded-2xl p-4 border border-[#EDE9FE] dark:border-[#1F2937] cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E6F4EA] dark:bg-[#064E3B]/30 rounded-xl flex items-center justify-center text-2xl group-hover:scale-105 transition-transform duration-200 shrink-0">
                  📝
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#059669] dark:text-[#34D399]">Assessment Quiz</p>
                  <p className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">Check learning pace & challenges</p>
                  <div className="flex items-center gap-2 text-[10px] text-[#6B7280] dark:text-[#9CA3AF] mt-1.5 font-bold">
                    <span>📋 6 Questions + Checklist</span>
                    <span>•</span>
                    <span>⏱️ 4 min</span>
                  </div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#E6F4EA] dark:bg-[#064E3B]/30 flex items-center justify-center text-[#059669] dark:text-[#34D399] font-bold group-hover:translate-x-1 transition-all duration-200">
                ➔
              </div>
            </div>

            {/* Performance Report (Orange theme) */}
            <div
              onClick={() => navigate('/result')}
              className="bg-white dark:bg-[#161B26] rounded-2xl p-4 border border-[#EDE9FE] dark:border-[#1F2937] cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FFFAF0] dark:bg-[#78350F]/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-105 transition-transform duration-200 shrink-0">
                  📈
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#D97706] dark:text-[#FBBF24]">Performance Report</p>
                  <p className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">See your detailed AI evaluation</p>
                  <div className="flex items-center gap-2 text-[10px] text-[#6B7280] dark:text-[#9CA3AF] mt-1.5 font-bold">
                    <span>📊 Radar & Bar Charts</span>
                  </div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#FFFAF0] dark:bg-[#78350F]/20 flex items-center justify-center text-[#D97706] dark:text-[#FBBF24] font-bold group-hover:translate-x-1 transition-all duration-200">
                ➔
              </div>
            </div>

          {/* Assessment History (Blue Theme) */}

<div
  onClick={() => navigate("/history")}
  className="bg-white dark:bg-[#161B26] rounded-2xl p-4 border border-[#EDE9FE] dark:border-[#1F2937] cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group"
>

  <div className="flex items-center gap-4">

    <div className="w-12 h-12 bg-[#EFF6FF] dark:bg-[#1E3A8A]/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-105 transition-transform duration-200 shrink-0">

      📜

    </div>

    <div>

      <p className="text-sm font-extrabold text-[#2563EB] dark:text-[#60A5FA]">

        Assessment History

      </p>

      <p className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">

        View all previous assessments

      </p>

      <div className="flex items-center gap-2 text-[10px] text-[#6B7280] dark:text-[#9CA3AF] mt-1.5 font-bold">

        <span>🕒 Complete Assessment Timeline</span>

      </div>

    </div>

  </div>

  <div className="w-8 h-8 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A8A]/20 flex items-center justify-center text-[#2563EB] dark:text-[#60A5FA] font-bold group-hover:translate-x-1 transition-all duration-200">

    ➔

  </div>

</div>
            {/* Chat Assistant (Purple theme) */}
            <div
              onClick={() => setChatOpen(true)}
              className="bg-white dark:bg-[#161B26] rounded-2xl p-4 border border-[#EDE9FE] dark:border-[#1F2937] cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#EDE9FE] dark:bg-[#4C1D95]/30 rounded-xl flex items-center justify-center text-2xl group-hover:scale-105 transition-transform duration-200 shrink-0">
                  💬
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#7C3AED] dark:text-[#C084FC]">AI Chat Assistant</p>
                  <p className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">Chat with your learning advisor</p>
                  <div className="flex items-center gap-2 text-[10px] text-[#6B7280] dark:text-[#9CA3AF] mt-1.5 font-bold">
                    <span>🤖 Realtime AI</span>
                  </div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#EDE9FE] dark:bg-[#4C1D95]/30 flex items-center justify-center text-[#7C3AED] dark:text-[#C084FC] font-bold group-hover:translate-x-1 transition-all duration-200">
                ➔
              </div>
            </div>
          </div>
        </div>

        {/* Word of the Day Section */}
        <div>
          <h3 className="text-base font-extrabold text-[#1E1B4B] dark:text-[#F3F4F6] mb-3">Word of the Day</h3>
          <div className="bg-[#EDE9FE]/30 dark:bg-[#201B4B]/20 rounded-3xl p-5 border border-[#EDE9FE] dark:border-[#1F2937] flex items-center justify-between shadow-sm transition-colors duration-200">
            <div className="max-w-[70%]">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-extrabold text-[#7C3AED] dark:text-[#C084FC]">{wordOfTheDay.word}</h4>
                <button
                  type="button"
                  onClick={() => handlePronounce(wordOfTheDay.word)}
                  className="text-sm cursor-pointer hover:scale-110 active:scale-95 transition-transform select-none"
                  title="Listen pronunciation"
                >
                  🔊
                </button>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1.5 leading-relaxed font-semibold">
                ({wordOfTheDay.type}) {wordOfTheDay.definition}
              </p>
            </div>
            <div className="text-4xl shrink-0 select-none animate-bounce">
              📖
            </div>
          </div>
        </div>

        {/* Your Progress Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-extrabold text-[#1E1B4B] dark:text-[#F3F4F6]">Your Progress</h3>
            <span className="text-xs font-bold text-[#7C3AED] dark:text-[#C084FC] cursor-pointer hover:underline">This Week</span>
          </div>
          <div className="bg-white dark:bg-[#161B26] rounded-3xl p-5 border border-[#EDE9FE] dark:border-[#1F2937] shadow-sm grid grid-cols-2 gap-4 divide-x divide-[#EDE9FE] dark:divide-[#1F2937] transition-colors duration-200">
            {/* Study Time */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E6F4EA] dark:bg-[#064E3B]/20 flex items-center justify-center text-lg shadow-sm">
                🎯
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">Study Time</p>
                <p className="text-base font-extrabold text-[#1E1B4B] dark:text-[#F3F4F6] mt-0.5">{studyTime}</p>
              </div>
            </div>
            {/* Lessons Completed */}
            <div className="flex items-center gap-3 pl-4">
              <div className="w-10 h-10 rounded-full bg-[#FFFAF0] dark:bg-[#78350F]/20 flex items-center justify-center text-lg shadow-sm">
                📊
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">Completed</p>
                <p className="text-base font-extrabold text-[#1E1B4B] dark:text-[#F3F4F6] mt-0.5">{completedCount} <span className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">/ 10</span></p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <ChatbotWidget isOpen={chatOpen} setIsOpen={setChatOpen} />

    </div>
  )
}

export default Home