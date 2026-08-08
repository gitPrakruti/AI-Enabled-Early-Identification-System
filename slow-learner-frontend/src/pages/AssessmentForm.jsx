import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatbotWidget from '../components/chatbot/ChatbotWidget'

function AssessmentForm() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    prevGrade: '',
    studyHours: '',
    attendance: '',
    parentalSupport: '',
    onlineClasses: '',
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

    const payload = {
  previous_grade: prevGradePercent,
  study_hours: studyHoursVal,
  attendance_rate: attendanceVal,

  parental_support:
    form.parentalSupport === 'high'
      ? 'High'
      : form.parentalSupport === 'medium'
        ? 'Medium'
        : 'Low',

  online_classes_taken:
    form.onlineClasses === 'yes'
      ? 'Yes'
      : 'No',

  difficulty_checklist: [
  String(form.diffReading),
  String(form.diffMaths),
  String(form.diffFocusing),
  String(form.diffInstructions),
  String(form.diffMemory),
  String(form.diffWriting),
  String(form.diffAnxiety),
  String(form.diffVerbal)
]
}
    const submitData = async () => {
      try {
        const token = localStorage.getItem('token')

        if (!token) {
          setIsSubmitting(false)
          navigate('/login')
          return
        }

        const response = await fetch(
          'http://127.0.0.1:8000/assessment/submit',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        )

        if (response.status === 401) {
          localStorage.removeItem('token')
          setIsSubmitting(false)
          navigate('/login')
          return
        }

        const data = await response.json()

        if (!response.ok) {
          console.log('422 BACKEND RESPONSE:', data)
          throw new Error(JSON.stringify(data.detail))
        }

        const finalCategory = data.prediction || 'Unknown'
        const finalRisk = data.risk_score ?? 0

        const confidenceScore =
          data.confidence <= 1
            ? Math.round(data.confidence * 100)
            : Math.round(data.confidence)

        try {
          const today = new Date().toDateString()

          localStorage.setItem(
            'paceiq_last_check',
            today
          )

          const currentAssessments = parseInt(
            localStorage.getItem(
              'paceiq_assessments_count'
            ) || '0'
          )

          localStorage.setItem(
            'paceiq_assessments_count',
            (currentAssessments + 1).toString()
          )

          localStorage.setItem(
            'paceiq_latest_attendance',
            attendanceVal.toString()
          )

          localStorage.setItem(
            'paceiq_latest_category',
            finalCategory
          )

          localStorage.setItem(
            'paceiq_latest_risk',
            finalRisk.toString()
          )

          localStorage.setItem(
            'paceiq_latest_study_hours',
            studyHoursVal.toString()
          )

          localStorage.setItem(
            'paceiq_latest_confidence',
            confidenceScore.toString()
          )

          localStorage.setItem(
            'paceiq_latest_prev_grade',
            prevGradeVal.toString()
          )

          localStorage.setItem(
            'paceiq_latest_parental_support',
            form.parentalSupport
          )

          localStorage.setItem(
            'paceiq_latest_online_classes',
            form.onlineClasses
          )

          const history = JSON.parse(
            localStorage.getItem(
              'paceiq_assessment_history'
            ) || '[]'
          )

          history.push({
            date: new Date().toLocaleString(
              undefined,
              {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }
            ),
            category: finalCategory,
            risk: finalRisk,
            attendance: attendanceVal,
            prevGrade: prevGradeVal,
          })

          if (history.length > 10) {
            history.shift()
          }

          localStorage.setItem(
            'paceiq_assessment_history',
            JSON.stringify(history)
          )
        } catch (storageError) {
          console.error(
            'Error saving assessment data:',
            storageError
          )
        }

        setIsSubmitting(false)

        navigate('/result', {
          state: {
            form,
            category: finalCategory,
            badgeColor:
              finalCategory === 'Slow Learner'
                ? '#FF6D00'
                : '#00C853',
            riskScore: finalRisk,
            confidenceScore,
          },
        })
      } catch (err) {
        console.error(
          'Assessment submission error:',
          err
        )

        setIsSubmitting(false)

        alert(
          err.message ||
            'Unable to submit assessment. Please make sure the backend is running.'
        )
      }
    }

    submitData()
  }

  const filledFieldsCount = [
    form.prevGrade !== '',
    form.studyHours !== '',
    form.attendance !== '',
    form.parentalSupport !== '',
    form.onlineClasses !== '',
  ].filter(Boolean).length

  const completionPercentage = Math.round(
    (filledFieldsCount / 5) * 100
  )

  return (
    <div className="min-h-screen bg-[#F5F3FF] dark:bg-[#0B0F19] pb-10 animate-fade-in transition-colors duration-200">

      <div className="bg-white dark:bg-[#161B26] border-b border-[#EDE9FE] dark:border-[#1F2937] px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/home')}
          className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#7C3AED] text-xl font-bold"
        >
          ←
        </button>

        <h2 className="font-bold text-[#1E1B4B] dark:text-[#F3F4F6]">
          Learning Assessment
        </h2>
      </div>

      <div className="px-6 max-w-lg mx-auto mt-6 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
            Assessment Progress
          </span>

          <span className="text-xs font-bold text-[#7C3AED]">
            {completionPercentage}% Completed
          </span>
        </div>

        <div className="w-full bg-[#EDE9FE] dark:bg-[#1F2937] h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] h-2.5 rounded-full transition-all duration-300"
            style={{
              width: `${completionPercentage}%`,
            }}
          />
        </div>

        <ChatbotWidget />
      </div>

      <div className="px-6 max-w-lg mx-auto">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          <div className="bg-white dark:bg-[#161B26] rounded-2xl p-5 border border-[#EDE9FE] dark:border-[#1F2937] shadow-sm">
            <label className="block text-sm font-bold text-[#7C3AED] dark:text-[#C084FC] mb-3">
              Previous Grade (CGPA / points out of 10)
            </label>

            <input
              type="number"
              min="1"
              max="10"
              step="0.1"
              value={form.prevGrade}
              onChange={(e) =>
                setForm({
                  ...form,
                  prevGrade: e.target.value,
                })
              }
              placeholder="e.g. 8.5"
              className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] dark:border-[#374151] bg-white dark:bg-[#1F2937] text-[#1E1B4B] dark:text-white"
              required
            />
          </div>

          <div className="bg-white dark:bg-[#161B26] rounded-2xl p-5 border border-[#EDE9FE] dark:border-[#1F2937] shadow-sm">
            <label className="block text-sm font-bold text-[#7C3AED] dark:text-[#C084FC] mb-3">
              Attendance Rate (1 to 100 in percentage)
            </label>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="100"
                value={form.attendance || 50}
                onChange={(e) =>
                  setForm({
                    ...form,
                    attendance: parseInt(e.target.value),
                  })
                }
                className="flex-1 accent-[#7C3AED]"
              />

              <span className="text-[#7C3AED] font-bold text-sm w-24 text-right">
                {form.attendance !== ''
                  ? `${form.attendance}%`
                  : 'Select rate'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#161B26] rounded-2xl p-5 border border-[#EDE9FE] dark:border-[#1F2937] shadow-sm">
            <label className="block text-sm font-bold text-[#7C3AED] dark:text-[#C084FC] mb-3">
              Average Study Hours per day
            </label>

            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={form.studyHours}
              onChange={(e) =>
                setForm({
                  ...form,
                  studyHours: e.target.value,
                })
              }
              placeholder="e.g. 3.5"
              className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] dark:border-[#374151] bg-white dark:bg-[#1F2937] text-[#1E1B4B] dark:text-white"
              required
            />
          </div>

          <div className="bg-white dark:bg-[#161B26] rounded-2xl p-5 border border-[#EDE9FE] dark:border-[#1F2937] shadow-sm">
            <label className="block text-sm font-bold text-[#7C3AED] dark:text-[#C084FC] mb-3">
              Parental Support Level
            </label>

            <select
              value={form.parentalSupport}
              onChange={(e) =>
                setForm({
                  ...form,
                  parentalSupport: e.target.value,
                })
              }
              className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] dark:border-[#374151] bg-white dark:bg-[#1F2937] text-[#1E1B4B] dark:text-white"
              required
            >
              <option value="" disabled>
                Select support level
              </option>

              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="bg-white dark:bg-[#161B26] rounded-2xl p-5 border border-[#EDE9FE] dark:border-[#1F2937] shadow-sm">
            <label className="block text-sm font-bold text-[#7C3AED] dark:text-[#C084FC] mb-3">
              Have you taken any Online Classes?
            </label>

            <select
              value={form.onlineClasses}
              onChange={(e) =>
                setForm({
                  ...form,
                  onlineClasses: e.target.value,
                })
              }
              className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] dark:border-[#374151] bg-white dark:bg-[#1F2937] text-[#1E1B4B] dark:text-white"
              required
            >
              <option value="" disabled>
                Select option
              </option>

              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="bg-white dark:bg-[#161B26] rounded-2xl p-6 border border-[#EDE9FE] dark:border-[#1F2937] shadow-sm space-y-4">

            <div>
              <h3 className="text-base font-extrabold text-[#7C3AED] dark:text-[#C084FC]">
                Learning Challenges Checklist
              </h3>

              <p className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                Select any difficulties you face in your daily learning
                (Optional - For future reference)
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  key: 'diffReading',
                  text: 'Difficulty reading or recognizing words',
                },
                {
                  key: 'diffMaths',
                  text: 'Trouble with numbers/basic maths',
                },
                {
                  key: 'diffFocusing',
                  text: 'Difficulty focusing for long periods',
                },
                {
                  key: 'diffInstructions',
                  text: 'Trouble following multi-step instructions',
                },
                {
                  key: 'diffMemory',
                  text: 'Poor short-term memory',
                },
                {
                  key: 'diffWriting',
                  text: 'Slow writing speed',
                },
                {
                  key: 'diffAnxiety',
                  text: 'Anxiety during tests/class participation',
                },
                {
                  key: 'diffVerbal',
                  text: 'Difficulty understanding verbal instructions',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[#EDE9FE] dark:border-[#374151] bg-white dark:bg-[#1F2937] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form[item.key]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-[#7C3AED]"
                  />

                  <span className="text-xs font-semibold text-[#1E1B4B] dark:text-[#F3F4F6]">
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] text-white font-bold py-4 rounded-2xl text-sm shadow-md transition-all ${
              isSubmitting
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-105 active:scale-95'
            }`}
          >
            {isSubmitting
              ? 'Submitting...'
              : 'Submit Assessment →'}
          </button>

        </form>
      </div>
    </div>
  )
}

export default AssessmentForm