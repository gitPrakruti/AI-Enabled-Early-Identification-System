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

const STUDY_QUOTES = [
  "The beautiful thing about learning is that no one can take it away from you. – B.B. King",
  "Live as if you were to die tomorrow. Learn as if you were to live forever. – Mahatma Gandhi",
  "Do the best you can until you know better. Then when you know better, do better. – Maya Angelou",
  "It always seems impossible until it's done. – Nelson Mandela",
  "Believe you can and you're halfway there. – Theodore Roosevelt",
  "Education is the most powerful weapon which you can use to change the world. – Nelson Mandela",
  "Start where you are. Use what you have. Do what you can. – Arthur Ashe",
  "The mind is not a vessel to be filled, but a fire to be kindled. – Plutarch",
  "Success is the sum of small efforts, repeated day in and day out. – Robert Collier",
  "There are no shortcuts to any place worth going. – Beverly Sills",
  "I find that the harder I work, the more luck I seem to have. – Thomas Jefferson",
  "You don't have to be great to start, but you have to start to be great. – Zig Ziglar",
  "Learning is not spectator sport. – D. Blocher",
  "The expert in anything was once a beginner. – Helen Hayes",
  "Mistakes are proof that you are trying. – Unknown",
  "Procrastination is the thief of time. – Edward Young",
  "Focus on the journey, not the destination. – Greg Anderson",
  "Your talent determines what you can do. Your motivation determines how much you are willing to do. – Lou Holtz",
  "Failure is the opportunity to begin again more intelligently. – Henry Ford",
  "The only place where success comes before work is in the dictionary. – Vidal Sassoon"
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
  const [completedCount, setCompletedCount] = useState(0)
  const [dailyProgress, setDailyProgress] = useState(0)

  // Profile sidebar states
  const [userName, setUserName] = useState('Student User')
  const [userEmail, setUserEmail] = useState('student@paceiq.edu')
  const [roll, setRoll] = useState('PIQ-26-8941')
  const [dept, setDept] = useState('Computer Science')
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  // Latest prediction banner details
  const [latestCategory, setLatestCategory] = useState(localStorage.getItem('paceiq_latest_category') || '')
  const [latestRisk, setLatestRisk] = useState(localStorage.getItem('paceiq_latest_risk') || '')

  // Word of the day and quote of the day randomized states
  const [wordOfTheDay, setWordOfTheDay] = useState(VOCABULARY_WORDS[0])
  const [quoteOfTheDay, setQuoteOfTheDay] = useState(STUDY_QUOTES[0])

  // Assessment history states
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [assessmentHistory, setAssessmentHistory] = useState([])
  const [undoToastVisible, setUndoToastVisible] = useState(false)
  const [lastDeletedLog, setLastDeletedLog] = useState(null)
  const [lastDeletedIndex, setLastDeletedIndex] = useState(-1)
  const [toastTimeoutId, setToastTimeoutId] = useState(null)

  // Profile editing fields state
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editRoll, setEditRoll] = useState('')
  const [editDept, setEditDept] = useState('')

  // Theme state (light / dark)
  const [theme, setTheme] = useState(localStorage.getItem('paceiq_theme') || 'light')

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('paceiq_theme', theme)
  }, [theme])

  useEffect(() => {
    try {
      // 1. Randomize Vocabulary Word and Quote of the Day on refresh
      const randomWord = VOCABULARY_WORDS[Math.floor(Math.random() * VOCABULARY_WORDS.length)]
      const randomQuote = STUDY_QUOTES[Math.floor(Math.random() * STUDY_QUOTES.length)]
      setWordOfTheDay(randomWord)
      setQuoteOfTheDay(randomQuote)



      // 4. Load completed count
      const assessmentsCount = parseInt(localStorage.getItem('paceiq_assessments_count') || '0')
      setCompletedCount(assessmentsCount)

      // 5. Load latest evaluation metrics
      const savedCategory = localStorage.getItem('paceiq_latest_category')
      if (savedCategory) setLatestCategory(savedCategory)
      const savedRisk = localStorage.getItem('paceiq_latest_risk')
      if (savedRisk) setLatestRisk(savedRisk)

      // 6. Load assessment history log
      const savedHistory = JSON.parse(localStorage.getItem('paceiq_assessment_history') || '[]')
      setAssessmentHistory(savedHistory)

      // 7. Calculate progress percentage (say, daily goal is 1 completed assessment today)
      const progressPercent = assessmentsCount > 0 ? 100 : 0
      setDailyProgress(progressPercent)

      // 8. Load student profile data
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

  const handleDeleteLog = (indexToDelete) => {
    const logToSave = assessmentHistory[indexToDelete]
    const updatedHistory = assessmentHistory.filter((_, idx) => idx !== indexToDelete)
    
    // Save reference for undo
    setLastDeletedLog(logToSave)
    setLastDeletedIndex(indexToDelete)
    
    // Update history list in state
    setAssessmentHistory(updatedHistory)
    localStorage.setItem('paceiq_assessment_history', JSON.stringify(updatedHistory))
    
    // Recalculate stats and homepage banner states
    if (updatedHistory.length === 0) {
      setLatestCategory('')
      setLatestRisk('')
      setCompletedCount(0)
      setDailyProgress(0)
    } else {
      setCompletedCount(updatedHistory.length)
      const latestAttempt = updatedHistory[updatedHistory.length - 1]
      setLatestCategory(latestAttempt.category)
      setLatestRisk(latestAttempt.risk.toString())
    }
    
    // If there was a previous timeout running, clear it
    if (toastTimeoutId) {
      clearTimeout(toastTimeoutId)
    }
    
    // Show Toast
    setUndoToastVisible(true)
    
    // Set 3 second auto-hide timer
    const timeoutId = setTimeout(() => {
      setUndoToastVisible(false)
      setLastDeletedLog(null)
      setLastDeletedIndex(-1)
      
      // Finalize in local storage when undo expires
      const finalHistory = JSON.parse(localStorage.getItem('paceiq_assessment_history') || '[]')
      if (finalHistory.length === 0) {
        localStorage.removeItem('paceiq_latest_category')
        localStorage.removeItem('paceiq_latest_risk')
        localStorage.removeItem('paceiq_latest_study_hours')
        localStorage.removeItem('paceiq_latest_confidence')
        localStorage.setItem('paceiq_assessments_count', '0')
      } else {
        localStorage.setItem('paceiq_assessments_count', finalHistory.length.toString())
        const latest = finalHistory[finalHistory.length - 1]
        localStorage.setItem('paceiq_latest_category', latest.category)
        localStorage.setItem('paceiq_latest_risk', latest.risk.toString())
      }
    }, 3000)
    setToastTimeoutId(timeoutId)
  }

  const handleUndoDelete = () => {
    if (lastDeletedLog === null || lastDeletedIndex === -1) return
    
    const restoredHistory = [...assessmentHistory]
    restoredHistory.splice(lastDeletedIndex, 0, lastDeletedLog)
    
    if (toastTimeoutId) {
      clearTimeout(toastTimeoutId)
      setToastTimeoutId(null)
    }
    setUndoToastVisible(false)
    setAssessmentHistory(restoredHistory)
    localStorage.setItem('paceiq_assessment_history', JSON.stringify(restoredHistory))
    
    // Restore stats and homepage banner states
    setCompletedCount(restoredHistory.length)
    localStorage.setItem('paceiq_assessments_count', restoredHistory.length.toString())
    
    const latestAttempt = restoredHistory[restoredHistory.length - 1]
    setLatestCategory(latestAttempt.category)
    setLatestRisk(latestAttempt.risk.toString())
    localStorage.setItem('paceiq_latest_category', latestAttempt.category)
    localStorage.setItem('paceiq_latest_risk', latestAttempt.risk.toString())
    
    setLastDeletedLog(null)
    setLastDeletedIndex(-1)
  }

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

  const totalAttempts = assessmentHistory.length
  let avgAttendance = 0
  let avgPrevGrade = 0
  if (totalAttempts > 0) {
    const validAttendanceList = assessmentHistory.filter(item => item.attendance !== undefined)
    const validPrevGradeList = assessmentHistory.filter(item => item.prevGrade !== undefined)
    
    if (validAttendanceList.length > 0) {
      const sumAttendance = validAttendanceList.reduce((sum, item) => sum + item.attendance, 0)
      avgAttendance = Math.round(sumAttendance / validAttendanceList.length)
    }
    if (validPrevGradeList.length > 0) {
      const sumPrevGrade = validPrevGradeList.reduce((sum, item) => sum + item.prevGrade, 0)
      avgPrevGrade = parseFloat((sumPrevGrade / validPrevGradeList.length).toFixed(1))
    }
  }

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
        <div className="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-[#161B26] shadow-2xl z-50 p-6 flex flex-col justify-between border-r border-[#EDE9FE] dark:border-[#1F2937] animate-slide-in overflow-y-auto transition-colors duration-200">
          <div>
            {/* Drawer Header */}
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#EDE9FE] dark:border-[#1F2937]">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="PaceIQ Logo" className="w-6 h-6 object-contain" />
                <span className="font-extrabold text-[#1E1B4B] dark:text-[#F3F4F6] text-base tracking-tight">
                  {isEditing ? "Edit Profile" : "PaceIQ Profile"}
                </span>
              </div>
              <button
                onClick={() => {
                  setSidebarOpen(false)
                  setIsEditing(false)
                }}
                className="w-7 h-7 rounded-full bg-[#F5F3FF] dark:bg-[#1F2937] flex items-center justify-center text-[#7C3AED] dark:text-[#C084FC] hover:scale-105 active:scale-95 transition-all text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Profile Avatar Card */}
            {!isEditing ? (
              <div className="text-center mb-5 bg-[#F5F3FF]/60 dark:bg-[#201B4B]/30 rounded-2xl p-4 border border-[#EDE9FE] dark:border-[#1F2937]">
                <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#9F67FF] text-white text-xl font-black rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm select-none">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-extrabold text-[#1E1B4B] dark:text-[#F3F4F6] text-base truncate">{userName}</h3>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] truncate mt-0.5">{userEmail}</p>
              </div>
            ) : (
              <div className="space-y-3 mb-5 p-4 bg-[#F5F3FF]/40 dark:bg-[#1F2937]/30 rounded-2xl border border-[#EDE9FE] dark:border-[#374151]">
                <div>
                  <label className="block text-[9px] font-bold text-[#7C3AED] dark:text-[#C084FC] uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#EDE9FE] dark:border-[#374151] text-xs outline-none focus:border-[#7C3AED] bg-white dark:bg-[#1F2937] text-[#1E1B4B] dark:text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-[#7C3AED] dark:text-[#C084FC] uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#EDE9FE] dark:border-[#374151] text-xs outline-none focus:border-[#7C3AED] bg-white dark:bg-[#1F2937] text-[#1E1B4B] dark:text-white font-semibold"
                  />
                </div>
              </div>
            )}

            {/* Student Details Section */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-[#7C3AED] dark:text-[#C084FC] uppercase tracking-wider">Student Details</h4>
              
              {!isEditing ? (
                <div className="bg-[#F9FAFB] dark:bg-[#1F2937]/50 rounded-xl p-3.5 border border-[#EDE9FE]/50 dark:border-[#374151] space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#6B7280] dark:text-[#9CA3AF]">Roll Number</span>
                    <span className="font-extrabold text-[#1E1B4B] dark:text-[#F3F4F6]">{roll}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#6B7280] dark:text-[#9CA3AF]">Department</span>
                    <span className="font-extrabold text-[#1E1B4B] dark:text-[#F3F4F6]">{dept}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#F9FAFB] dark:bg-[#1F2937]/50 rounded-xl p-3.5 border border-[#EDE9FE]/50 dark:border-[#374151] space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider mb-1">Roll Number</label>
                    <input
                      type="text"
                      value={editRoll}
                      onChange={e => setEditRoll(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#EDE9FE] dark:border-[#374151] text-xs outline-none focus:border-[#7C3AED] bg-white dark:bg-[#1F2937] text-[#1E1B4B] dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider mb-1">Department</label>
                    <input
                      type="text"
                      value={editDept}
                      onChange={e => setEditDept(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#EDE9FE] dark:border-[#374151] text-xs outline-none focus:border-[#7C3AED] bg-white dark:bg-[#1F2937] text-[#1E1B4B] dark:text-white font-semibold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Section */}
            <div className="mt-5 pt-4 border-t border-[#EDE9FE] dark:border-[#1F2937]">
              <div className="flex items-center justify-between bg-[#F9FAFB] dark:bg-[#1F2937]/50 rounded-xl p-3 border border-[#EDE9FE]/50 dark:border-[#374151]">
                <div className="flex items-center gap-2">
                  <span className="text-base select-none">{theme === 'dark' ? '🌙' : '☀️'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                  className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors duration-200 shrink-0 ${
                    theme === 'dark' ? 'bg-[#7C3AED]' : 'bg-[#E5E7EB]'
                  }`}
                  aria-label="Toggle dark mode"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

          </div>

          {/* Drawer Footer Actions */}
          <div className="space-y-3 pt-4 border-t border-[#EDE9FE] dark:border-[#1F2937] mt-5">
            {!isEditing ? (
              <>
                <button
                  onClick={handleStartEdit}
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  ✏️ Edit Profile Details
                </button>
                <button
                  onClick={() => {
                    setSidebarOpen(false)
                    navigate('/assessment')
                  }}
                  className="w-full bg-[#F5F3FF] dark:bg-[#1F2937] hover:bg-[#EDE9FE] dark:hover:bg-[#2A3342] text-[#7C3AED] dark:text-[#C084FC] font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#EDE9FE]/50 dark:border-[#374151]"
                >
                  📝 Take Assessment
                </button>
                <button
                  onClick={() => {
                    setSidebarOpen(false)
                    navigate('/login')
                  }}
                  className="w-full bg-[#FFF5F5] dark:bg-[#7F1D1D]/20 hover:bg-[#FEE2E2] dark:hover:bg-[#7F1D1D]/40 text-[#EF4444] font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#FEE2E2]/50 dark:border-[#7F1D1D]/30"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-[#F3F4F6] dark:bg-[#1F2937] hover:bg-[#E5E7EB] dark:hover:bg-[#374151] text-[#4B5563] dark:text-[#9CA3AF] font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
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
      </div>

      <div className="px-6 py-6 max-w-lg mx-auto space-y-6">

        {/* Dynamic Reflective Evaluation Banner */}
        {latestCategory ? (
          <div className="bg-gradient-to-br from-[#7C3AED]/10 to-[#9F67FF]/10 dark:from-[#3B0764]/20 dark:to-[#1E1B4B]/20 rounded-3xl p-6 relative overflow-hidden flex items-center justify-between border border-[#EDE9FE] dark:border-[#3B0764]/55 shadow-sm transition-all duration-200">
            <div className="z-10 max-w-[70%] space-y-3">
              <div>
                <p className="text-[10px] font-bold text-[#7C3AED] dark:text-[#C084FC] uppercase tracking-wider">Latest Evaluation</p>
                <h2 className="text-xl font-extrabold text-[#1E1B4B] dark:text-[#F3F4F6] mt-0.5 leading-tight">
                  {latestCategory}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                  parseInt(latestRisk) < 30 ? 'bg-[#E6F4EA] text-[#059669]' :
                  parseInt(latestRisk) < 70 ? 'bg-[#FFF9E6] text-[#D97706]' : 'bg-[#FCE8E6] text-[#DC2626]'
                }`}>
                  {parseInt(latestRisk) < 30 ? 'Low Risk' :
                   parseInt(latestRisk) < 70 ? 'Medium Risk' : 'High Risk'}
                </span>
                <span className="text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF]">
                  Risk Score: {latestRisk}%
                </span>
              </div>
              <button
                onClick={() => navigate('/result')}
                className="text-xs font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-sm"
              >
                View Performance Report ➔
              </button>
            </div>
            {/* Illustration on the right */}
            <div className="absolute right-0 bottom-0 top-0 w-[30%] flex items-end justify-end pointer-events-none">
              <img src="/student_illustration.png" alt="Student studying" className="h-[92%] object-contain object-bottom" />
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#7C3AED]/10 to-[#9F67FF]/10 dark:from-[#3B0764]/20 dark:to-[#1E1B4B]/20 rounded-3xl p-6 relative overflow-hidden flex items-center justify-between border border-[#EDE9FE] dark:border-[#3B0764]/55 shadow-sm transition-all duration-200">
            <div className="z-10 max-w-[70%] space-y-2">
              <p className="text-[10px] font-bold text-[#7C3AED] dark:text-[#C084FC] uppercase tracking-wider">Welcome to PaceIQ</p>
              <h2 className="text-lg font-extrabold text-[#1E1B4B] dark:text-[#F3F4F6] leading-tight">
                Identify Your Learning Pace
              </h2>
              <p className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
                Take a quick 2-minute assessment to unlock personalized recommendations and learning strategies.
              </p>
              <button
                onClick={() => navigate('/assessment')}
                className="text-xs font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm"
              >
                Start Assessment ➔
              </button>
            </div>
            {/* Illustration on the right */}
            <div className="absolute right-0 bottom-0 top-0 w-[30%] flex items-end justify-end pointer-events-none">
              <img src="/student_illustration.png" alt="Student studying" className="h-[92%] object-contain object-bottom" />
            </div>
          </div>
        )}

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

        {/* Word & Quote of the Day Section */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-[#1E1B4B] dark:text-[#F3F4F6]">Daily Inspiration & Vocabulary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Word card */}
            <div className="bg-[#EDE9FE]/30 dark:bg-[#201B4B]/20 rounded-3xl p-5 border border-[#EDE9FE] dark:border-[#1F2937] flex items-center justify-between shadow-sm transition-colors duration-200">
              <div className="max-w-[80%]">
                <p className="text-[10px] font-bold text-[#7C3AED] dark:text-[#C084FC] uppercase tracking-wider mb-1">Word of the Day</p>
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
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1.5 leading-relaxed font-semibold font-sans">
                  ({wordOfTheDay.type}) {wordOfTheDay.definition}
                </p>
              </div>
              <div className="text-3xl shrink-0 select-none animate-bounce">
                🎁
              </div>
            </div>
            {/* Quote card */}
            <div className="bg-[#EDE9FE]/30 dark:bg-[#201B4B]/20 rounded-3xl p-5 border border-[#EDE9FE] dark:border-[#1F2937] flex items-center justify-between shadow-sm transition-colors duration-200">
              <div className="max-w-[90%]">
                <p className="text-[10px] font-bold text-[#7C3AED] dark:text-[#C084FC] uppercase tracking-wider mb-1">Quote of the Day</p>
                <p className="text-xs font-semibold text-[#1E1B4B] dark:text-[#F3F4F6] italic leading-relaxed font-sans">
                  "{quoteOfTheDay}"
                </p>
              </div>
              <div className="text-3xl shrink-0 select-none">
                💡
              </div>
            </div>
          </div>
        </div>

        {/* Your Progress Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-extrabold text-[#1E1B4B] dark:text-[#F3F4F6]">Your Progress</h3>
          </div>
          
          <div
            onClick={() => setHistoryModalOpen(true)}
            className="bg-white dark:bg-[#161B26] rounded-3xl p-5 border border-[#EDE9FE] dark:border-[#1F2937] shadow-sm hover:shadow-md cursor-pointer hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group"
            title="Click to view history statistics"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E6F4EA] dark:bg-[#064E3B]/20 flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0">
                📈
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#1E1B4B] dark:text-[#F3F4F6]">Assessment History Logs</p>
                <p className="text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                  View details and timestamps of your past evaluations
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#E6F4EA] dark:bg-[#064E3B]/20 flex items-center justify-center text-[#059669] dark:text-[#34D399] font-bold group-hover:translate-x-1 transition-all duration-200">
              ➔
            </div>
          </div>
        </div>

        {/* History & Statistics Modal */}
        {historyModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="relative bg-white dark:bg-[#161B26] rounded-3xl w-full max-w-md p-6 border border-[#EDE9FE] dark:border-[#1F2937] shadow-xl space-y-4 animate-scale-up">
              <div className="flex justify-between items-center pb-2 border-b border-[#EDE9FE] dark:border-[#1F2937]">
                <h3 className="text-base font-extrabold text-[#1E1B4B] dark:text-[#F3F4F6] flex items-center gap-1.5 truncate">
                  📊 Assessment History
                </h3>
                <button
                  onClick={() => setHistoryModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg font-bold select-none cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Stat badges */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#F5F3FF] dark:bg-[#201B4B]/30 rounded-2xl p-3 text-center border border-[#EDE9FE]/50 dark:border-[#3B0764]/20 flex flex-col justify-center">
                    <p className="text-[9px] font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">Attempts</p>
                    <p className="text-lg font-extrabold text-[#7C3AED] dark:text-[#C084FC] mt-0.5">{totalAttempts}</p>
                  </div>
                  <div className="bg-[#F5F3FF] dark:bg-[#201B4B]/30 rounded-2xl p-3 text-center border border-[#EDE9FE]/50 dark:border-[#3B0764]/20 flex flex-col justify-center">
                    <p className="text-[9px] font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">Avg Attend.</p>
                    <p className="text-lg font-extrabold text-[#7C3AED] dark:text-[#C084FC] mt-0.5">{avgAttendance > 0 ? `${avgAttendance}%` : 'N/A'}</p>
                  </div>
                  <div className="bg-[#F5F3FF] dark:bg-[#201B4B]/30 rounded-2xl p-3 text-center border border-[#EDE9FE]/50 dark:border-[#3B0764]/20 flex flex-col justify-center">
                    <p className="text-[9px] font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">Avg Grade</p>
                    <p className="text-lg font-extrabold text-[#7C3AED] dark:text-[#C084FC] mt-0.5">{avgPrevGrade > 0 ? avgPrevGrade : 'N/A'}</p>
                  </div>
                </div>

                {/* History timeline list */}
                <div>
                  <h4 className="text-xs font-bold text-[#1E1B4B] dark:text-[#F3F4F6] uppercase tracking-wider mb-2.5">
                    Academic Risk History
                  </h4>
                  {assessmentHistory.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {assessmentHistory.slice().reverse().map((item, idx) => (
                        <div key={idx} className="bg-white/60 dark:bg-[#111827]/40 rounded-xl p-3 border border-[#EDE9FE]/80 dark:border-[#1F2937]">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-extrabold text-[#1E1B4B] dark:text-[#F3F4F6]">{item.category}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-[#6B7280] dark:text-[#9CA3AF]">{item.date}</span>
                              <button
                                onClick={() => handleDeleteLog(assessmentHistory.length - 1 - idx)}
                                className="text-xs hover:scale-110 active:scale-90 transition-all p-0.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded cursor-pointer"
                                title="Delete this log"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex-1 bg-[#EDE9FE] dark:bg-[#1F2937] h-2.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-2.5 rounded-full transition-all duration-300 ${
                                  item.risk < 30 ? 'bg-[#00C853]' :
                                  item.risk < 70 ? 'bg-[#FFA000]' : 'bg-[#E53935]'
                                }`}
                                style={{ width: `${item.risk}%` }}
                               />
                            </div>
                            <span className="text-xs font-bold text-[#1E1B4B] dark:text-[#F3F4F6] min-w-8 text-right">
                              {item.risk}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] text-center py-6 bg-[#EDE9FE]/20 dark:bg-[#1E1B4B]/10 rounded-2xl border border-dashed border-[#EDE9FE] dark:border-[#1F2937]">
                      No history recorded yet. Take an assessment to start tracking your improvement!
                    </p>
                  )}
                </div>
              </div>

              {/* Undo Toast Notification */}
              {undoToastVisible && (
                <div className="bg-[#1E1B4B] dark:bg-[#111827] text-white px-4 py-2.5 rounded-xl flex items-center justify-between shadow-lg border border-[#EDE9FE]/20 animate-fade-in text-[11px] font-semibold">
                  <span>Log deleted successfully</span>
                  <button
                    onClick={handleUndoDelete}
                    className="text-[#C084FC] hover:underline font-extrabold cursor-pointer"
                  >
                    Undo
                  </button>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => setHistoryModalOpen(false)}
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold py-3 rounded-xl text-xs transition-all duration-200 shadow-sm"
                >
                  Close History
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <ChatbotWidget isOpen={chatOpen} setIsOpen={setChatOpen} />

    </div>
  )
}

export default Home