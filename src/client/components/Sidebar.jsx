import React from 'react';
import {
  FiPlus,
  FiMessageSquare,
  FiLock,
  FiCpu,
  FiTrash2,
  FiFileText,
  FiRefreshCw
} from 'react-icons/fi';
import { TbBrain, TbCards, TbTarget, TbSparkles } from 'react-icons/tb';

export default function Sidebar({
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
  return (
    <aside className="chat-sidebar">
      {/* Top Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon-sm">
          <TbBrain size={20} />
        </div>
        <div className="brand-info">
          <h3>QvacStudy <span className="badge-accent-sm">AI</span></h3>
          <span>On-Device • Tether QVAC</span>
        </div>
      </div>

      {/* New Session Button */}
      <button onClick={onNewSession} className="btn-new-chat">
        <FiPlus size={16} />
        <span>New Study Session</span>
      </button>

      {/* Quick Study Tools Navigation */}
      <div className="sidebar-section">
        <span className="sidebar-section-title">Study Tools</span>
        <div className="sidebar-tools-grid">
          <button
            onClick={() => onOpenTool('flashcards')}
            className="sidebar-tool-btn"
            title="Generate interactive 3D flashcards from current notes"
          >
            <TbCards size={16} style={{ color: 'var(--accent-cyan)' }} />
            <span>Flashcards</span>
          </button>
          <button
            onClick={() => onOpenTool('quiz')}
            className="sidebar-tool-btn"
            title="Generate multiple-choice quiz from current notes"
          >
            <TbTarget size={16} style={{ color: 'var(--accent-purple)' }} />
            <span>Quiz Mode</span>
          </button>
          <button
            onClick={() => onOpenTool('evaluator')}
            className="sidebar-tool-btn"
            title="Test active recall and get AI grading"
          >
            <TbBrain size={16} style={{ color: 'var(--accent-emerald)' }} />
            <span>AI Grader</span>
          </button>
          <button
            onClick={onOpenNotesModal}
            className="sidebar-tool-btn"
            title="View or edit source study notes"
          >
            <FiFileText size={16} style={{ color: 'var(--accent-amber)' }} />
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
                  <FiTrash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Status & Model Pill */}
      <div className="sidebar-footer">
        <div className="sidebar-privacy" title="All inference runs on-device. Zero cloud API calls.">
          <span className="pulse-dot"></span>
          <FiLock size={12} />
          <span>100% On-Device AI</span>
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
            <span>{isLoadingModel ? 'Loading...' : modelStatus?.loaded ? 'Loaded' : 'Load Model'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
