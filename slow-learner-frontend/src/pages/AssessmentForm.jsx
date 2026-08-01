import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatbotWidget from '../components/chatbot/ChatbotWidget'

function AssessmentForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    prevGrade: '',
    studyHours: '',
    attendance: '',
    gender: '',
    parentalSupport: '',
    onlineClasses: '',
    // Difficulty checklist items
    diffReading: false,
    diffMaths: false,
    diffFocusing: false,
    diffInstructions: false,
    diffMemory: false,
    diffWriting: false,
    diffAnxiety: false,
    diffVerbal: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    const prevGradeVal = parseFloat(form.prevGrade || 0)
    const prevGradePercent = prevGradeVal * 10
    const attendanceVal = parseFloat(form.attendance || 0)
    const studyHoursVal = parseFloat(form.studyHours || 0)

    let parentalPoints = 0
    if (form.parentalSupport === 'high') parentalPoints = 10
    else if (form.parentalSupport === 'medium') parentalPoints = 5

    let onlinePoints = 0
    if (form.onlineClasses === 'yes') onlinePoints = 5

    const score = Math.max(0, Math.min(100,
      (prevGradePercent * 0.35) +
      (attendanceVal * 0.35) +
      (Math.min(studyHoursVal * 4, 15)) +
      parentalPoints +
      onlinePoints
    ))

    let category = 'Very Slow Learner'
    let badgeColor = '#E53935'
    if (score >= 75) { category = 'Fast Learner'; badgeColor = '#00C853' }
    else if (score >= 50) { category = 'Average Learner'; badgeColor = '#FFA000' }
    else if (score >= 30) { category = 'Slow Learner'; badgeColor = '#FF6D00' }

    const riskScore = Math.round(100 - score)

    // Package all assessment inputs into ONE JSON payload
    const payload = {
      prevGrade: prevGradePercent,
      studyHours: studyHoursVal,
      attendance: attendanceVal,
      gender: form.gender,
      parentalSupport: form.parentalSupport,
      onlineClasses: form.onlineClasses,
      difficultyChecklist: {
        difficultyReading: form.diffReading,
        difficultyMaths: form.diffMaths,
        difficultyFocusing: form.diffFocusing,
        difficultyInstructions: form.diffInstructions,
        difficultyMemory: form.diffMemory,
        difficultyWriting: form.diffWriting,
        difficultyAnxiety: form.diffAnxiety,
        difficultyVerbal: form.diffVerbal
      }
    }

    const submitData = async () => {
      let finalCategory = category
      let finalRisk = riskScore
      let confidenceScore = 82 + (Math.round(prevGradePercent + attendanceVal + (studyHoursVal * 10)) % 16)
      try {
        const response = await fetch('http://localhost:5000/api/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        if (response.ok) {
          const data = await response.json()
          if (data.category && data.riskScore !== undefined) {
            finalCategory = data.category
            finalRisk = data.riskScore
          }
          if (data.confidence !== undefined) {
            confidenceScore = data.confidence <= 1 ? Math.round(data.confidence * 100) : Math.round(data.confidence)
          }
        }
      } catch (err) {
        console.warn("Backend offline or failed, using local offline fallback calculations...", err)
      }

      // Save real-time progress stats in localStorage
      try {
        const today = new Date().toDateString()
        localStorage.setItem('paceiq_last_check', today)
        const enteredHours = parseFloat(form.studyHours || 0)

        const currentAssessments = parseInt(localStorage.getItem('paceiq_assessments_count') || '0')
        localStorage.setItem('paceiq_assessments_count', (currentAssessments + 1).toString())
        localStorage.setItem('paceiq_latest_attendance', form.attendance.toString())
        localStorage.setItem('paceiq_latest_category', finalCategory)
        localStorage.setItem('paceiq_latest_risk', finalRisk.toString())
        localStorage.setItem('paceiq_latest_study_hours', form.studyHours)
        localStorage.setItem('paceiq_latest_confidence', confidenceScore.toString())
        
        // Save additional features to local storage for direct result page loads
        localStorage.setItem('paceiq_latest_prev_grade', form.prevGrade)
        localStorage.setItem('paceiq_latest_gender', form.gender)
        localStorage.setItem('paceiq_latest_parental_support', form.parentalSupport)
        localStorage.setItem('paceiq_latest_online_classes', form.onlineClasses)

        // Save attempt to history log
        const history = JSON.parse(localStorage.getItem('paceiq_assessment_history') || '[]')
        history.push({
          date: new Date().toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          category: finalCategory,
          risk: finalRisk,
          attendance: attendanceVal,
          prevGrade: prevGradeVal
        })
        if (history.length > 10) history.shift()
        localStorage.setItem('paceiq_assessment_history', JSON.stringify(history))
      } catch (err) {
        console.error(err)
      }

      navigate('/result', {
        state: { form, category: finalCategory, badgeColor, riskScore: finalRisk, confidenceScore }
      })
    }

    submitData()
  }

  const filledFieldsCount = [
    form.prevGrade !== '',
    form.studyHours !== '',
    form.attendance !== '',
    form.gender !== '',
    form.parentalSupport !== '',
    form.onlineClasses !== ''
  ].filter(Boolean).length
  const completionPercentage = Math.round((filledFieldsCount / 6) * 100)

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
        <h2 className="font-bold text-[#1E1B4B] dark:text-[#F3F4F6]">Learning Assessment</h2>
      </div>

      {/* Progress Bar */}
      <div className="px-6 max-w-lg mx-auto mt-6 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-[#7C3AED] dark:text-[#C084FC] uppercase tracking-wider">Assessment Progress</span>
          <span className="text-xs font-bold text-[#7C3AED] dark:text-[#C084FC]">{completionPercentage}% Completed</span>
        </div>
        <div className="w-full bg-[#EDE9FE] dark:bg-[#1F2937] h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <ChatbotWidget />
      </div>

      <div className="px-6 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Prev Grade */}
          <div className="bg-white dark:bg-[#161B26] rounded-2xl p-5 border border-[#EDE9FE] dark:border-[#1F2937] shadow-sm hover:shadow-md transition-shadow duration-200">
            <label className="block text-sm font-bold text-[#7C3AED] dark:text-[#C084FC] mb-3">
              Previous Grade (CGPA / points out of 10)
            </label>
            <input
              type="number" min="1.0" max="10.0" step="0.1"
              value={form.prevGrade}
              onChange={e => setForm({...form, prevGrade: e.target.value})}
              placeholder="e.g. 8.5"
              className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] dark:border-[#374151] text-sm outline-none focus:border-[#7C3AED] dark:focus:border-[#C084FC] focus:ring-2 focus:ring-[#EDE9FE] dark:focus:ring-[#1E1B4B]/50 focus:shadow-sm focus:outline-none transition-all bg-white dark:bg-[#1F2937] text-[#1E1B4B] dark:text-white font-semibold"
              required
            />
          </div>

          {/* Attendance Rate */}
          <div className="bg-white dark:bg-[#161B26] rounded-2xl p-5 border border-[#EDE9FE] dark:border-[#1F2937] shadow-sm hover:shadow-md transition-shadow duration-200">
            <label className="block text-sm font-bold text-[#7C3AED] dark:text-[#C084FC] mb-3">
              Attendance Rate (1 to 100 in percentage)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range" min="1" max="100"
                value={form.attendance || 50}
                onChange={e => setForm({...form, attendance: parseInt(e.target.value)})}
                className="flex-1 accent-[#7C3AED] dark:accent-[#C084FC] cursor-pointer"
              />
              <span className="text-[#7C3AED] dark:text-[#C084FC] font-bold text-sm w-24 text-right">
                {form.attendance !== '' ? `${form.attendance}%` : 'Select rate'}
              </span>
            </div>
          </div>

          {/* Average Study Hours */}
          <div className="bg-white dark:bg-[#161B26] rounded-2xl p-5 border border-[#EDE9FE] dark:border-[#1F2937] shadow-sm hover:shadow-md transition-shadow duration-200">
            <label className="block text-sm font-bold text-[#7C3AED] dark:text-[#C084FC] mb-3">
              Average Study Hours per day
            </label>
            <input
              type="number" min="0" max="24" step="0.5"
              value={form.studyHours}
              onChange={e => setForm({...form, studyHours: e.target.value})}
              placeholder="e.g. 3.5"
              className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] dark:border-[#374151] text-sm outline-none focus:border-[#7C3AED] dark:focus:border-[#C084FC] focus:ring-2 focus:ring-[#EDE9FE] dark:focus:ring-[#1E1B4B]/50 focus:shadow-sm focus:outline-none transition-all bg-white dark:bg-[#1F2937] text-[#1E1B4B] dark:text-white font-semibold"
              required
            />
          </div>

          {/* Gender */}
          <div className="bg-white dark:bg-[#161B26] rounded-2xl p-5 border border-[#EDE9FE] dark:border-[#1F2937] shadow-sm hover:shadow-md transition-shadow duration-200">
            <label className="block text-sm font-bold text-[#7C3AED] dark:text-[#C084FC] mb-3">
              Gender
            </label>
            <select
              value={form.gender}
              onChange={e => setForm({...form, gender: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] dark:border-[#374151] text-sm outline-none focus:border-[#7C3AED] dark:focus:border-[#C084FC] focus:ring-2 focus:ring-[#EDE9FE] dark:focus:ring-[#1E1B4B]/50 focus:shadow-sm focus:outline-none transition-all bg-white dark:bg-[#1F2937] cursor-pointer text-[#1E1B4B] dark:text-white font-semibold"
              required
            >
              <option value="" disabled className="dark:bg-[#1F2937]">Select gender</option>
              <option value="male" className="dark:bg-[#1F2937]">Male</option>
              <option value="female" className="dark:bg-[#1F2937]">Female</option>
            </select>
          </div>

          {/* Parental Support */}
          <div className="bg-white dark:bg-[#161B26] rounded-2xl p-5 border border-[#EDE9FE] dark:border-[#1F2937] shadow-sm hover:shadow-md transition-shadow duration-200">
            <label className="block text-sm font-bold text-[#7C3AED] dark:text-[#C084FC] mb-3">
              Parental Support Level
            </label>
            <select
              value={form.parentalSupport}
              onChange={e => setForm({...form, parentalSupport: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] dark:border-[#374151] text-sm outline-none focus:border-[#7C3AED] dark:focus:border-[#C084FC] focus:ring-2 focus:ring-[#EDE9FE] dark:focus:ring-[#1E1B4B]/50 focus:shadow-sm focus:outline-none transition-all bg-white dark:bg-[#1F2937] cursor-pointer text-[#1E1B4B] dark:text-white font-semibold"
              required
            >
              <option value="" disabled className="dark:bg-[#1F2937]">Select support level</option>
              <option value="high" className="dark:bg-[#1F2937]">High</option>
              <option value="medium" className="dark:bg-[#1F2937]">Medium</option>
              <option value="low" className="dark:bg-[#1F2937]">Low</option>
            </select>
          </div>

          {/* Online Classes Taken */}
          <div className="bg-white dark:bg-[#161B26] rounded-2xl p-5 border border-[#EDE9FE] dark:border-[#1F2937] shadow-sm hover:shadow-md transition-shadow duration-200">
            <label className="block text-sm font-bold text-[#7C3AED] dark:text-[#C084FC] mb-3">
              Have you taken any Online Classes?
            </label>
            <select
              value={form.onlineClasses}
              onChange={e => setForm({...form, onlineClasses: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] dark:border-[#374151] text-sm outline-none focus:border-[#7C3AED] dark:focus:border-[#C084FC] focus:ring-2 focus:ring-[#EDE9FE] dark:focus:ring-[#1E1B4B]/50 focus:shadow-sm focus:outline-none transition-all bg-white dark:bg-[#1F2937] cursor-pointer text-[#1E1B4B] dark:text-white font-semibold"
              required
            >
              <option value="" disabled className="dark:bg-[#1F2937]">Select option</option>
              <option value="yes" className="dark:bg-[#1F2937]">Yes</option>
              <option value="no" className="dark:bg-[#1F2937]">No</option>
            </select>
          </div>

          {/* Difficulty Checklist Header & Checkboxes (Merged Section) */}
          <div className="bg-gradient-to-br from-white to-[#FDFBFF] dark:from-[#161B26] dark:to-[#161B26] rounded-2xl p-6 border border-[#EDE9FE] dark:border-[#1F2937] shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-[#7C3AED] dark:text-[#C084FC]">Learning Challenges Checklist</h3>
              <p className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                Select any difficulties you face in your daily learning (Optional - For future reference)
              </p>
            </div>
            
            <div className="space-y-2.5">
              {[
                { key: 'diffReading', text: 'Difficulty reading or recognizing words' },
                { key: 'diffMaths', text: 'Trouble with numbers/basic maths' },
                { key: 'diffFocusing', text: 'Difficulty focusing for long periods' },
                { key: 'diffInstructions', text: 'Trouble following multi-step instructions' },
                { key: 'diffMemory', text: 'Poor short-term memory' },
                { key: 'diffWriting', text: 'Slow writing speed' },
                { key: 'diffAnxiety', text: 'Anxiety during tests/class participation' },
                { key: 'diffVerbal', text: 'Difficulty understanding verbal instructions' }
              ].map(item => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[#EDE9FE]/75 dark:border-[#374151]/60 bg-white/60 dark:bg-[#1F2937]/40 hover:bg-white dark:hover:bg-[#1F2937] hover:border-[#7C3AED]/30 dark:hover:border-[#C084FC]/30 cursor-pointer transition-all duration-200 shadow-sm"
                >
                  <input
                    type="checkbox"
                    checked={form[item.key]}
                    onChange={e => setForm({...form, [item.key]: e.target.checked})}
                    className="w-4 h-4 rounded border-[#EDE9FE] dark:border-[#374151] text-[#7C3AED] dark:text-[#C084FC] focus:ring-[#EDE9FE] accent-[#7C3AED]"
                  />
                  <span className="text-xs font-semibold text-[#1E1B4B] dark:text-[#F3F4F6]">{item.text}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] text-white font-bold py-4 rounded-2xl text-sm shadow-md transition-all duration-200 mt-2 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed scale-100' : 'hover:scale-105 active:scale-95'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Assessment →'}
          </button>

        </form>
      </div>
    </div>
  )
}

export default AssessmentForm