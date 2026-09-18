import React from 'react';
import { FiVolume2, FiVolumeX, FiFileText, FiMenu, FiBookOpen } from 'react-icons/fi';
import { TbCards, TbTarget, TbBrain } from 'react-icons/tb';

export default function ChatHeader({
  sessionTitle,
  notesWordCount,
  onOpenNotesModal,
  onOpenTool,
  isAudioEnabled,
  onToggleAudio,
  onToggleSidebar
}) {
  return (
    <header className="chat-navbar">
      <div className="chat-nav-left">
        <button
          onClick={onToggleSidebar}
          className="icon-btn mobile-menu-btn"
          title="Toggle Sidebar"
        >
          <FiMenu size={18} />
        </button>
        <div className="chat-session-meta">
          <h2>{sessionTitle}</h2>
          <span className="chat-word-count">
            <FiBookOpen size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            {notesWordCount.toLocaleString()} words in active notes
          </span>
        </div>
      </div>

      <div className="chat-nav-right">
        {/* Quick Study Action Buttons */}
        <button
          onClick={() => onOpenTool('flashcards')}
          className="btn-xs btn-outline nav-action-btn"
          title="Generate 3D Flashcards"
        >
          <TbCards size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span>Flashcards</span>
        </button>

        <button
          onClick={() => onOpenTool('quiz')}
          className="btn-xs btn-outline nav-action-btn"
          title="Start Multiple-Choice Quiz"
        >
          <TbTarget size={14} style={{ color: 'var(--accent-purple)' }} />
          <span>Quiz</span>
        </button>

        <button
          onClick={onOpenNotesModal}
          className="btn-xs btn-outline nav-action-btn"
          title="View & Edit Source Notes"
        >
          <FiFileText size={14} style={{ color: 'var(--accent-amber)' }} />
          <span>Edit Notes</span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={onToggleAudio}
          className="icon-btn"
          title={isAudioEnabled ? 'Mute sound effects' : 'Enable sound effects'}
        >
          {isAudioEnabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} style={{ opacity: 0.5 }} />}
        </button>
      </div>
    </header>
  );
}
