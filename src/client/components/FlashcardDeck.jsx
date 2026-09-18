import React, { useState, useEffect } from 'react';
import { TbCards, TbRotateDot, TbSparkles } from 'react-icons/tb';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { sounds } from '../utils/sounds.js';

export default function FlashcardDeck({ flashcards, onQuickGenerate }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ mastered: 0, review: 0, needsWork: 0 });

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [flashcards]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !['TEXTAREA', 'INPUT'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        handleFlip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped]);

  const handleFlip = () => {
    sounds.playFlip();
    setIsFlipped(!isFlipped);
  };

  const handleRate = (category) => {
    sounds.playFlip();
    setStats((prev) => ({ ...prev, [category]: prev[category] + 1 }));

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      sounds.playCorrect();
      alert(`🎉 Flashcard Deck Completed!\nMastered: ${stats.mastered + (category === 'mastered' ? 1 : 0)} | Needs Work: ${stats.needsWork + (category === 'needsWork' ? 1 : 0)}`);
    }
  };

  const handleNavigate = (direction) => {
    const newIdx = currentIndex + direction;
    if (newIdx >= 0 && newIdx < flashcards.length) {
      sounds.playFlip();
      setCurrentIndex(newIdx);
      setIsFlipped(false);
    }
  };

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <TbCards size={48} style={{ color: 'var(--accent-cyan)' }} />
        </div>
        <h3>No Flashcards Generated Yet</h3>
        <p>
          Select notes on the left and click <strong>"Generate from Notes"</strong> to extract active-recall cards using Tether's on-device AI.
        </p>
        <button onClick={onQuickGenerate} className="btn-outline btn-sm quick-start-btn">
          <TbSparkles size={14} style={{ marginRight: 6 }} />
          Generate with Sample Notes
        </button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="deck-container">
      <div className="deck-meta">
        <span className="card-counter-badge">
          Card {currentIndex + 1} of {flashcards.length}
        </span>
        <div className="confidence-tracker">
          <span className="conf-dot dot-green" title="Mastered">🟢 {stats.mastered}</span>
          <span className="conf-dot dot-amber" title="Reviewing">🟡 {stats.review}</span>
          <span className="conf-dot dot-red" title="Needs Work">🔴 {stats.needsWork}</span>
        </div>
      </div>

      {/* 3D Flip Card Scene */}
      <div className="card-scene">
        <div
          className={`flashcard-3d ${isFlipped ? 'flipped' : ''}`}
          onClick={handleFlip}
          title="Click to flip card"
        >
          {/* Front Face */}
          <div className="card-face card-front">
            <span className="card-tag">QUESTION</span>
            <div className="card-body">
              <p>{currentCard?.question}</p>
            </div>
            <div className="card-hint">
              <TbRotateDot size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Click card or press <strong>Space</strong> to reveal answer
            </div>
          </div>

          {/* Back Face */}
          <div className="card-face card-back">
            <span className="card-tag tag-answer">ANSWER</span>
            <div className="card-body">
              <p>{currentCard?.answer}</p>
            </div>
            <div className="card-hint">Rate your recall below to advance</div>
          </div>
        </div>
      </div>

      {/* Confidence Rating Buttons */}
      <div className="card-controls">
        <button onClick={() => handleRate('needsWork')} className="btn-rate rate-again">
          <span className="rate-emoji">🔴</span> Again
        </button>
        <button onClick={() => handleRate('review')} className="btn-rate rate-hard">
          <span className="rate-emoji">🟡</span> Hard
        </button>
        <button onClick={() => handleRate('mastered')} className="btn-rate rate-good">
          <span className="rate-emoji">🔵</span> Good
        </button>
        <button onClick={() => handleRate('mastered')} className="btn-rate rate-easy">
          <span className="rate-emoji">🟢</span> Easy
        </button>
      </div>

      {/* Nav Controls */}
      <div className="card-nav">
        <button
          onClick={() => handleNavigate(-1)}
          disabled={currentIndex === 0}
          className="btn-xs btn-ghost"
        >
          <FiChevronLeft size={14} /> Previous
        </button>
        <button onClick={handleFlip} className="btn-xs btn-outline">
          <TbRotateDot size={14} style={{ marginRight: 4 }} /> Flip Card
        </button>
        <button
          onClick={() => handleNavigate(1)}
          disabled={currentIndex === flashcards.length - 1}
          className="btn-xs btn-ghost"
        >
          Next <FiChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
