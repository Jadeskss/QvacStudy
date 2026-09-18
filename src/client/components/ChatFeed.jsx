import React, { useRef, useEffect } from 'react';
import { TbBrain, TbUser, TbCards, TbTarget, TbSparkles } from 'react-icons/tb';
import { FiFileText, FiPlus, FiCheck } from 'react-icons/fi';
import FlashcardDeck from './FlashcardDeck.jsx';
import QuizChallenge from './QuizChallenge.jsx';
import AnswerGrader from './AnswerGrader.jsx';
import ChatInput from './ChatInput.jsx';

export default function ChatFeed({
  messages,
  isStreaming,
  onQuickPrompt,
  onOpenTool,
  onOpenNotesModal,
  onUploadDocument,
  notes,
  input,
  onChangeInput,
  onSend,
  onStop,
  onRegenerateFlashcards,
  onRegenerateQuiz
}) {
  const feedEndRef = useRef(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Clean ChatGPT "Ready when you are." Hero State (when no messages in session yet)
  if (messages.length === 0) {
    return (
      <div className="chat-hero-view">
        <div className="chat-hero-content">
          <h1 className="chat-hero-title">Ready when you are.</h1>

          {/* Centered Hero Input */}
          <div className="hero-input-wrapper">
            <ChatInput
              input={input}
              onChangeInput={onChangeInput}
              onSend={onSend}
              isStreaming={isStreaming}
              onStop={onStop}
              onOpenNotesModal={onOpenNotesModal}
              onOpenTool={onOpenTool}
              onUploadDocument={onUploadDocument}
              isHero={true}
            />
          </div>

          {/* Clean Suggestion Rows matching ChatGPT UI */}
          <div className="chat-hero-suggestions">
            <button
              onClick={onOpenNotesModal}
              className="hero-suggestion-row"
            >
              <FiFileText size={18} className="suggestion-icon" />
              <span>Import PDF, Word doc (.docx), or study notes</span>
            </button>

            <button
              onClick={() => onOpenTool('flashcards')}
              className="hero-suggestion-row"
            >
              <TbCards size={18} className="suggestion-icon" />
              <span>Create flashcards from notes</span>
            </button>

            <button
              onClick={() => onOpenTool('quiz')}
              className="hero-suggestion-row"
            >
              <TbTarget size={18} className="suggestion-icon" />
              <span>Quiz me on key concepts</span>
            </button>

            <button
              onClick={() => onOpenTool('evaluator')}
              className="hero-suggestion-row"
            >
              <TbBrain size={18} className="suggestion-icon" />
              <span>Test active recall (AI grading)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Conversation Stream (when messages exist)
  return (
    <div className="chat-feed-area">
      <div className="chat-messages-container">
        {messages.map((msg, index) => {
          const isLastBot = index === messages.length - 1 && msg.sender === 'bot';
          const isThinking = isStreaming && isLastBot && !msg.text;

          return (
            <div
              key={index}
              className={`chat-message-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}
            >
              {msg.sender === 'bot' && (
                <div className={`chat-avatar bot-avatar ${isThinking ? 'thinking-avatar' : ''}`}>
                  <TbBrain size={18} className={isThinking ? 'brain-pulse-icon' : ''} />
                </div>
              )}

              <div className="chat-bubble-container">
                {/* Thinking Animation (while model computes first tokens) */}
                {isThinking && (
                  <div className="chat-bubble bot-bubble thinking-bubble">
                    <div className="thinking-wrapper">
                      <div className="thinking-dots-wave">
                        <span className="dot dot-1"></span>
                        <span className="dot dot-2"></span>
                        <span className="dot dot-3"></span>
                      </div>
                      <span className="thinking-label">Thinking on-device...</span>
                    </div>
                  </div>
                )}

                {/* Text Content */}
                {msg.text && (
                  <div className={`chat-bubble ${msg.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                    <p style={{ whiteSpace: 'pre-wrap' }}>
                      {msg.text}
                      {isStreaming && isLastBot && <span className="streaming-cursor"></span>}
                    </p>
                  </div>
                )}

                {/* Embedded 3D Flashcards Deck */}
                {msg.widget === 'flashcards' && (
                  <div className="embedded-widget-card">
                    <FlashcardDeck
                      flashcards={msg.data}
                      onQuickGenerate={onRegenerateFlashcards}
                    />
                  </div>
                )}

                {/* Embedded Quiz Challenge */}
                {msg.widget === 'quiz' && (
                  <div className="embedded-widget-card">
                    <QuizChallenge
                      questions={msg.data}
                      onQuickGenerate={onRegenerateQuiz}
                    />
                  </div>
                )}

                {/* Embedded Active-Recall Grader */}
                {msg.widget === 'evaluator' && (
                  <div className="embedded-widget-card">
                    <AnswerGrader
                      promptQuestion={msg.data?.question || 'Summarize the core premise of these study notes.'}
                      expectedContext={notes}
                      onRefreshPrompt={() => {}}
                    />
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="chat-avatar user-avatar">
                  <TbUser size={16} />
                </div>
              )}
            </div>
          );
        })}

        {/* Fallback Thinking Indicator if streaming begins before bot message is inserted */}
        {isStreaming && messages.length > 0 && messages[messages.length - 1]?.sender === 'user' && (
          <div className="chat-message-row bot-row">
            <div className="chat-avatar bot-avatar thinking-avatar">
              <TbBrain size={18} className="brain-pulse-icon" />
            </div>
            <div className="chat-bubble-container">
              <div className="chat-bubble bot-bubble thinking-bubble">
                <div className="thinking-wrapper">
                  <div className="thinking-dots-wave">
                    <span className="dot dot-1"></span>
                    <span className="dot dot-2"></span>
                    <span className="dot dot-3"></span>
                  </div>
                  <span className="thinking-label">Thinking on-device...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={feedEndRef} />
      </div>
    </div>
  );
}
