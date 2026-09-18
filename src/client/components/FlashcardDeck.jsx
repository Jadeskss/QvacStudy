import React, { useState, useEffect } from 'react';
import { TbCards, TbRotateDot } from 'react-icons/tb';
import { FiChevronLeft, FiChevronRight, FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { sounds } from '../utils/sounds.js';

export default function FlashcardDeck({ flashcards, onQuickGenerate }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setStats({ again: 0, hard: 0, good: 0, easy: 0 });
  }, [flashcards]);

  // Spacebar flips card
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !['TEXTAREA', 'INPUT'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        handleFlip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, isFinished]);

  const handleFlip = () => {
    sounds.playFlip();
    setIsFlipped(!isFlipped);
  };

  const handleRate = (rating) => {
    sounds.playFlip();
    setStats((prev) => ({ ...prev, [rating]: prev[rating] + 1 }));

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      sounds.playCorrect();
      setIsFinished(true);
    }
  };

  const handleNavigate = (direction) => {
    const nextIdx = currentIndex + direction;
    if (nextIdx >= 0 && nextIdx < flashcards.length) {
      sounds.playFlip();
      setCurrentIndex(nextIdx);
      setIsFlipped(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setStats({ again: 0, hard: 0, good: 0, easy: 0 });
  };

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="flashcard-empty">
        <TbCards size={36} className="flashcard-empty-icon" />
        <h4>No Flashcards Generated Yet</h4>
        <p>Ask for flashcards or click the button below to generate active-recall cards from your notes.</p>
        {onQuickGenerate && (
          <button onClick={onQuickGenerate} className="btn-solid-white">
            Generate Flashcards
          </button>
        )}
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flashcard-completed">
        <FiCheckCircle size={40} className="completed-icon" />
        <h3>Deck Completed!</h3>
        <p>You reviewed all {flashcards.length} flashcards from your study notes.</p>
        <div className="completed-stats-row">
          <div className="stat-box"><span>{stats.easy}</span><label>Easy</label></div>
          <div className="stat-box"><span>{stats.good}</span><label>Good</label></div>
          <div className="stat-box"><span>{stats.hard}</span><label>Hard</label></div>
          <div className="stat-box"><span>{stats.again}</span><label>Again</label></div>
        </div>
        <button onClick={handleRestart} className="btn-solid-white">
          <FiRotateCcw size={14} style={{ marginRight: 6 }} /> Review Deck Again
        </button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / flashcards.length) * 100);

  return (
    <div className="flashcard-container">
      {/* Top Meta Bar */}
      <div className="flashcard-header">
        <div className="flashcard-title-group">
          <span className="flashcard-badge">FLASHCARDS</span>
          <span className="flashcard-counter">
            Card {currentIndex + 1} of {flashcards.length}
          </span>
        </div>
        <div className="flashcard-progress-track">
          <div className="flashcard-progress-bar" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {/* 3D Flip Card Viewport */}
      <div className="flashcard-viewport" onClick={handleFlip} title="Click to flip (Space)">
        <div className={`flashcard-card ${isFlipped ? 'is-flipped' : ''}`}>
          {/* Front Side: Question */}
          <div className="card-side card-front">
            <div className="side-header">
              <span className="side-label">QUESTION</span>
              <span className="side-tip">Click to flip</span>
            </div>
            <div className="side-content">
              <p>{currentCard?.question}</p>
            </div>
            <div className="side-footer">
              <TbRotateDot size={14} />
              <span>Press Space or click card to reveal answer</span>
            </div>
          </div>

          {/* Back Side: Answer */}
          <div className="card-side card-back">
            <div className="side-header">
              <span className="side-label side-label-answer">ANSWER</span>
              <span className="side-tip">Answer revealed</span>
            </div>
            <div className="side-content">
              <p>{currentCard?.answer}</p>
            </div>
            <div className="side-footer">
              <span>Rate your recall below to advance to next card</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recall Rating Buttons */}
      <div className="flashcard-rating-bar">
        <span className="rating-label">How well did you know this?</span>
        <div className="rating-buttons">
          <button
            onClick={(e) => { e.stopPropagation(); handleRate('again'); }}
            className="btn-rating rate-again"
            title="Repeat this card soon"
          >
            Again
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleRate('hard'); }}
            className="btn-rating rate-hard"
            title="Difficult to recall"
          >
            Hard
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleRate('good'); }}
            className="btn-rating rate-good"
            title="Good recall"
          >
            Good
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleRate('easy'); }}
            className="btn-rating rate-easy"
            title="Perfect recall"
          >
            Easy
          </button>
        </div>
      </div>

      {/* Bottom Navigation Toolbar */}
      <div className="flashcard-navigation">
        <button
          onClick={(e) => { e.stopPropagation(); handleNavigate(-1); }}
          disabled={currentIndex === 0}
          className="btn-nav"
        >
          <FiChevronLeft size={15} />
          <span>Previous</span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); handleFlip(); }}
          className="btn-nav btn-nav-flip"
        >
          <TbRotateDot size={15} />
          <span>{isFlipped ? 'Show Question' : 'Show Answer'}</span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); handleNavigate(1); }}
          disabled={currentIndex === flashcards.length - 1}
          className="btn-nav"
        >
          <span>Next</span>
          <FiChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
