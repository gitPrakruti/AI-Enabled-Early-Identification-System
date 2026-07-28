import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatbotWidget from '../components/chatbot/ChatbotWidget'
import { submitAssessment } from "../services/assessmentService";

function AssessmentForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    prevGrade: '',
    studyHours: '',
    attendance: 0,
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


    const handleSubmit = async (e) => {
  e.preventDefault()

  const prevGradeVal = parseFloat(form.prevGrade || 0)
  const attendanceVal = parseFloat(form.attendance || 0)
  const studyHoursVal = parseFloat(form.studyHours || 0)

  // Badge color (for Result page UI)
  let badgeColor = "#DC2626"

  const assessmentData = {

    previous_grade: prevGradeVal,

    attendance_rate: attendanceVal,

    study_hours: studyHoursVal,

    gender:
      form.gender === "male"
        ? "Male"
        : "Female",

    parental_support:
      form.parentalSupport === "high"
        ? "High"
        : form.parentalSupport === "medium"
          ? "Medium"
          : "Low",

    online_classes_taken:
      form.onlineClasses === "yes"
        ? "Yes"
        : "No",

    difficulty_checklist: [

      ...(form.diffReading
        ? ["Difficulty reading or recognizing words"]
        : []),

      ...(form.diffMaths
        ? ["Trouble with numbers/basic maths"]
        : []),

      ...(form.diffFocusing
        ? ["Difficulty focusing for long periods"]
        : []),

      ...(form.diffInstructions
        ? ["Trouble following multi-step instructions"]
        : []),

      ...(form.diffMemory
        ? ["Poor short-term memory"]
        : []),

      ...(form.diffWriting
        ? ["Slow writing speed"]
        : []),

      ...(form.diffAnxiety
        ? ["Anxiety during tests/class participation"]
        : []),

      ...(form.diffVerbal
        ? ["Difficulty understanding verbal instructions"]
        : [])

    ]

  }

  try {

    console.log("Sending Assessment...")
    console.log(assessmentData)

    const response = await submitAssessment(
      assessmentData
    )

    console.log("Backend Response")
    console.log(response)

    let displayColor = "#DC2626"

    if (response.prediction === "Fast Learner") {
      displayColor = "#059669"
    }

    localStorage.setItem(
      "latest_prediction",
      JSON.stringify(response)
    )

    // Save user progress
    try {

      const today = new Date().toDateString()

      const lastCheck =
        localStorage.getItem("paceiq_last_check")

      let currentStreak =
        parseInt(
          localStorage.getItem("paceiq_streak") || "0"
        )

      if (lastCheck !== today) {

        if (lastCheck) {

          const lastDate = new Date(lastCheck)

          const diffDays =
            Math.ceil(
              Math.abs(
                new Date() - lastDate
              ) /
              (1000 * 60 * 60 * 24)
            )

          if (diffDays <= 1) {
            currentStreak++
          }

          else {
            currentStreak = 1
          }

        }

        else {

          currentStreak = 1

        }

        localStorage.setItem(
          "paceiq_streak",
          currentStreak.toString()
        )

        localStorage.setItem(
          "paceiq_last_check",
          today
        )

      }

      const currentHours =
        parseFloat(
          localStorage.getItem(
            "paceiq_total_study_hours"
          ) || "0"
        )

      localStorage.setItem(
        "paceiq_total_study_hours",
        (
          currentHours + studyHoursVal
        ).toString()
      )

      const currentAssessments =
        parseInt(
          localStorage.getItem(
            "paceiq_assessments_count"
          ) || "0"
        )

      localStorage.setItem(
        "paceiq_assessments_count",
        (
          currentAssessments + 1
        ).toString()
      )

    }

    catch (err) {

      console.error(err)

    }

    navigate("/result", {

      state: {

        form,

        prediction: response.prediction,

        confidence: response.confidence,

        riskScore: response.risk_score,

        recommendations: response.recommendations,

        badgeColor: displayColor

      }

    })

  }

  catch (error) {

    console.error(error)

    if (error.response) {

      alert(
        error.response.data.detail
      )

    }

    else {

      alert(
        "Unable to connect to backend."
      )

    }

  }

}

  const filledFieldsCount = [
    form.prevGrade !== '',
    form.studyHours !== '',
    form.attendance !== undefined,
    form.gender !== '',
    form.parentalSupport !== '',
    form.onlineClasses !== ''
  ].filter(Boolean).length
  const completionPercentage = Math.round((filledFieldsCount / 6) * 100)

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
        <h2 className="font-bold text-[#1E1B4B]">Learning Assessment</h2>
      </div>

      {/* Progress Bar */}
      <div className="px-6 max-w-lg mx-auto mt-6 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">Assessment Progress</span>
          <span className="text-xs font-bold text-[#7C3AED]">{completionPercentage}% Completed</span>
        </div>
        <div className="w-full bg-[#EDE9FE] h-2.5 rounded-full overflow-hidden">
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
          <div className="bg-white rounded-2xl p-5 border border-[#EDE9FE] shadow-sm hover:shadow-md transition-shadow duration-200">
            <label className="block text-sm font-bold text-[#7C3AED] mb-3">
              Previous Grade (1 to 100 in percentage)
            </label>
            <input
              type="number" min="1" max="100"
              value={form.prevGrade}
              onChange={e => setForm({...form, prevGrade: e.target.value})}
              placeholder="e.g. 75"
              className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] text-sm outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#EDE9FE] focus:shadow-sm focus:outline-none transition-all bg-white"
              required
            />
          </div>

          {/* Attendance Rate */}
          <div className="bg-white rounded-2xl p-5 border border-[#EDE9FE] shadow-sm hover:shadow-md transition-shadow duration-200">
            <label className="block text-sm font-bold text-[#7C3AED] mb-3">
              Attendance Rate (1 to 100 in percentage)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range" min="1" max="100"
                value={form.attendance}
                onChange={e => setForm({...form, attendance: parseInt(e.target.value)})}
                className="flex-1 accent-[#7C3AED] cursor-pointer"
              />
              <span className="text-[#7C3AED] font-bold text-sm w-12 text-right">
                {form.attendance}%
              </span>
            </div>
          </div>

          {/* Average Study Hours */}
          <div className="bg-white rounded-2xl p-5 border border-[#EDE9FE] shadow-sm hover:shadow-md transition-shadow duration-200">
            <label className="block text-sm font-bold text-[#7C3AED] mb-3">
              Average Study Hours per day
            </label>
            <input
              type="number" min="0" max="24" step="0.5"
              value={form.studyHours}
              onChange={e => setForm({...form, studyHours: e.target.value})}
              placeholder="e.g. 3.5"
              className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] text-sm outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#EDE9FE] focus:shadow-sm focus:outline-none transition-all bg-white"
              required
            />
          </div>

          {/* Gender */}
          <div className="bg-white rounded-2xl p-5 border border-[#EDE9FE] shadow-sm hover:shadow-md transition-shadow duration-200">
            <label className="block text-sm font-bold text-[#7C3AED] mb-3">
              Gender
            </label>
            <select
              value={form.gender}
              onChange={e => setForm({...form, gender: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] text-sm outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#EDE9FE] focus:shadow-sm focus:outline-none transition-all bg-white cursor-pointer text-[#1E1B4B]"
              required
            >
              <option value="" disabled>Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Parental Support */}
          <div className="bg-white rounded-2xl p-5 border border-[#EDE9FE] shadow-sm hover:shadow-md transition-shadow duration-200">
            <label className="block text-sm font-bold text-[#7C3AED] mb-3">
              Parental Support Level
            </label>
            <select
              value={form.parentalSupport}
              onChange={e => setForm({...form, parentalSupport: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] text-sm outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#EDE9FE] focus:shadow-sm focus:outline-none transition-all bg-white cursor-pointer text-[#1E1B4B]"
              required
            >
              <option value="" disabled>Select support level</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Online Classes Taken */}
          <div className="bg-white rounded-2xl p-5 border border-[#EDE9FE] shadow-sm hover:shadow-md transition-shadow duration-200">
            <label className="block text-sm font-bold text-[#7C3AED] mb-3">
              Have you taken any Online Classes?
            </label>
            <select
              value={form.onlineClasses}
              onChange={e => setForm({...form, onlineClasses: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] text-sm outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#EDE9FE] focus:shadow-sm focus:outline-none transition-all bg-white cursor-pointer text-[#1E1B4B]"
              required
            >
              <option value="" disabled>Select option</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {/* Difficulty Checklist Header & Checkboxes (Merged Section) */}
          <div className="bg-gradient-to-br from-white to-[#FDFBFF] rounded-2xl p-6 border border-[#EDE9FE] shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-[#7C3AED]">Learning Challenges Checklist</h3>
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
                  className="flex items-center gap-3 p-3 rounded-xl border border-[#EDE9FE]/75 bg-white/60 hover:bg-white hover:border-[#7C3AED]/30 cursor-pointer transition-all duration-200 shadow-sm"
                >
                  <input
                    type="checkbox"
                    checked={form[item.key]}
                    onChange={e => setForm({...form, [item.key]: e.target.checked})}
                    className="w-4 h-4 rounded border-[#EDE9FE] text-[#7C3AED] focus:ring-[#EDE9FE] accent-[#7C3AED]"
                  />
                  <span className="text-xs font-semibold text-[#1E1B4B]">{item.text}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] text-white font-bold py-4 rounded-2xl text-sm shadow-md hover:scale-105 active:scale-95 transition-all duration-200 mt-2"
          >
            Submit Assessment →
          </button>

        </form>
      </div>
    </div>
  )
}
export default AssessmentForm