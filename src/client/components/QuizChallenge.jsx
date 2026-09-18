import React, { useState, useEffect } from 'react';
import { TbTarget, TbTrophy, TbSparkles } from 'react-icons/tb';
import { FiCheckCircle, FiXCircle, FiArrowRight, FiRotateCcw, FiZap, FiCheck } from 'react-icons/fi';
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
      <div className="quiz-empty-state">
        <div className="quiz-empty-icon">
          <TbTarget size={36} />
        </div>
        <h4>No Quiz Generated Yet</h4>
        <p>
          Generate a 5-question active-recall challenge based on your current study notes.
        </p>
        {onQuickGenerate && (
          <button onClick={onQuickGenerate} className="btn-quiz-primary">
            <FiZap size={14} />
            <span>Generate 5-Question Quiz</span>
          </button>
        )}
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const total = questions.length;
  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === currentQ?.correctIndex;
  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);

  const handleSelectOption = (idx) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);

    const correct = idx === currentQ.correctIndex;
    if (correct) {
      setScore((s) => s + 1);
      sounds.playCorrect();
    } else {
      sounds.playWrong();
    }
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
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
    const pct = Math.round((score / total) * 100);

    return (
      <div className="quiz-completed-card">
        <div className="quiz-completed-trophy">
          <TbTrophy size={48} />
        </div>
        <h3>Quiz Completed!</h3>
        <div className="quiz-score-badge">
          <span className="score-pct">{pct}%</span>
          <span className="score-fraction">{score} of {total} Correct</span>
        </div>
        <p className="quiz-feedback-text">
          {pct >= 80
            ? 'Outstanding recall! You demonstrated strong mastery of your study notes.'
            : pct >= 60
            ? 'Good progress! Reviewing missed topics will reinforce deep memory retention.'
            : 'Keep practicing! Re-read your notes and challenge yourself again.'}
        </p>
        <div className="quiz-summary-actions">
          <button onClick={handleRetake} className="btn-quiz-ghost">
            <FiRotateCcw size={14} />
            <span>Retake Quiz</span>
          </button>
          {onQuickGenerate && (
            <button onClick={onQuickGenerate} className="btn-quiz-primary">
              <FiZap size={14} />
              <span>Generate Fresh Quiz</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-widget-card">
      {/* Top Meta Bar */}
      <div className="quiz-header">
        <div className="quiz-meta-left">
          <span className="quiz-tag-badge">QUIZ MODE</span>
          <span className="quiz-counter-text">
            Question {currentIndex + 1} of {total}
          </span>
        </div>
        <div className="quiz-meta-right">
          <div className="quiz-score-pill">
            <span>Score: <strong>{score}</strong>/{total}</span>
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="quiz-progress-track">
        <div className="quiz-progress-fill" style={{ width: `${progressPercent}%` }}></div>
      </div>

      {/* Question Prompt */}
      <div className="quiz-question-body">
        <h3 className="quiz-question-title">{currentQ?.question}</h3>

        {/* Options List */}
        <div className="quiz-options-list">
          {currentQ?.options?.map((rawOption, idx) => {
            const cleanText = String(rawOption).replace(/^[A-D][).:\s-]+/i, '').trim();
            const letter = ['A', 'B', 'C', 'D'][idx];

            let stateClass = '';
            if (isAnswered) {
              if (idx === currentQ.correctIndex) stateClass = 'opt-correct';
              else if (idx === selectedOption) stateClass = 'opt-wrong';
              else stateClass = 'opt-disabled';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`quiz-opt-btn ${stateClass}`}
                disabled={isAnswered}
                type="button"
              >
                <span className="quiz-opt-letter">{letter}</span>
                <span className="quiz-opt-text">{cleanText}</span>

                {isAnswered && idx === currentQ.correctIndex && (
                  <span className="quiz-opt-indicator correct" title="Correct Answer">
                    <FiCheck size={14} />
                  </span>
                )}
                {isAnswered && idx === selectedOption && !isCorrect && (
                  <span className="quiz-opt-indicator wrong" title="Your Choice">
                    <FiXCircle size={14} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation Banner & Next Action */}
      {isAnswered && (
        <div className={`quiz-explanation-banner ${isCorrect ? 'banner-correct' : 'banner-wrong'}`}>
          <div className="explanation-header">
            {isCorrect ? (
              <>
                <FiCheckCircle size={16} className="expl-icon correct" />
                <strong>Correct!</strong>
              </>
            ) : (
              <>
                <FiXCircle size={16} className="expl-icon wrong" />
                <strong>
                  Option {['A', 'B', 'C', 'D'][currentQ.correctIndex]} is correct
                </strong>
              </>
            )}
          </div>

          {currentQ.explanation && (
            <p className="explanation-text">{currentQ.explanation}</p>
          )}

          <div className="explanation-footer">
            <button onClick={handleNext} className="btn-quiz-next" type="button">
              <span>{currentIndex < total - 1 ? 'Next Question' : 'View Results'}</span>
              <FiArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
