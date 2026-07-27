import { useState } from 'react'

const botReplies = (msg) => {
  const t = msg.toLowerCase()
  if (t.includes('risk')) return 'Your risk score shows how likely you are to fall behind academically. A lower score is better. It is calculated based on your attendance, marks, and study hours.'
  if (t.includes('improve') || t.includes('better')) return 'To improve your learning pace: increase study hours, maintain 85%+ attendance, take weekly practice tests, and join a peer study group!'
  if (t.includes('fast')) return 'Fast Learner means you are in the top 25% of students. Keep challenging yourself with advanced topics and help your peers!'
  if (t.includes('slow')) return 'Do not worry! Focus on one subject at a time, visit your professor during office hours, and do daily 25-minute focused study sessions.'
  if (t.includes('cgpa') || t.includes('marks')) return 'To improve your CGPA: solve previous year papers, clear your concepts thoroughly, and revise regularly before exams.'
  if (t.includes('attendance')) return 'Try to maintain at least 85% attendance. Regular presence in class helps you stay on track and avoid missing key concepts.'
  if (t.includes('study')) return 'Aim for 3-4 focused study hours daily. Use the Pomodoro technique: 25 minutes study, 5 minutes break. Avoid distractions during study time.'
  if (t.includes('average')) return 'Average Learner means you are on track but have room to improve. Focus on consistency in attendance and study hours.'
  return 'I can help you understand your learning pace, risk score, and how to improve your academic performance. Feel free to ask anything!'
}

function ChatbotWidget({ isOpen, setIsOpen }) {
  const [localOpen, setLocalOpen] = useState(false)
  const isWidgetOpen = isOpen !== undefined ? isOpen : localOpen
  const setWidgetOpen = setIsOpen !== undefined ? setIsOpen : setLocalOpen

  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I am your PaceIQ assistant. Ask me anything about your learning pace or how to improve! 🧠⚡' }
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)

  const simulateStream = (fullText) => {
    let currentText = ''
    const words = fullText.split(' ')
    let wordIndex = 0

    // Add empty bot message bubble to fill in
    setMessages(prev => [...prev, { from: 'bot', text: '' }])

    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex]
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { from: 'bot', text: currentText }
          return next
        })
        wordIndex++
      } else {
        clearInterval(interval)
      }
    }, 20)
  }

  const sendMessage = async (customText) => {
    const text = (customText || input).trim()
    if (!text) return
    if (!customText) setInput('')

    // Append user message
    setMessages(prev => [...prev, { from: 'user', text }])
    setIsThinking(true)

    try {
      // Load current student stats from localStorage
      const name = localStorage.getItem('paceiq_user_name') || 'Student User'
      const dept = localStorage.getItem('paceiq_user_dept') || 'Computer Science'
      const roll = localStorage.getItem('paceiq_user_roll') || 'PIQ-26-8941'
      const category = localStorage.getItem('paceiq_latest_category') || 'Not Assessed Yet'
      const risk = localStorage.getItem('paceiq_latest_risk') || 'Not Assessed Yet'
      const cgpa = localStorage.getItem('paceiq_latest_cgpa') || 'N/A'
      const attendance = localStorage.getItem('paceiq_latest_attendance') || 'N/A'
      const studyHours = localStorage.getItem('paceiq_latest_study_hours') || 'N/A'
      const attentiveness = localStorage.getItem('paceiq_latest_attentiveness') || 'N/A'
      const assignmentRate = localStorage.getItem('paceiq_latest_assignment_rate') || 'N/A'
      const backlogs = localStorage.getItem('paceiq_latest_backlogs') || 'N/A'

      const systemPrompt = `You are PaceIQ, an encouraging and highly realistic academic AI assistant.
You are helping ${name}, a college student in the ${dept} department (Roll: ${roll}).
Here are the student's latest academic stats:
- Learning Pace Category: ${category}
- Risk Score: ${risk}%
- Latest CGPA: ${cgpa}/10
- Class Attendance: ${attendance}%
- Study Hours/Day: ${studyHours} hrs
- Attentiveness in Class: ${attentiveness}
- Assignment Completion Rate: ${assignmentRate}%
- Active Backlogs/KTs: ${backlogs}

Your goal is to guide this student to optimize their study habits, attendance, and assignment submissions, and help them improve their learning pace (Fast, Average, Slow, Very Slow Learner).
Keep responses concise, friendly, and structured using clean bullet points. Write like a real advisor. Speak directly to ${name}. Never mention Puter, Pollinations, or that you are a model.`;

      // Construct a single unified prompt containing history and system guidelines
      let unifiedPrompt = `${systemPrompt}\n\n`;
      messages.forEach(msg => {
        unifiedPrompt += `${msg.from === 'user' ? 'Student' : 'Assistant'}: ${msg.text}\n`;
      });
      unifiedPrompt += `Student: ${text}\nAssistant:`;

      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(unifiedPrompt)}`);

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const responseText = await response.text();
      setIsThinking(false);
      simulateStream(responseText || "I'm sorry, I couldn't process that response.");
    } catch (error) {
      console.error(error);
      setIsThinking(false);
      // Fallback to local rule engine
      simulateStream(botReplies(text));
    }
  }

  const quickReplies = [
    'What does my risk score mean?',
    'How can I improve?',
    'What is Fast Learner?',
  ]

  return (
    <>
      {!isWidgetOpen && (
        <button
          onClick={() => setWidgetOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#9F67FF] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 z-50 border border-white/20"
          aria-label="Open learning assistant"
        >
          <span className="text-2xl">💬</span>
        </button>
      )}

      {isWidgetOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-[#EDE9FE] flex flex-col overflow-hidden z-50 animate-fade-in"
          style={{ height: '450px' }}>

          {/* Chat Header */}
          <div className="bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧠⚡</span>
              <div>
                <p className="text-white text-sm font-bold">Learning Assistant</p>
                <p className="text-[#EDE9FE] text-xs font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button onClick={() => setWidgetOpen(false)} className="text-white opacity-85 hover:opacity-100 text-lg transition-opacity">✕</button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#F5F3FF]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.from === 'user'
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] text-white rounded-tr-none'
                    : 'bg-[#EDE9FE] text-[#1E1B4B] rounded-tl-none border border-[#EDE9FE]/50'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start items-center gap-2">
                <div className="bg-[#EDE9FE] text-[#1E1B4B] rounded-2xl rounded-tl-none px-4 py-2 border border-[#EDE9FE]/50 shadow-sm flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-semibold text-[#6B7280]">AI is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Replies */}
          <div className="px-3 py-2 flex gap-2 overflow-x-auto bg-white border-t border-[#EDE9FE] scrollbar-none">
            {quickReplies.map((q, i) => (
              <button key={i}
                onClick={() => sendMessage(q)}
                className="shrink-0 text-xs border border-[#7C3AED] rounded-full px-3 py-1.5 text-[#7C3AED] hover:bg-[#EDE9FE] active:scale-95 transition-all duration-200 font-semibold"
              >{q}</button>
            ))}
          </div>

          {/* Input Box */}
          <div className="px-3 py-3 flex gap-2 bg-white border-t border-[#EDE9FE]">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-xl border border-[#EDE9FE] text-sm outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#EDE9FE] transition-all bg-white"
            />
            <button onClick={() => sendMessage()}
              className="bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] text-white px-4 py-2 rounded-xl text-sm font-bold hover:scale-105 active:scale-95 transition-all duration-200"
            >Send</button>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatbotWidget