import React, { useRef, useEffect } from 'react';
import { FiArrowUp, FiFileText, FiSquare, FiZap } from 'react-icons/fi';
import { TbCards, TbTarget, TbBrain, TbSparkles } from 'react-icons/tb';

export default function ChatInput({
  input,
  onChangeInput,
  onSend,
  isStreaming,
  onStop,
  onOpenNotesModal,
  onQuickChip
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="chat-bottom-wrapper">
      {/* Quick Prompt Chips */}
      <div className="chat-prompt-chips">
        <button
          onClick={() => onQuickChip('Generate 5 interactive 3D flashcards from my notes')}
          className="prompt-chip"
        >
          <TbCards size={13} style={{ color: 'var(--accent-cyan)' }} />
          <span>Flashcards Deck</span>
        </button>

        <button
          onClick={() => onQuickChip('Start a 5-question multiple-choice quiz from my notes')}
          className="prompt-chip"
        >
          <TbTarget size={13} style={{ color: 'var(--accent-purple)' }} />
          <span>Take Quiz</span>
        </button>

        <button
          onClick={() => onQuickChip('Test my active recall with an open-ended question')}
          className="prompt-chip"
        >
          <TbBrain size={13} style={{ color: 'var(--accent-emerald)' }} />
          <span>Grade Recall</span>
        </button>

        <button
          onClick={() => onQuickChip('Explain the most difficult concept using a simple analogy')}
          className="prompt-chip"
        >
          <TbSparkles size={13} style={{ color: 'var(--accent-amber)' }} />
          <span>Explain with Analogy</span>
        </button>
      </div>

      {/* Floating Input Box */}
      <div className="chat-input-box">
        <button
          onClick={onOpenNotesModal}
          className="input-tool-btn"
          title="View, paste, or upload study notes"
        >
          <FiFileText size={18} />
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => onChangeInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your notes, or ask for flashcards / quiz..."
          rows={1}
        />

        {isStreaming ? (
          <button onClick={onStop} className="input-send-btn stop-btn" title="Stop generating">
            <FiSquare size={14} />
          </button>
        ) : (
          <button
            onClick={onSend}
            disabled={!input.trim()}
            className="input-send-btn"
            title="Send prompt to on-device AI (Enter)"
          >
            <FiArrowUp size={18} />
          </button>
        )}
      </div>

      <div className="chat-disclaimer">
        <span>⚡ 100% On-Device AI • Powered by Tether QVAC SDK • Your notes never leave this machine</span>
      </div>
    </div>
  );
}
