import React, { useState } from 'react';
import { TbBrain, TbCheck, TbSearch, TbRefresh } from 'react-icons/tb';
import { FiAward, FiSend, FiCheckCircle } from 'react-icons/fi';
import { sounds } from '../utils/sounds.js';

export default function AnswerGrader({ promptQuestion, expectedContext, onRefreshPrompt }) {
  const [userAnswer, setUserAnswer] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) {
      alert('Please type an answer in your own words before submitting.');
      return;
    }

    setIsGrading(true);
    try {
      const res = await fetch('/api/quiz/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: promptQuestion,
          expectedContext: expectedContext.slice(0, 1500),
          userAnswer
        })
      });
      const data = await res.json();
      if (data.success && data.evaluation) {
        setEvaluation(data.evaluation);
        if (data.evaluation.score >= 70) {
          sounds.playCorrect();
        } else {
          sounds.playWrong();
        }
      }
    } catch (err) {
      alert('Grading error: ' + err.message);
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="evaluator-wrapper">
      <div className="eval-prompt-card">
        <div className="eval-header">
          <span className="badge-subtle">
            <FiAward size={12} style={{ marginRight: 4 }} />
            ACTIVE RECALL CHALLENGE
          </span>
          <button
            onClick={onRefreshPrompt}
            className="btn-xs btn-ghost"
            title="Generate a new active-recall question from notes"
          >
            <TbRefresh size={13} style={{ marginRight: 4 }} />
            New Prompt
          </button>
        </div>
        <h3>{promptQuestion}</h3>
      </div>

      <form onSubmit={handleSubmit} className="eval-input-wrap">
        <label htmlFor="evalInput">Your Answer (in your own words):</label>
        <textarea
          id="evalInput"
          rows={5}
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type what you recall from your notes without looking... The on-device Tether model evaluates your comprehension and provides constructive feedback."
        />
        <button
          type="submit"
          disabled={isGrading || !userAnswer.trim()}
          className="btn-primary btn-glow"
        >
          <TbBrain size={18} />
          <span>{isGrading ? 'Evaluating on Device...' : 'Grade Answer with On-Device AI'}</span>
        </button>
      </form>

      {evaluation && (
        <div className="eval-result">
          <div className="result-header">
            <div className="score-dial">
              <span id="evalScoreNumber">{evaluation.score}</span>
              <span className="score-unit">/100</span>
            </div>
            <div className="result-title">
              <h4>{evaluation.verdict}</h4>
              <p>{evaluation.feedback}</p>
            </div>
          </div>

          <div className="key-points-split">
            <div className="point-col covered-col">
              <h5>
                <TbCheck size={14} style={{ color: 'var(--accent-emerald)', marginRight: 4 }} />
                Concepts Nailed
              </h5>
              <ul>
                {evaluation.keyPointsCovered?.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>

            <div className="point-col missed-col">
              <h5>
                <TbSearch size={14} style={{ color: 'var(--accent-amber)', marginRight: 4 }} />
                Concepts to Review
              </h5>
              <ul>
                {evaluation.missedPoints?.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
