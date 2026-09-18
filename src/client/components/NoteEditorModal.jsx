import React from 'react';
import { FiX, FiUploadCloud, FiTrash2, FiCheck, FiBookOpen } from 'react-icons/fi';

export default function NoteEditorModal({
  isOpen,
  onClose,
  notes,
  onChangeNotes,
  sampleNotes,
  selectedSampleId,
  onSelectSample
}) {
  if (!isOpen) return null;

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
  const charCount = notes.length;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChangeNotes(event.target.result || '');
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <FiBookOpen size={20} style={{ color: 'var(--accent-cyan)' }} />
            <h3>Source Study Notes</h3>
          </div>
          <button onClick={onClose} className="icon-btn" title="Close">
            <FiX size={18} />
          </button>
        </div>

        {/* Preset Sample Pills */}
        <div className="modal-presets">
          <span className="preset-label">Sample Topics:</span>
          <div className="preset-pills">
            {sampleNotes.map((sample) => (
              <button
                key={sample.id}
                className={`preset-pill ${selectedSampleId === sample.id ? 'active' : ''}`}
                onClick={() => onSelectSample(sample.id)}
              >
                {sample.title.split('&')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Note Editor Area */}
        <div className="modal-editor-area">
          <textarea
            value={notes}
            onChange={(e) => onChangeNotes(e.target.value)}
            placeholder="Paste your notes, lecture transcript, or textbook summary here..."
            spellCheck="false"
          />
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="modal-footer-stats">
            <span>{wordCount.toLocaleString()} words • {charCount.toLocaleString()} characters</span>
          </div>

          <div className="modal-footer-actions">
            <label htmlFor="modalFileUpload" className="btn-outline btn-sm cursor-pointer">
              <FiUploadCloud size={14} style={{ marginRight: 6 }} />
              <span>Import .txt / .md</span>
              <input
                id="modalFileUpload"
                type="file"
                accept=".txt,.md"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </label>
            <button
              onClick={() => onChangeNotes('')}
              className="btn-ghost btn-sm"
              title="Clear notes"
            >
              <FiTrash2 size={14} style={{ marginRight: 4 }} />
              <span>Clear</span>
            </button>
            <button onClick={onClose} className="btn-primary btn-sm">
              <FiCheck size={14} style={{ marginRight: 4 }} />
              <span>Save & Continue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
