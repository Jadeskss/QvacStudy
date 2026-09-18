import React, { useState, useEffect } from 'react';
import { FiVolume2, FiVolumeX, FiFileText, FiSidebar, FiEdit3, FiBookOpen, FiCheck } from 'react-icons/fi';
import { TbCards, TbTarget, TbBrain, TbSparkles } from 'react-icons/tb';

export default function ChatHeader({
  sessionTitle,
  notesWordCount,
  onRenameSession,
  onOpenNotesModal,
  onOpenTool,
  onNewSession,
  isAudioEnabled,
  onToggleAudio,
  onToggleSidebar,
  isSidebarOpen,
  currentView,
  onSelectView
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleText, setEditTitleText] = useState(sessionTitle);

  useEffect(() => {
    setEditTitleText(sessionTitle);
  }, [sessionTitle]);

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    if (editTitleText.trim() && editTitleText.trim() !== sessionTitle && onRenameSession) {
      onRenameSession(editTitleText.trim());
    } else {
      setEditTitleText(sessionTitle);
    }
  };

  return (
    <header className="chat-navbar">
      <div className="chat-nav-left">
        <button
          onClick={onToggleSidebar}
          className="icon-btn"
          title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <FiSidebar size={18} />
        </button>

        <button
          onClick={onNewSession}
          className="icon-btn"
          title="New Study Session"
        >
          <FiEdit3 size={17} />
        </button>

        <div className="chat-session-meta">
          {isEditingTitle ? (
            <div className="chat-title-edit-box">
              <input
                type="text"
                className="chat-title-edit-input"
                value={editTitleText}
                onChange={(e) => setEditTitleText(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') {
                    setEditTitleText(sessionTitle);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
              />
              <button onClick={handleSaveTitle} className="chat-title-save-btn" title="Save title">
                <FiCheck size={12} />
              </button>
            </div>
          ) : (
            <div
              className="chat-title-wrapper"
              onClick={() => setIsEditingTitle(true)}
              title="Click to rename topic"
            >
              <h2>{sessionTitle}</h2>
              <FiEdit3 size={12} className="title-edit-hint" />
            </div>
          )}
          <span className="chat-word-count">
            <FiBookOpen size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            {notesWordCount.toLocaleString()} words
          </span>
        </div>
      </div>

      {/* Center Segmented Pill (like ChatGPT [Chat] [+ Work]) */}
      <div className="chat-nav-center">
        <div className="nav-segmented-pill">
          <button
            className={`pill-tab ${currentView === 'chat' ? 'active' : ''}`}
            onClick={() => onSelectView('chat')}
          >
            Chat
          </button>
          <button
            className="pill-tab"
            onClick={() => onOpenTool('flashcards')}
            title="Generate interactive 3D flashcards"
          >
            <TbCards size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Flashcards
          </button>
          <button
            className="pill-tab"
            onClick={() => onOpenTool('quiz')}
            title="Start practice quiz"
          >
            <TbTarget size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Quiz
          </button>
        </div>
      </div>

      <div className="chat-nav-right">
        {/* On-Device Local Badge */}
        <div className="badge-on-device" title="Running 100% locally via Tether QVAC SDK">
          <span className="pulse-dot"></span>
          <span>On-Device</span>
        </div>

        {/* Edit Notes Button */}
        <button
          onClick={onOpenNotesModal}
          className="btn-pill-subtle"
          title="View & Edit Source Notes"
        >
          <FiFileText size={14} />
          <span>Notes</span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={onToggleAudio}
          className="icon-btn"
          title={isAudioEnabled ? 'Mute audio' : 'Enable audio'}
        >
          {isAudioEnabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} style={{ opacity: 0.5 }} />}
        </button>

        {/* User avatar circle */}
        <div className="user-nav-avatar" title="Local Learner">
          <span>AI</span>
        </div>
      </div>
    </header>
  );
}
