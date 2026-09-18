import React, { useState } from 'react';
import {
  FiPlus,
  FiMessageSquare,
  FiLock,
  FiCpu,
  FiTrash2,
  FiFileText,
  FiRefreshCw,
  FiSidebar,
  FiEdit3,
  FiCheck
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
  onRenameSession,
  onOpenTool,
  onOpenNotesModal,
  selectedModel,
  onSelectModel,
  onLoadModel,
  isLoadingModel,
  modelStatus
}) {
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
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

      {/* History Session List */}
      <div className="sidebar-section history-section">
        <div className="sidebar-section-header">
          <span className="sidebar-section-title">Study History ({sessions.length})</span>
        </div>
        <div className="history-list">
          {sessions.length === 0 ? (
            <div className="history-empty-state">
              <span className="history-empty-text">No study sessions yet</span>
              <button onClick={onNewSession} className="history-empty-btn">
                <FiPlus size={13} />
                <span>New Session</span>
              </button>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`history-item ${activeSessionId === session.id ? 'active' : ''}`}
                onClick={() => onSelectSession(session.id)}
              >
                <FiMessageSquare size={14} className="history-icon" />

                {editingSessionId === session.id ? (
                  <div className="history-edit-box" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      className="history-edit-input"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editingTitle.trim() && onRenameSession) {
                            onRenameSession(session.id, editingTitle.trim());
                          }
                          setEditingSessionId(null);
                        } else if (e.key === 'Escape') {
                          setEditingSessionId(null);
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        if (editingTitle.trim() && onRenameSession) {
                          onRenameSession(session.id, editingTitle.trim());
                        }
                        setEditingSessionId(null);
                      }}
                      className="history-save-btn"
                      title="Save title"
                    >
                      <FiCheck size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="history-details">
                      <span className="history-title">{session.title}</span>
                      <span className="history-category">{session.category || 'Notes'}</span>
                    </div>

                    <div className="history-item-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSessionId(session.id);
                          setEditingTitle(session.title);
                        }}
                        className="history-action-btn"
                        title="Rename session"
                      >
                        <FiEdit3 size={12} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="history-action-btn delete-btn"
                        title="Delete session"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
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
