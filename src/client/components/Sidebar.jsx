import React from 'react';
import {
  FiPlus,
  FiMessageSquare,
  FiLock,
  FiCpu,
  FiTrash2,
  FiFileText,
  FiRefreshCw,
  FiSidebar,
  FiEdit3
} from 'react-icons/fi';
import { TbBrain, TbCards, TbTarget, TbSparkles } from 'react-icons/tb';

export default function Sidebar({
  isOpen,
  onToggle,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onOpenTool,
  onOpenNotesModal,
  selectedModel,
  onSelectModel,
  onLoadModel,
  isLoadingModel,
  modelStatus
}) {
  // Collapsed icon rail view (like ChatGPT sidebar collapsed state)
  if (!isOpen) {
    return (
      <aside className="chat-sidebar collapsed">
        <div className="sidebar-rail-top">
          <button onClick={onToggle} className="rail-icon-btn brand-btn" title="Open sidebar">
            <TbBrain size={20} />
          </button>
          <button onClick={onNewSession} className="rail-icon-btn" title="New Study Session">
            <FiEdit3 size={17} />
          </button>
          <button
            onClick={() => onOpenTool('flashcards')}
            className="rail-icon-btn"
            title="Generate Flashcards"
          >
            <TbCards size={17} />
          </button>
          <button
            onClick={() => onOpenTool('quiz')}
            className="rail-icon-btn"
            title="Quiz Mode"
          >
            <TbTarget size={17} />
          </button>
          <button
            onClick={onOpenNotesModal}
            className="rail-icon-btn"
            title="Study Notes"
          >
            <FiFileText size={17} />
          </button>
        </div>

        <div className="sidebar-rail-bottom">
          <div className="rail-dot" title="100% On-Device AI • Zero Cloud">
            <span className="pulse-dot"></span>
          </div>
          <div className="rail-user-avatar" title="Local AI Learner">
            <span>AI</span>
          </div>
        </div>
      </aside>
    );
  }

  // Expanded clean sidebar
  return (
    <aside className="chat-sidebar expanded">
      {/* Top Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon-sm">
            <TbBrain size={18} />
          </div>
          <div className="brand-info">
            <h3>QvacStudy</h3>
            <span>On-Device AI</span>
          </div>
        </div>
        <button onClick={onToggle} className="sidebar-toggle-btn" title="Collapse sidebar">
          <FiSidebar size={18} />
        </button>
      </div>

      {/* New Session Button */}
      <button onClick={onNewSession} className="btn-new-chat">
        <FiPlus size={16} />
        <span>New Study Session</span>
      </button>

      {/* Quick Study Tools */}
      <div className="sidebar-section">
        <span className="sidebar-section-title">Study Tools</span>
        <div className="sidebar-tools-grid">
          <button
            onClick={() => onOpenTool('flashcards')}
            className="sidebar-tool-btn"
            title="Generate interactive 3D flashcards"
          >
            <TbCards size={16} />
            <span>Flashcards</span>
          </button>
          <button
            onClick={() => onOpenTool('quiz')}
            className="sidebar-tool-btn"
            title="Start practice quiz"
          >
            <TbTarget size={16} />
            <span>Quiz Mode</span>
          </button>
          <button
            onClick={() => onOpenTool('evaluator')}
            className="sidebar-tool-btn"
            title="Active-recall evaluation"
          >
            <TbBrain size={16} />
            <span>AI Grader</span>
          </button>
          <button
            onClick={onOpenNotesModal}
            className="sidebar-tool-btn"
            title="View or edit notes"
          >
            <FiFileText size={16} />
            <span>View Notes</span>
          </button>
        </div>
      </div>

      {/* History Session List */}
      <div className="sidebar-section history-section">
        <span className="sidebar-section-title">Study History</span>
        <div className="history-list">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`history-item ${activeSessionId === session.id ? 'active' : ''}`}
              onClick={() => onSelectSession(session.id)}
            >
              <FiMessageSquare size={14} className="history-icon" />
              <div className="history-details">
                <span className="history-title">{session.title}</span>
                <span className="history-category">{session.category || 'Notes'}</span>
              </div>
              {sessions.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="history-delete-btn"
                  title="Delete session"
                >
                  <FiTrash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Status & Model */}
      <div className="sidebar-footer">
        <div className="sidebar-privacy">
          <span className="pulse-dot"></span>
          <FiLock size={12} />
          <span>100% On-Device AI • Zero Cloud</span>
        </div>

        <div className="sidebar-model-box">
          <div className="model-selector-row">
            <FiCpu size={13} style={{ color: 'var(--accent-cyan)' }} />
            <select
              value={selectedModel}
              onChange={(e) => onSelectModel(e.target.value)}
              className="sidebar-model-select"
            >
              <option value="QWEN3_600M_INST_Q4">Qwen 3 (600M Q4)</option>
              <option value="LLAMA_3_2_1B_INST_Q4_0">Llama 3.2 (1B Q4)</option>
            </select>
          </div>
          <button
            onClick={onLoadModel}
            disabled={isLoadingModel}
            className="sidebar-reload-btn"
            title="Reload on-device model"
          >
            <FiRefreshCw size={11} className={isLoadingModel ? 'spin-icon' : ''} />
            <span>{isLoadingModel ? 'Loading...' : modelStatus?.loaded ? 'Ready' : 'Load'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
