import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaMicrophone, FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const COMMANDS = [
  { keywords: ['home'], description: 'Go to home page', action: 'navigate', value: '/' },
  { keywords: ['about'], description: 'Go to about section', action: 'scroll', value: 'about' },
  { keywords: ['services'], description: 'Go to services page', action: 'navigate', value: '/services' },
  { keywords: ['portfolio', 'projects', 'project'], description: 'Go to portfolio section', action: 'scroll', value: 'portfolio' },
  { keywords: ['contact'], description: 'Go to contact section', action: 'scroll', value: 'contact' },
  { keywords: ['call', 'phone', 'ring'], description: 'Call us', action: 'call' },
  { keywords: ['email', 'mail'], description: 'Email us', action: 'email' },
  { keywords: ['quote', 'inquiry'], description: 'Get a quote', action: 'quote' },
  { keywords: ['top', 'up', 'scroll up'], description: 'Scroll to top', action: 'scrollTop' },
  { keywords: ['back', 'go back'], description: 'Go back', action: 'goBack' },
  { keywords: ['help', 'commands', 'what can you do'], description: 'Show commands', action: 'help' },
]

const RESPONSES = {
  navigate: (page) => `Taking you to the ${page} page.`,
  scroll: (section) => `Scrolling to the ${section} section.`,
  call: 'Opening phone dialer.',
  email: 'Opening email client.',
  quote: 'Opening quote assistant...',
  scrollTop: 'Scrolling to top.',
  goBack: 'Going back.',
  help: "You can say: go to home, about, services, portfolio, contact; call us, email us, get a quote, scroll to top, go back, or search for something.",
  search: (term) => `Searching for ${term}.`,
  unknown: "Sorry, I didn't understand that. Say 'help' to see what I can do.",
}

const CONVO_STEPS = [
  {
    key: 'name',
    prompt: "I'd love to help! May I have your name?",
    retryPrompt: "I didn't quite catch that. Could you please tell me your name?",
    validate: (text) => text.trim().length >= 2,
    extract: (text) => text.trim(),
  },
  {
    key: 'email',
    getPrompt: (data) => `Thanks ${data.name}! What's the best email to reach you?`,
    retryPrompt: "That doesn't look like a valid email. Could you try again with a valid email address?",
    validate: (text) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim()),
    extract: (text) => text.trim().toLowerCase(),
  },
  {
    key: 'message',
    prompt: "Great! Briefly describe your project or what you need help with.",
    retryPrompt: "Could you tell me a bit about your project? Even a brief description helps us understand your needs.",
    validate: (text) => text.trim().length >= 5,
    extract: (text) => text.trim(),
  },
  {
    key: 'phone',
    prompt: "Almost done! Can I get your phone number so we can reach you quickly?",
    retryPrompt: "Could you share your phone number?",
    validate: (text) => text.trim().length >= 6,
    extract: (text) => text.trim(),
  },
]

const CONVO_LABELS = ['Name', 'Email', 'Project', 'Phone']

const VoiceAssistant = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const recognitionRef = useRef(null)
  const recognitionIdRef = useRef(0)
  const chatEndRef = useRef(null)
  const modeRef = useRef('command')

  const speakRef = useRef(null)
  const cmdHandlerRef = useRef(null)
  const convoHandlerRef = useRef(null)
  const startConvoRef = useRef(null)

  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [responseText, setResponseText] = useState('')

  const [mode, setMode] = useState('command')
  const [convoStep, setConvoStep] = useState(0)
  const [convoData, setConvoData] = useState({ name: '', email: '', message: '', phone: '' })
  const [convoHistory, setConvoHistory] = useState([])
  const [retryCount, setRetryCount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTypeInput, setShowTypeInput] = useState(false)
  const [typeInputValue, setTypeInputValue] = useState('')

  const [settings, setSettings] = useState({ phone: '', email: '' })

  const isSupported = typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)

  useEffect(() => {
    axios.get(`/api/settings?_t=${Date.now()}`)
      .then(res => { if (res.data) setSettings(res.data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [convoHistory])

  const speak = useCallback((text) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    window.speechSynthesis.speak(utterance)
  }, [])

  const scrollToSection = useCallback((sectionId) => {
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
      }, 200)
    }
  }, [navigate, location.pathname])

  const submitInquiry = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    const msg = convoData.phone
      ? `[Phone: ${convoData.phone}]\n\n${convoData.message}`
      : convoData.message
    try {
      await axios.post('/api/inquiries', {
        name: convoData.name,
        email: convoData.email,
        subject: 'Quote Request',
        message: msg,
      })
      const successMsg = "Your inquiry has been submitted successfully! We'll get back to you within 24 hours. Thank you!"
      setConvoHistory(prev => [...prev, { role: 'bot', text: successMsg }])
      speak(successMsg)
      setMode('done')
      setTimeout(() => {
        resetConversation()
        close()
      }, 7000)
    } catch {
      const errorMsg = "Sorry, there was an error submitting your inquiry. Please try again."
      setConvoHistory(prev => [...prev, { role: 'bot', text: errorMsg }])
      speak(errorMsg)
      setIsSubmitting(false)
    }
  }, [convoData, speak, isSubmitting])

  const resetConversation = useCallback(() => {
    setMode('command')
    setConvoStep(0)
    setConvoData({ name: '', email: '', message: '', phone: '' })
    setConvoHistory([])
    setRetryCount(0)
    setIsSubmitting(false)
    setShowTypeInput(false)
    setTypeInputValue('')
  }, [])

  const listenNext = useCallback(() => {
    setTimeout(() => {
      if (recognitionRef.current) {
        startListening()
      } else {
        startListening()
      }
    }, 400)
  }, [])

  const handleConvoInput = useCallback((text) => {
    const trimmed = text.trim()
    if (!trimmed) {
      if (retryCount >= 2) {
        setShowTypeInput(true)
        const msg = "I'm having trouble hearing you. Please type your response below."
        setConvoHistory(prev => [...prev, { role: 'bot', text: msg }])
        speak(msg)
      } else {
        setRetryCount(prev => prev + 1)
        const msg = "Sorry, I didn't catch that. Could you please repeat?"
        setConvoHistory(prev => [...prev, { role: 'bot', text: msg }])
        speak(msg)
        listenNext()
      }
      return
    }

    setConvoHistory(prev => [...prev, { role: 'user', text: trimmed }])

    if (convoStep < 4) {
      const step = CONVO_STEPS[convoStep]
      const isValid = step.validate(trimmed)

      if (isValid) {
        const value = step.extract(trimmed)
        const updatedData = { ...convoData, [step.key]: value }
        setConvoData(updatedData)
        setRetryCount(0)
        const nextStep = convoStep + 1
        setConvoStep(nextStep)

        if (nextStep < 4) {
          const stepDef = CONVO_STEPS[nextStep]
          const nextPrompt = stepDef.getPrompt
            ? stepDef.getPrompt(updatedData)
            : stepDef.prompt
          setTimeout(() => {
            setConvoHistory(prev => [...prev, { role: 'bot', text: nextPrompt }])
            speak(nextPrompt)
            listenNext()
          }, 400)
        } else {
          const confirmText =
            `Here's what I have:\n\n` +
            `Name: ${updatedData.name}\n` +
            `Email: ${updatedData.email}\n` +
            `Project: ${updatedData.message}\n` +
            `Phone: ${updatedData.phone || '(not provided)'}\n\n` +
            `Shall I submit this inquiry? Say "yes" to confirm or "no" to start over.`
          setTimeout(() => {
            setConvoHistory(prev => [...prev, { role: 'bot', text: confirmText }])
            speak(confirmText)
            listenNext()
          }, 400)
        }
      } else {
        const newRetry = retryCount + 1
        setRetryCount(newRetry)
        if (newRetry >= 3) {
          setShowTypeInput(true)
          const msg = "I'm having trouble understanding. Please type your response below."
          setConvoHistory(prev => [...prev, { role: 'bot', text: msg }])
          speak(msg)
        } else {
          const msg = step.retryPrompt
          setTimeout(() => {
            setConvoHistory(prev => [...prev, { role: 'bot', text: msg }])
            speak(msg)
            listenNext()
          }, 300)
        }
      }
    } else if (convoStep === 4) {
      const lower = trimmed.toLowerCase()
      if (/^(yes|yeah|yep|sure|submit|confirm|go ahead|correct|right|do it)/.test(lower)) {
        submitInquiry()
      } else if (/^(no|nope|nah|never|start over|go back|restart|restart)/.test(lower)) {
        setConvoHistory(prev => [...prev, { role: 'bot', text: "No problem! Let's start over from the beginning." }])
        speak("No problem! Let's start over from the beginning.")
        setTimeout(() => startConvoRef.current(), 800)
      } else {
        const msg = "Please say 'yes' to submit or 'no' to start over."
        setConvoHistory(prev => [...prev, { role: 'bot', text: msg }])
        speak(msg)
        listenNext()
      }
    }
  }, [convoStep, convoData, retryCount, speak, submitInquiry, listenNext])

  const startConversation = useCallback(() => {
    window.speechSynthesis.cancel()

    setMode('conversation')
    setConvoStep(0)
    setConvoData({ name: '', email: '', message: '', phone: '' })
    setConvoHistory([
      { role: 'bot', text: "Hello! I'm here to help you get a free quote. I'll ask you a few quick questions." },
      { role: 'bot', text: CONVO_STEPS[0].prompt },
    ])
    setRetryCount(0)
    setShowTypeInput(!isSupported)
    setTypeInputValue('')
    setTranscript('')
    setResponseText('')

    if (isSupported) {
      setTimeout(() => {
        speak("Hello! I'm here to help you get a free quote. " + CONVO_STEPS[0].prompt)
        listenNext()
      }, 300)
    }
  }, [isSupported, speak, listenNext])

  const matchCommand = useCallback((text) => {
    const lower = text.toLowerCase().trim()
    if (/^search\s/.test(lower)) {
      const term = lower.replace(/^search\s*(for|about)?\s*/i, '').trim()
      return { action: 'search', value: term }
    }
    for (const cmd of COMMANDS) {
      for (const keyword of cmd.keywords) {
        if (lower.includes(keyword)) return cmd
      }
    }
    return null
  }, [])

  const executeCommand = useCallback((cmd, rawTranscript) => {
    const { action, value } = cmd

    if (action === 'quote') {
      startConversation()
      return
    }

    let response = ''

    if (action === 'search') {
      const term = value || rawTranscript.replace(/search\s*(for|about)?\s*/i, '').trim()
      response = RESPONSES.search(term || '...')
      if (term) navigate(`/search?q=${encodeURIComponent(term)}`)
    } else {
      switch (action) {
        case 'navigate':
          response = RESPONSES.navigate(value)
          navigate(value)
          break
        case 'scroll':
          response = RESPONSES.scroll(value)
          scrollToSection(value)
          break
        case 'call':
          response = RESPONSES.call
          if (settings.phone) window.location.href = `tel:${settings.phone}`
          break
        case 'email':
          response = RESPONSES.email
          if (settings.email) window.location.href = `mailto:${settings.email}`
          break
        case 'scrollTop':
          response = RESPONSES.scrollTop
          window.scrollTo({ top: 0, behavior: 'smooth' })
          break
        case 'goBack':
          response = RESPONSES.goBack
          navigate(-1)
          break
        case 'help':
          response = RESPONSES.help
          break
        default:
          response = RESPONSES.unknown
      }
    }

    setResponseText(response)
    setIsListening(false)
    speak(response)
  }, [navigate, scrollToSection, settings, speak, startConversation])

  const processTranscript = useCallback((text) => {
    setTranscript(text)
    const matched = matchCommand(text)
    if (matched) {
      executeCommand(matched, text)
    } else {
      setResponseText(RESPONSES.unknown)
      setIsListening(false)
      speak(RESPONSES.unknown)
    }
  }, [matchCommand, executeCommand, speak])

  const startListening = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setTranscript('')
    setResponseText('')

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    const currentId = ++recognitionIdRef.current

    recognition.onresult = (event) => {
      if (currentId !== recognitionIdRef.current) return
      const text = event.results[0][0].transcript
      setIsListening(false)
      if (modeRef.current === 'conversation' || modeRef.current === 'done') {
        convoHandlerRef.current(text)
      } else {
        cmdHandlerRef.current(text)
      }
    }

    recognition.onerror = (event) => {
      if (currentId !== recognitionIdRef.current) return
      setIsListening(false)
      if (modeRef.current === 'conversation') {
        convoHandlerRef.current('')
      } else {
        if (event.error === 'no-speech') {
          setResponseText("I didn't hear anything. Try again.")
          speakRef.current("I didn't hear anything. Try again.")
        } else if (event.error === 'not-allowed') {
          setResponseText('Microphone access denied. Please allow microphone permissions.')
        } else {
          setResponseText('An error occurred. Please try again.')
        }
      }
    }

    recognition.onend = () => {
      if (currentId !== recognitionIdRef.current) return
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [isSupported])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  const toggleListening = useCallback(() => {
    isListening ? stopListening() : startListening()
  }, [isListening, startListening, stopListening])

  const handleQuickCommand = useCallback((cmd) => {
    setTranscript(cmd.keywords[0])
    setResponseText('')
    executeCommand(cmd, cmd.keywords[0])
  }, [executeCommand])

  const handleTypeSubmit = useCallback(() => {
    if (!typeInputValue.trim()) return
    const text = typeInputValue.trim()
    setTypeInputValue('')
    setShowTypeInput(false)
    convoHandlerRef.current(text)
  }, [typeInputValue])

  const handleCancelConvo = useCallback(() => {
    stopListening()
    resetConversation()
  }, [stopListening, resetConversation])

  const close = useCallback(() => {
    setIsOpen(false)
    stopListening()
    if (mode === 'conversation' || mode === 'done') {
      resetConversation()
    }
    setTranscript('')
    setResponseText('')
  }, [stopListening, mode, resetConversation])

  speakRef.current = speak
  cmdHandlerRef.current = processTranscript
  convoHandlerRef.current = handleConvoInput
  startConvoRef.current = startConversation

  useEffect(() => {
    const handler = () => {
      setIsOpen(true)
      setTimeout(() => startConvoRef.current(), 300)
    }
    window.addEventListener('openVoiceAssistant', handler)
    return () => window.removeEventListener('openVoiceAssistant', handler)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!isOpen && isListening) stopListening()
  }, [isOpen, isListening, stopListening])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 bg-t-accent hover:bg-t-accent-hover"
        aria-label="Open voice assistant"
      >
        {isSupported ? <FaMicrophone size={22} /> : <FaRobot size={22} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={mode === 'command' ? close : undefined}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={close}
                className="self-end text-gray-400 hover:text-gray-600 transition-colors mb-1"
                aria-label="Close"
              >
                <FaTimes size={18} />
              </button>

              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2">
                  <FaRobot className="text-[#0971C8]" size={24} />
                  <h3 className="text-xl font-extrabold text-[#0971C8]">
                    {mode === 'conversation' || mode === 'done' ? 'Get a Free Quote' : 'Voice Assistant'}
                  </h3>
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  {mode === 'command' && 'Press Ctrl+M \u00B7 Ask me anything'}
                  {mode === 'conversation' && 'Answer a few quick questions'}
                  {mode === 'done' && 'Quote request submitted'}
                </p>
              </div>

              {mode === 'command' && (
                <>
                  {isSupported ? (
                    <>
                      <div className="flex justify-center mb-4">
                        <motion.button
                          onClick={toggleListening}
                          animate={isListening ? { scale: [1, 1.12, 1] } : {}}
                          transition={isListening ? { repeat: Infinity, duration: 1.2 } : {}}
                          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            isListening
                              ? 'bg-red-50 text-red-500 shadow-lg'
                              : 'bg-orange-50 text-[#FF6B35] hover:bg-orange-100'
                          }`}
                        >
                          <FaMicrophone size={30} />
                        </motion.button>
                      </div>

                      <p className="text-center text-gray-700 text-sm font-medium mb-3">
                        {isListening ? 'Listening... Speak now'
                          : transcript ? 'Click the mic to try again'
                          : 'Click the mic and say a command'}
                      </p>

                      {transcript && (
                        <div className="bg-gray-50 rounded-xl p-3 mb-2 text-center">
                          <p className="text-xs text-gray-500">You said:</p>
                          <p className="text-gray-800 font-medium text-sm">&ldquo;{transcript}&rdquo;</p>
                        </div>
                      )}

                      {responseText && (
                        <div className="bg-blue-50 rounded-xl p-3 mb-3 text-center">
                          <p className="text-xs text-blue-500">Assistant:</p>
                          <p className="text-gray-800 text-sm">{responseText}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600 mb-1">
                        Voice control is not supported in this browser.
                      </p>
                      <p className="text-xs text-gray-400">
                        Use Chrome or Edge for voice features, or click commands below.
                      </p>
                    </div>
                  )}

                  {!isListening && !responseText && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2 text-center">
                        {isSupported ? 'Try saying:' : 'Click a command:'}
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {COMMANDS.filter(c => c.action !== 'search').slice(0, 6).map(cmd => (
                          <button
                            key={cmd.keywords[0]}
                            onClick={() => handleQuickCommand(cmd)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors cursor-pointer"
                          >
                            {cmd.description}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {(mode === 'conversation' || mode === 'done') && (
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex-1 overflow-y-auto max-h-[320px] space-y-3 mb-3 px-1">
                    {convoHistory.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-orange-50 text-gray-800 rounded-br-sm'
                              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    {isSubmitting && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-2xl rounded-bl-sm p-3 text-sm text-gray-500">
                          Submitting your inquiry...
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {mode === 'done' && (
                    <div className="text-center py-2">
                      <p className="text-xs text-gray-400">This will close automatically</p>
                    </div>
                  )}

                  {mode === 'conversation' && (
                    <>
                      {convoStep < 4 && (
                        <div className="flex items-center justify-center gap-3 mb-3">
                          {CONVO_LABELS.map((label, i) => (
                            <div key={label} className="flex items-center gap-1">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  i < convoStep
                                    ? 'bg-orange-500'
                                    : i === convoStep
                                    ? 'bg-orange-500 animate-pulse'
                                    : 'bg-gray-300'
                                }`}
                              />
                              <span
                                className={`text-[10px] ${
                                  i === convoStep ? 'text-orange-600 font-medium' : 'text-gray-400'
                                }`}
                              >
                                {label}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {showTypeInput ? (
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={typeInputValue}
                            onChange={e => setTypeInputValue(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleTypeSubmit()}
                            placeholder="Type your response..."
                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
                            autoFocus
                          />
                          <button
                            onClick={handleTypeSubmit}
                            className="px-3 py-2 bg-orange-500 text-white rounded-xl text-sm hover:bg-orange-600 flex items-center gap-1"
                          >
                            <FaPaperPlane size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3 mb-1">
                          {isListening ? (
                            <span className="text-xs text-red-500 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                              Listening...
                            </span>
                          ) : (
                            <button
                              onClick={startListening}
                              className="text-xs text-orange-600 underline"
                            >
                              Click to speak
                            </button>
                          )}
                          {convoStep < 4 && (
                            <>
                              <span className="text-xs text-gray-300">|</span>
                              <button
                                onClick={() => setShowTypeInput(true)}
                                className="text-xs text-gray-500 underline"
                              >
                                Type Instead
                              </button>
                            </>
                          )}
                          <span className="text-xs text-gray-300">|</span>
                          <button
                            onClick={handleCancelConvo}
                            className="text-xs text-red-400 underline"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {convoStep === 4 && !isSubmitting && (
                        <div className="flex gap-3 justify-center mt-2 mb-1">
                          <button
                            onClick={() => convoHandlerRef.current('yes')}
                            className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
                          >
                            Yes, Submit
                          </button>
                          <button
                            onClick={() => convoHandlerRef.current('no')}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                          >
                            Start Over
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default VoiceAssistant
