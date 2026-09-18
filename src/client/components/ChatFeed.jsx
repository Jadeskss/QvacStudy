import React, { useRef, useEffect } from 'react';
import { TbBrain, TbUser, TbCards, TbTarget, TbSparkles } from 'react-icons/tb';
import { FiCopy, FiCheck } from 'react-icons/fi';
import FlashcardDeck from './FlashcardDeck.jsx';
import QuizChallenge from './QuizChallenge.jsx';
import AnswerGrader from './AnswerGrader.jsx';

export default function ChatFeed({
  messages,
  isStreaming,
  onQuickPrompt,
  notes,
  onRegenerateFlashcards,
  onRegenerateQuiz
}) {
  const feedEndRef = useRef(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  return (
    <div className="chat-feed-area">
      {messages.length === 0 ? (
        <div className="chat-welcome-hero">
          <div className="hero-brain-icon">
            <TbBrain size={56} />
          </div>
          <h2>What would you like to master today?</h2>
          <p>
            Your notes are loaded into Tether's <strong>on-device QVAC engine</strong>. Ask questions, generate flashcard decks, or challenge yourself with instant quizzes.
          </p>

          <div className="welcome-prompt-grid">
            <button
              onClick={() => onQuickPrompt('Generate 5 interactive 3D flashcards from my notes')}
              className="welcome-card"
            >
              <div className="welcome-card-icon">
                <TbCards size={22} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <div className="welcome-card-text">
                <strong>Create 3D Flashcards</strong>
                <span>Extract active-recall flashcard deck with flip animation</span>
              </div>
            </button>

            <button
              onClick={() => onQuickPrompt('Start a 5-question multiple-choice quiz from my notes')}
              className="welcome-card"
            >
              <div className="welcome-card-icon">
                <TbTarget size={22} style={{ color: 'var(--accent-purple)' }} />
              </div>
              <div className="welcome-card-text">
                <strong>Start Multi-Choice Quiz</strong>
                <span>Timed test with instant answers & explanations</span>
              </div>
            </button>

            <button
              onClick={() => onQuickPrompt('Test my active recall with an open question')}
              className="welcome-card"
            >
              <div className="welcome-card-icon">
                <TbBrain size={22} style={{ color: 'var(--accent-emerald)' }} />
              </div>
              <div className="welcome-card-text">
                <strong>Test Active Recall</strong>
                <span>Type in your own words; get on-device AI score</span>
              </div>
            </button>

            <button
              onClick={() => onQuickPrompt('Summarize the 3 core principles from my notes')}
              className="welcome-card"
            >
              <div className="welcome-card-icon">
                <TbSparkles size={22} style={{ color: 'var(--accent-amber)' }} />
              </div>
              <div className="welcome-card-text">
                <strong>Summarize Key Concepts</strong>
                <span>Clear, concise synthesis grounded in notes</span>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="chat-messages-list">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}>
              <div className="chat-avatar">
                {msg.sender === 'user' ? <TbUser size={18} /> : <TbBrain size={20} />}
              </div>

              <div className="chat-bubble-container">
                <div className="chat-sender-name">
                  {msg.sender === 'user' ? 'You' : 'QvacStudy AI'}
                  {msg.sender === 'bot' && <span className="local-tag">Local Model</span>}
                </div>

                {/* Text Content */}
                {msg.text && (
                  <div className="chat-text-content">
                    <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                  </div>
                )}

                {/* Embedded Flashcard Deck Widget */}
                {msg.widget === 'flashcards' && (
                  <div className="embedded-widget-card">
                    <FlashcardDeck
                      flashcards={msg.data}
                      onQuickGenerate={onRegenerateFlashcards}
                    />
                  </div>
                )}

                {/* Embedded Quiz Challenge Widget */}
                {msg.widget === 'quiz' && (
                  <div className="embedded-widget-card">
                    <QuizChallenge
                      questions={msg.data}
                      onQuickGenerate={onRegenerateQuiz}
                    />
                  </div>
                )}

                {/* Embedded Active-Recall Grader Widget */}
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
            </div>
          ))}

          {/* Streaming Thinking Indicator */}
          {isStreaming && (
            <div className="chat-message-row bot-row">
              <div className="chat-avatar">
                <TbBrain size={20} className="pulse-icon" />
              </div>
              <div className="chat-bubble-container">
                <div className="chat-sender-name">
                  QvacStudy AI <span className="local-tag">Local Model</span>
                </div>
                <div className="chat-text-content">
                  <span className="streaming-cursor">Thinking on device...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={feedEndRef} />
        </div>
      )}
    </div>
  );
}
