import React, { useState, useEffect } from 'react';
import { TbTarget, TbTrophy, TbAward } from 'react-icons/tb';
import { FiCheckCircle, FiXCircle, FiArrowRight, FiRotateCcw, FiZap } from 'react-icons/fi';
import { sounds } from '../utils/sounds.js';

export default function QuizChallenge({ questions, onQuickGenerate }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsCompleted(false);
  }, [questions]);

  if (!questions || questions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <TbTarget size={48} style={{ color: 'var(--accent-purple)' }} />
        </div>
        <h3>No Quiz Generated Yet</h3>
        <p>
          Challenge your mastery with multiple-choice questions extracted directly from your study notes by Tether's on-device model.
        </p>
        <button onClick={onQuickGenerate} className="btn-outline btn-sm quick-start-btn">
          <FiZap size={14} style={{ marginRight: 6 }} />
          Generate Quiz from Sample Notes
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      setScore((s) => s + 1);
      sounds.playCorrect();
    } else {
      sounds.playWrong();
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setIsCompleted(true);
      sounds.playCorrect();
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsCompleted(false);
  };

  if (isCompleted) {
    const total = questions.length;
    const pct = Math.round((score / total) * 100);

    return (
      <div className="quiz-summary">
        <div className="summary-trophy">
          <TbTrophy size={64} style={{ color: 'var(--accent-amber)' }} />
        </div>
        <h2>Quiz Completed!</h2>
        <div className="final-score-circle">
          <span id="finalScorePct">{pct}%</span>
          <span id="finalScoreFraction">{score} / {total} Correct</span>
        </div>
        <p>
          {pct >= 80
            ? '🌟 Outstanding recall! You demonstrated strong mastery of your study notes.'
            : pct >= 60
            ? '👍 Good progress! Reviewing missed topics will reinforce deep memory retention.'
            : '📚 Keep practicing! Re-read your notes and challenge yourself again.'}
        </p>
        <div className="summary-actions">
          <button onClick={handleRetake} className="btn-outline">
            <FiRotateCcw size={14} style={{ marginRight: 6 }} />
            Retake Quiz
          </button>
          <button onClick={onQuickGenerate} className="btn-primary">
            <FiZap size={14} style={{ marginRight: 6 }} />
            Generate Fresh Questions
          </button>
        </div>
      </div>
    );
  }

  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === currentQ?.correctIndex;

  return (
    <div className="quiz-container">
      <div className="quiz-topbar">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <div className="quiz-score-pill">
          <span>Score: <strong>{score}</strong></span>
        </div>
      </div>

      <div className="question-card">
        <h3>{currentQ?.question}</h3>
        <div className="options-list">
          {currentQ?.options?.map((optionText, idx) => {
            let stateClass = '';
            if (isAnswered) {
              if (idx === currentQ.correctIndex) stateClass = 'correct';
              else if (idx === selectedOption) stateClass = 'wrong';
              else stateClass = 'disabled';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`option-btn ${stateClass}`}
                disabled={isAnswered}
              >
                <span className="opt-badge">{['A', 'B', 'C', 'D'][idx]}</span>
                <span>{optionText.replace(/^[A-D]\)\s*/, '')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {isAnswered && (
        <div className="explanation-box">
          <div className="expl-header">
            {isCorrect ? (
              <>
                <FiCheckCircle size={18} style={{ color: 'var(--accent-emerald)' }} />
                <strong style={{ color: 'var(--accent-emerald)' }}>Correct!</strong>
              </>
            ) : (
              <>
                <FiXCircle size={18} style={{ color: 'var(--accent-rose)' }} />
                <strong style={{ color: 'var(--accent-rose)' }}>
                  Incorrect (Option {['A', 'B', 'C', 'D'][currentQ.correctIndex]} is correct)
                </strong>
              </>
            )}
          </div>
          <p id="explContentText">{currentQ.explanation}</p>
          <button onClick={handleNext} className="btn-primary btn-sm">
            <span>Next Question</span>
            <FiArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
