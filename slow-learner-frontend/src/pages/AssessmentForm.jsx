import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'
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

    // Convert CGPA / 10 into percentage
    // Example: 8.5 → 85
    const prevGradePercent = prevGradeVal * 10

    const attendanceVal = parseFloat(form.attendance || 0)
    const studyHoursVal = parseFloat(form.studyHours || 0)

    // Payload sent to FastAPI
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

      // Stored in database for future use.
      // These values are NOT used for the ML prediction.
      difficulty_checklist: [
        String(form.diffReading),
        String(form.diffMaths),
        String(form.diffFocusing),
        String(form.diffInstructions),
        String(form.diffMemory),
        String(form.diffWriting),
        String(form.diffAnxiety),
        String(form.diffVerbal),
      ],
    }

    const submitData = async () => {
      try {
        // --------------------------------------------------
        // 1. CHECK JWT TOKEN
        // --------------------------------------------------

        const token = localStorage.getItem('token')

        if (!token) {
          setIsSubmitting(false)
          navigate('/login')
          return
        }

        // --------------------------------------------------
        // 2. SEND ASSESSMENT TO BACKEND
        // --------------------------------------------------

        const response = await api.post(
          '/assessment/submit',
          payload
        )

        // Axios response data
        const data = response.data

        console.log('Assessment response:', data)

        // --------------------------------------------------
        // 3. GET PREDICTION RESULT
        // --------------------------------------------------

        const finalCategory =
          data.prediction || 'Unknown'

        const finalRisk =
          data.risk_score ?? 0

        const confidenceValue =
          data.confidence ?? 0

        const confidenceScore =
          confidenceValue <= 1
            ? Math.round(confidenceValue * 100)
            : Math.round(confidenceValue)

        // --------------------------------------------------
        // 4. SAVE ASSESSMENT DATA LOCALLY
        // --------------------------------------------------

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
            (
              currentAssessments + 1
            ).toString()
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

          // --------------------------------------------------
          // 5. SAVE ASSESSMENT HISTORY
          // --------------------------------------------------

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

          // Keep only latest 10 assessments
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

        // --------------------------------------------------
        // 6. STOP SUBMITTING STATE
        // --------------------------------------------------

        setIsSubmitting(false)

        // --------------------------------------------------
        // 7. NAVIGATE TO RESULT PAGE
        // --------------------------------------------------

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

        // --------------------------------------------------
        // 8. HANDLE UNAUTHORIZED
        // --------------------------------------------------

        if (err.response?.status === 401) {
          localStorage.removeItem('token')

          alert(
            'Your session has expired. Please login again.'
          )

          navigate('/login')
          return
        }

        // --------------------------------------------------
        // 9. HANDLE BACKEND ERROR
        // --------------------------------------------------

        const backendError =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          'Unable to submit assessment.'

        console.error(
          'Backend response:',
          err.response?.data
        )

        let errorMessage = 'Unable to submit assessment.'

        if (typeof backendError === 'string') {
          errorMessage = backendError
        } else {
          errorMessage = JSON.stringify(
            backendError
          )
        }

        alert(errorMessage)
      }
    }

    submitData()
  }

  // --------------------------------------------------
  // FORM COMPLETION
  // --------------------------------------------------

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

  // --------------------------------------------------
  // CHECKLIST ITEMS
  // --------------------------------------------------

  const checklistItems = [
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
  ]

  return (
    <div className="min-h-screen bg-[#F5F3FF] dark:bg-[#0B0F19] pb-10 animate-fade-in transition-colors duration-200">

      {/* --------------------------------------------------
          HEADER
      -------------------------------------------------- */}

      <div className="bg-white dark:bg-[#161B26] border-b border-[#EDE9FE] dark:border-[#1F2937] px-6 py-4 flex items-center gap-3">

        <button
          type="button"
          onClick={() => navigate('/home')}
          className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#7C3AED] text-xl font-bold"
        >
          ←
        </button>

        <h2 className="font-bold text-[#1E1B4B] dark:text-[#F3F4F6]">
          Learning Assessment
        </h2>

      </div>

      {/* --------------------------------------------------
          PROGRESS BAR + CHATBOT
      -------------------------------------------------- */}

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

      {/* --------------------------------------------------
          FORM
      -------------------------------------------------- */}

      <div className="px-6 max-w-lg mx-auto">

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* --------------------------------------------------
              PREVIOUS GRADE
          -------------------------------------------------- */}

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

          {/* --------------------------------------------------
              ATTENDANCE
          -------------------------------------------------- */}

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
                    attendance: parseInt(
                      e.target.value
                    ),
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

          {/* --------------------------------------------------
              STUDY HOURS
          -------------------------------------------------- */}

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

          {/* --------------------------------------------------
              PARENTAL SUPPORT
          -------------------------------------------------- */}

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

              <option value="high">
                High
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="low">
                Low
              </option>

            </select>

          </div>

          {/* --------------------------------------------------
              ONLINE CLASSES
          -------------------------------------------------- */}

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

              <option value="yes">
                Yes
              </option>

              <option value="no">
                No
              </option>

            </select>

          </div>

          {/* --------------------------------------------------
              LEARNING DIFFICULTIES CHECKLIST
          -------------------------------------------------- */}

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

              {checklistItems.map((item) => (

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
                        [item.key]:
                          e.target.checked,
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

          {/* --------------------------------------------------
              SUBMIT BUTTON
          -------------------------------------------------- */}

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