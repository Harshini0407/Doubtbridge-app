import React, { useState, useRef, useEffect } from 'react';
import { BoardId, ChatMessage, GradeId, InteractionLogEntry, LanguageCode, TextbookCitation } from '../types';
import { findCurriculumChunk, askDoubt, simplifyExplanation, detectLanguage } from '../services/apiService';
import {
  Send,
  Sparkles,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Lightbulb,
  ArrowLeft,
  RotateCcw,
  Languages,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  HelpCircle,
  Share2
} from 'lucide-react';

interface ChatViewProps {
  board: BoardId;
  subject: string;
  grade: GradeId;
  language: LanguageCode;
  initialPrompt?: string | null;
  onBackToSelector: () => void;
  onOpenPracticeWithTopic?: (topic: string) => void;
  onRecordLogEntry: (entry: InteractionLogEntry) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  board,
  subject,
  grade,
  language,
  initialPrompt,
  onBackToSelector,
  onOpenPracticeWithTopic,
  onRecordLogEntry,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const [selectedQuickAction, setSelectedQuickAction] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Initialize with textbook grounded welcome message
  useEffect(() => {
    const welcomeText = language === 'hi'
      ? `नमस्ते! मैं आपका ${board} ${grade} ${subject} का AI डाउट ट्यूटर हूँ। अपने पाठ्यपुस्तक से कोई भी सवाल या संदेह पूछें। मैं आपको सरल चरणों में समझाऊंगा!`
      : language === 'te'
      ? `నమస్తే! నేను మీ ${board} ${grade} ${subject} కొరకు AI డౌట్ ట్యూటర్‌ని. మీ పాఠ్యపుస్తకం నుండి ఏదైనా ప్రశ్న లేదా సందేహం అడగండి. నేను మీకు సులభమైన దశల్లో వివరిస్తాను!`
      : `Hi! I'm your DoubtBridge tutor for ${board} · ${subject} · ${grade}. Every answer is grounded directly in your syllabus and textbook. Ask me anything — no doubt is too basic!`;

    const initialMsg: ChatMessage = {
      id: 'welcome-msg',
      role: 'assistant',
      content: welcomeText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citation: {
        textbook: `${board} ${subject} — ${grade}`,
        chapter: 'Open Secondary Textbook Curriculum',
        section: 'Verified Knowledge Base',
      },
      suggestedQuestions: [
        'How do I solve step-by-step questions on this chapter?',
        'Can you explain the main formula with a real-life analogy?',
        'Give me a practice problem to test my understanding.',
      ],
    };

    setMessages([initialMsg]);

    // If an initial prompt was passed from selector, send it automatically
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
    }
  }, [board, subject, grade, language]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Voice speech synthesis
  const handleSpeak = (messageId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeakingId === messageId) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (language === 'hi') utterance.lang = 'hi-IN';
    else if (language === 'te') utterance.lang = 'te-IN';
    else utterance.lang = 'en-IN';

    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeakingId(null);
    utterance.onerror = () => setIsSpeakingId(null);

    setIsSpeakingId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  // Voice Speech Recognition (Mic Input)
  const toggleListening = () => {
    if (isListening) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your current browser. Please type your doubt.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition init error:', err);
      setIsListening(false);
    }
  };

  // Submit Doubt Question
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    // Retrieve verified textbook chunk for this board + subject + grade
    const matchedChunk = findCurriculumChunk(board, subject, grade, query);
    const langDetect = detectLanguage(query);
    const activeLang = language !== 'en' ? language : langDetect.code;

    try {
      const result = await askDoubt({
        board,
        subject,
        grade,
        question: query,
        language: activeLang,
        matchedChunk,
      });

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: result.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citation: result.source || (matchedChunk ? {
          textbook: matchedChunk.textbook,
          chapter: matchedChunk.chapter,
          section: matchedChunk.section,
        } : undefined),
        notFound: result.notFound,
        language: activeLang,
        helpful: null,
        suggestedQuestions: [
          'Can you explain this with a real-life analogy?',
          'Give me a practice problem to test this concept.',
          'Summarize the 3 key takeaways in bullet points.',
        ],
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Record interaction log entry
      onRecordLogEntry({
        id: `log-${Date.now()}`,
        studentId: 'student_active',
        board,
        subject,
        grade,
        topic: matchedChunk ? `${matchedChunk.chapter} · ${matchedChunk.section}` : `${subject} Query`,
        question: query,
        language: activeLang,
        timestamp: new Date().toISOString(),
        helpful: null,
      });
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "I ran into a temporary connection issue. Don't worry, keep asking or try rephrasing your doubt!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Feedback thumb click
  const handleFeedback = (messageId: string, isHelpful: boolean) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, helpful: isHelpful } : msg))
    );
  };

  // Request Simpler Explanation
  const handleExplainSimpler = async (originalText: string, chapterTitle?: string) => {
    setIsLoading(true);
    try {
      const simple = await simplifyExplanation({
        topic: chapterTitle || subject,
        originalExplanation: originalText,
        language,
      });

      const simpleMsg: ChatMessage = {
        id: `simple-${Date.now()}`,
        role: 'assistant',
        content: `**💡 Super Simple Everyday Analogy:**\n\n${simple}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: [
          'Give me a practice question to test if I got it!',
          'What is the common mistake students make here?',
        ],
      };
      setMessages((prev) => [...prev, simpleMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto bg-[#FFF6E9] border-x border-[#E3D6BC] shadow-xl relative">
      {/* Top Chat Subheader */}
      <div className="bg-[#221631] text-[#FFF6E9] px-4 py-3 border-b border-[#3C1F4D] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBackToSelector}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#FFF6E9] transition"
            title="Change curriculum or grade"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-white">
                {subject} Doubt Room
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FFB937]/20 text-[#FFB937] border border-[#FFB937]/30">
                {board} · {grade}
              </span>
            </div>
            <p className="text-[11px] text-[#D9C9E6] hidden sm:block">
              Answers grounded in official textbook corpus with source citations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPracticeWithTopic && (
            <button
              type="button"
              onClick={() => onOpenPracticeWithTopic(subject)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#FF5F4E] hover:bg-[#FF5F4E]/90 text-white transition flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Practice Mode</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5 animate-fadeIn`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#1B1330] text-[#FFF6E9] rounded-tr-sm'
                    : msg.notFound
                    ? 'bg-[#FFF9F0] border border-[#F0DDBA] text-[#1B1330] rounded-tl-sm'
                    : msg.error
                    ? 'bg-[#FFF3F1] border border-[#F5C9C2] text-[#1B1330] rounded-tl-sm'
                    : 'bg-white border border-[#E3D6BC] text-[#1B1330] rounded-tl-sm'
                }`}
              >
                {/* AI Avatar badge */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#E3D6BC]/50">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#8A7A5C]">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#FF5F4E] to-[#FFB937]" />
                      <span>DoubtBridge AI Tutor</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSpeak(msg.id, msg.content)}
                      className={`p-1 rounded text-xs transition ${
                        isSpeakingId === msg.id ? 'text-[#FF5F4E] bg-[#FF5F4E]/10' : 'text-[#8A7A5C] hover:text-[#1B1330]'
                      }`}
                      title={isSpeakingId === msg.id ? 'Stop audio' : 'Read explanation aloud'}
                    >
                      {isSpeakingId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-wrap font-normal">{msg.content}</div>

                {/* Grounded Citation Badge */}
                {msg.citation && (
                  <div className="mt-3 pt-2.5 border-t border-[#E3D6BC] flex items-start gap-2 bg-[#F3ECDD]/80 p-2.5 rounded-xl text-xs text-[#5A4E38]">
                    <BookOpen className="w-4 h-4 text-[#2E8B6F] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-[#1B1330]">{msg.citation.textbook}</div>
                      <div className="text-[11px] text-[#8A7A5C]">
                        {msg.citation.chapter} · {msg.citation.section}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Action helpers */}
                {!isUser && !msg.notFound && !msg.error && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-[#E3D6BC]/60 text-xs">
                    <button
                      type="button"
                      onClick={() => handleExplainSimpler(msg.content, msg.citation?.chapter)}
                      className="px-2.5 py-1 rounded-lg bg-[#FFF9F0] hover:bg-[#F3ECDD] border border-[#E3D6BC] text-[#8A7A5C] font-semibold flex items-center gap-1 transition"
                    >
                      <Lightbulb className="w-3 h-3 text-[#FFB937]" />
                      <span>Explain simpler with analogy</span>
                    </button>

                    {onOpenPracticeWithTopic && (
                      <button
                        type="button"
                        onClick={() => onOpenPracticeWithTopic(subject)}
                        className="px-2.5 py-1 rounded-lg bg-[#FFF9F0] hover:bg-[#F3ECDD] border border-[#E3D6BC] text-[#8A7A5C] font-semibold flex items-center gap-1 transition"
                      >
                        <FileQuestion className="w-3 h-3 text-[#FF5F4E]" />
                        <span>Test with Quiz</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Feedback Row & Timestamp */}
              <div className="flex items-center gap-2 px-1 text-[11px] text-[#8A7A5C]">
                <span>{msg.timestamp}</span>

                {!isUser && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <span className="text-[10px]">Helpful?</span>
                    <button
                      type="button"
                      disabled={msg.helpful !== null}
                      onClick={() => handleFeedback(msg.id, true)}
                      className={`p-1 rounded hover:text-[#2E8B6F] transition ${
                        msg.helpful === true ? 'text-[#2E8B6F] font-bold bg-[#2E8B6F]/10' : ''
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={msg.helpful !== null}
                      onClick={() => handleFeedback(msg.id, false)}
                      className={`p-1 rounded hover:text-[#FF5F4E] transition ${
                        msg.helpful === false ? 'text-[#FF5F4E] font-bold bg-[#FF5F4E]/10' : ''
                      }`}
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                    {msg.helpful !== null && (
                      <span className="text-[10px] text-[#2E8B6F] font-semibold ml-1">Thanks for feedback!</span>
                    )}
                  </div>
                )}
              </div>

              {/* Suggested Follow-up chips */}
              {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 max-w-[85%]">
                  {msg.suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(q)}
                      className="text-xs text-left bg-white hover:bg-[#FFF9F0] text-[#5A4E38] border border-[#E3D6BC] px-2.5 py-1 rounded-full transition shadow-2xs hover:border-[#FF5F4E]"
                    >
                      💬 {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-white border border-[#E3D6BC] rounded-2xl max-w-xs shadow-sm">
            <div className="w-4 h-4 rounded-full bg-[#FF5F4E] animate-ping" />
            <div className="text-xs text-[#8A7A5C] font-semibold flex items-center gap-1">
              <span>Grounding explanation in {board} {subject} textbook…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer Area */}
      <div className="p-3 sm:p-4 bg-white border-t border-[#E3D6BC]">
        <div className="flex items-end gap-2 bg-[#FFF6E9] border-2 border-[#E3D6BC] focus-within:border-[#FF5F4E] rounded-2xl p-2 transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              language === 'hi'
                ? 'अपना प्रश्न यहाँ हिंदी या इंग्लिश में टाइप करें...'
                : language === 'te'
                ? 'మీ ప్రశ్నను ఇక్కడ తెలుగు లేదా ఇంగ్లీషులో టైప్ చేయండి...'
                : `Ask your ${subject} doubt in English, हिंदी, or తెలుగు…`
            }
            className="flex-1 bg-transparent text-sm text-[#1B1330] placeholder-[#8A7A5C] resize-none focus:outline-none px-2 py-1 max-h-32"
          />

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? 'Stop listening' : 'Speak your doubt'}
            className={`p-2.5 rounded-xl transition ${
              isListening
                ? 'bg-[#FF5F4E] text-white animate-pulse'
                : 'bg-[#EADFC9] hover:bg-[#E3D6BC] text-[#8A7A5C]'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send Button */}
          <button
            id="send-doubt-btn"
            type="button"
            disabled={!input.trim() || isLoading}
            onClick={() => handleSendMessage()}
            className={`p-2.5 rounded-xl transition-all ${
              input.trim() && !isLoading
                ? 'bg-gradient-to-r from-[#FF5F4E] to-[#FFB937] text-[#1B1330] cursor-pointer shadow-md active:scale-95'
                : 'bg-[#EADFC9] text-[#B7A886] cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#8A7A5C] mt-2 px-1">
          <span>Press Enter to send. Supports English, Hindi, and Telugu.</span>
          <span className="hidden sm:inline">Secondary Curriculum Grounding</span>
        </div>
      </div>
    </div>
  );
};
