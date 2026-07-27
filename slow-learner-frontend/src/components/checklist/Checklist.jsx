import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const checklistItems = [
  'Difficulty reading or recognizing words',
  'Trouble with numbers or basic maths',
  'Difficulty focusing for long periods',
  'Trouble following multi-step instructions',
  'Poor short-term memory for lessons',
  'Slow writing speed compared to peers',
  'Anxiety during tests or class participation',
  'Difficulty understanding verbal instructions',
]

function Checklist() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState([])
  const [submitted, setSubmitted] = useState(false)

  const toggle = (item) => {
    setSelected(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    )
  }

  const handleSubmit = () => {
    try {
      const currentChecklists = parseInt(localStorage.getItem('paceiq_checklists_count') || '0')
      localStorage.setItem('paceiq_checklists_count', (currentChecklists + 1).toString())
    } catch (err) {
      console.error(err)
    }
    setSubmitted(true)
    setTimeout(() => navigate('/home'), 2000)
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] animate-fade-in pb-10">

      {/* Header */}
      <div className="bg-white border-b border-[#EDE9FE] px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/home')}
          className="text-[#6B7280] hover:text-[#7C3AED] text-xl font-bold hover:scale-110 active:scale-90 transition-all duration-200"
          aria-label="Go back to home"
        >
          ←
        </button>
        <h2 className="font-bold text-[#1E1B4B]">Learning Difficulty Checklist</h2>
      </div>

      <div className="px-6 py-6 max-w-lg mx-auto">

        <p className="text-sm text-[#6B7280] mb-6">
          Select anything that applies to you. This helps personalize your recommendations.
        </p>

        <div className="space-y-3 mb-8">
          {checklistItems.map((item, i) => (
            <div
              key={i}
              onClick={() => toggle(item)}
              className={`flex items-center gap-3 rounded-2xl p-4 border cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ${
                selected.includes(item)
                  ? 'border-[#7C3AED] bg-[#EDE9FE]'
                  : 'bg-white border-[#EDE9FE] hover:border-[#7C3AED]'
              }`}
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                selected.includes(item)
                  ? 'border-[#7C3AED] bg-[#7C3AED]'
                  : 'border-[#EDE9FE] bg-white'
              }`}>
                {selected.includes(item) && (
                  <span className="text-white text-xs font-bold">✓</span>
                )}
              </div>
              <span className="text-sm font-semibold text-[#1E1B4B]">{item}</span>
            </div>
          ))}
        </div>

        {submitted ? (
          <div className="bg-[#E6F4EA] border border-[#A3E635]/30 rounded-2xl p-5 text-center shadow-sm">
            <p className="text-[#059669] font-bold text-base">✓ Checklist submitted!</p>
            <p className="text-sm text-[#6B7280] mt-1">Redirecting to home...</p>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] text-white font-bold py-4 rounded-2xl text-sm shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Submit Checklist ({selected.length} selected)
          </button>
        )}

      </div>
    </div>
  )
}

export default Checklist