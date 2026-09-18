import React, { useRef, useEffect } from 'react';
import { FiArrowUp, FiPlus, FiSquare, FiFileText } from 'react-icons/fi';
import { TbCards, TbTarget, TbBrain, TbSparkles } from 'react-icons/tb';

export default function ChatInput({
  input,
  onChangeInput,
  onSend,
  isStreaming,
  onStop,
  onOpenNotesModal,
  onOpenTool,
  isHero = false
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className={`chat-input-container ${isHero ? 'is-hero' : ''}`}>
      <div className="chat-pill-input">
        {/* Plus / Add Notes Button (like ChatGPT + button) */}
        <button
          onClick={onOpenNotesModal}
          className="pill-icon-btn plus-btn"
          title="Upload or paste study notes"
        >
          <FiPlus size={18} />
        </button>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => onChangeInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your notes, or quiz me..."
          rows={1}
        />

        {/* Action Controls on Right */}
        <div className="pill-actions-right">
          {/* Quick Flashcards Shortcut */}
          <button
            onClick={() => onOpenTool('flashcards')}
            className="pill-quick-tool-btn"
            title="Generate interactive 3D flashcards from notes"
          >
            <TbCards size={16} />
            <span className="tool-label">Flashcards</span>
          </button>

          {/* Send / Stop Button */}
          {isStreaming ? (
            <button onClick={onStop} className="pill-send-btn stop" title="Stop generating">
              <FiSquare size={13} />
            </button>
          ) : (
            <button
              onClick={onSend}
              disabled={!input.trim()}
              className={`pill-send-btn ${input.trim() ? 'active' : ''}`}
              title="Send (Enter)"
            >
              <FiArrowUp size={16} />
            </button>
          )}
        </div>
      </div>

      {!isHero && (
        <div className="chat-privacy-footer">
          <span>⚡ Tether QVAC On-Device AI • 100% Local Inference • Notes stay on your device</span>
        </div>
      )}
    </div>
  );
}
