import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import api from '../../api/api'

function ChatbotWidget({ isOpen, setIsOpen }) {
  const [localOpen, setLocalOpen] = useState(false)

  const isWidgetOpen =
    isOpen !== undefined ? isOpen : localOpen

  const setWidgetOpen =
    setIsOpen !== undefined ? setIsOpen : setLocalOpen

  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: 'Hi! I am your PaceIQ assistant. Ask me anything about your learning pace or how to improve! 🧠⚡',
    },
  ])

  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)

  const simulateStream = (fullText) => {
    let currentText = ''

    const words = String(fullText || '').split(' ')
    let wordIndex = 0

    setMessages((prev) => [
      ...prev,
      {
        from: 'bot',
        text: '',
      },
    ])

    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText +=
          (wordIndex === 0 ? '' : ' ') + words[wordIndex]

        setMessages((prev) => {
          const next = [...prev]

          next[next.length - 1] = {
            from: 'bot',
            text: currentText,
          }

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

    if (!text || isThinking) {
      return
    }

    if (!customText) {
      setInput('')
    }

    setMessages((prev) => [
      ...prev,
      {
        from: 'user',
        text,
      },
    ])

    setIsThinking(true)

    try {
      const token = localStorage.getItem('token')

      if (!token) {
        setIsThinking(false)

        simulateStream(
          'Your session has expired. Please log in again.'
        )

        return
      }

      console.log('Sending chatbot request...')

      const response = await api.post(
        '/chatbot/chat',
        {
          message: text,
        }
      )

      console.log('Chatbot response:', response.data)

      /*
        Axios response structure:

        response.status
        response.data

        NOT:

        response.ok
        response.json()
      */

      if (response.status < 200 || response.status >= 300) {
        throw new Error('Chatbot request failed')
      }

      const data = response.data

      const reply =
        data.reply ||
        data.response ||
        data.message ||
        'Sorry, I could not generate a response.'

      setIsThinking(false)

      simulateStream(reply)
    } catch (error) {
      console.error('Chatbot error:', error)

      setIsThinking(false)

      /*
        If backend returned an error response,
        show the actual backend error in console.
      */

      if (error.response) {
        console.error(
          'Backend status:',
          error.response.status
        )

        console.error(
          'Backend data:',
          error.response.data
        )
      }

      simulateStream(
        'Sorry, I could not connect to the AI assistant. Please try again.'
      )
    }
  }

  const quickReplies = [
    'What does my risk score mean?',
    'How can I improve?',
    'What is Fast Learner?',
  ]

  return (
    <>
      {/* Floating Chat Button */}
      {!isWidgetOpen && (
        <button
          onClick={() => setWidgetOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#9F67FF] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 z-50 border border-white/20"
          aria-label="Open learning assistant"
        >
          <span className="text-2xl">
            💬
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isWidgetOpen && (
        <div
          className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-[#EDE9FE] flex flex-col overflow-hidden z-50 animate-fade-in"
          style={{ height: '450px' }}
        >

          {/* Header */}
          <div className="bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] px-4 py-3 flex items-center justify-between shadow-sm">

            <div className="flex items-center gap-2">

              <span className="text-lg">
                🧠⚡
              </span>

              <div>
                <p className="text-white text-sm font-bold">
                  Learning Assistant
                </p>

                <p className="text-[#EDE9FE] text-xs font-semibold flex items-center gap-1">

                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse"></span>

                  Online

                </p>
              </div>

            </div>

            <button
              onClick={() => setWidgetOpen(false)}
              className="text-white opacity-85 hover:opacity-100 text-lg transition-opacity"
            >
              ✕
            </button>

          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#F5F3FF]">

            {messages.map((msg, index) => (

              <div
                key={index}
                className={`flex ${
                  msg.from === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >

                <div
                  className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.from === 'user'
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] text-white rounded-tr-none'
                      : 'bg-[#EDE9FE] text-[#1E1B4B] rounded-tl-none border border-[#EDE9FE]/50'
                  }`}
                >

                  <ReactMarkdown>
                    {msg.text}
                  </ReactMarkdown>

                </div>

              </div>

            ))}

            {/* Thinking indicator */}
            {isThinking && (

              <div className="flex justify-start items-center gap-2">

                <div className="bg-[#EDE9FE] text-[#1E1B4B] rounded-2xl rounded-tl-none px-4 py-2 border border-[#EDE9FE]/50 shadow-sm flex items-center gap-2">

                  <div className="w-3.5 h-3.5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>

                  <span className="text-xs font-semibold text-[#6B7280]">
                    AI is thinking...
                  </span>

                </div>

              </div>

            )}

          </div>

          {/* Quick Replies */}
          <div className="px-3 py-2 flex gap-2 overflow-x-auto bg-white border-t border-[#EDE9FE] scrollbar-none">

            {quickReplies.map((question, index) => (

              <button
                key={index}
                onClick={() => sendMessage(question)}
                disabled={isThinking}
                className="shrink-0 text-xs border border-[#7C3AED] rounded-full px-3 py-1.5 text-[#7C3AED] hover:bg-[#EDE9FE] active:scale-95 transition-all duration-200 font-semibold disabled:opacity-50"
              >
                {question}
              </button>

            ))}

          </div>

          {/* Input */}
          <div className="px-3 py-3 flex gap-2 bg-white border-t border-[#EDE9FE]">

            <input
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage()
                }
              }}
              placeholder="Type a message..."
              disabled={isThinking}
              className="flex-1 px-4 py-2 rounded-xl border border-[#EDE9FE] text-sm outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#EDE9FE] transition-all bg-white disabled:opacity-50"
            />

            <button
              onClick={() => sendMessage()}
              disabled={isThinking}
              className="bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] text-white px-4 py-2 rounded-xl text-sm font-bold hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isThinking ? '...' : 'Send'}
            </button>

          </div>

        </div>
      )}
    </>
  )
}

export default ChatbotWidget