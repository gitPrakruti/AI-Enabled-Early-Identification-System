import { useState } from 'react'
import ReactMarkdown from "react-markdown";


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
    const text = (customText || input).trim();

    if (!text) return;

    if (!customText) setInput("");

    setMessages(prev => [...prev, { from: "user", text }]);

    setIsThinking(true);

    try {

        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://127.0.0.1:8000/chatbot/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: text
                })
            }
        );

        if (!response.ok) {
            throw new Error("Backend error");
        }

        const data = await response.json();

        setIsThinking(false);

        simulateStream(data.reply);

    } catch (error) {

        console.error(error);

        setIsThinking(false);

        simulateStream("Sorry, I couldn't connect to the AI assistant.");

    }
};

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
                  <ReactMarkdown>
  {msg.text}
</ReactMarkdown>
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