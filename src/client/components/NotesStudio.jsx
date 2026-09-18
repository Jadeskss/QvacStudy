import React from 'react';
import { FiEdit3, FiUploadCloud, FiTrash2, FiZap, FiBookOpen } from 'react-icons/fi';
import { TbCards, TbTarget, TbBrain } from 'react-icons/tb';

export default function NotesStudio({
  notes,
  onChangeNotes,
  sampleNotes,
  selectedSampleId,
  onSelectSample,
  targetMode,
  onChangeTargetMode,
  itemCount,
  onChangeItemCount,
  onGenerate,
  isGenerating
}) {
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
    <section className="panel notes-panel">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <FiEdit3 size={18} style={{ color: 'var(--accent-cyan)' }} />
          <h2>Study Notes Studio</h2>
        </div>
        <div className="panel-tools">
          <label htmlFor="fileUploadInput" className="btn-xs btn-outline cursor-pointer" title="Import notes (.txt / .md)">
            <FiUploadCloud size={13} style={{ marginRight: 4 }} />
            <span>Import File</span>
            <input
              id="fileUploadInput"
              type="file"
              accept=".txt,.md"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </label>
          <button
            onClick={() => onChangeNotes('')}
            className="btn-xs btn-ghost"
            title="Clear notes editor"
          >
            <FiTrash2 size={13} style={{ marginRight: 4 }} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="preset-notes-bar">
        <span className="preset-label">
          <FiBookOpen size={12} style={{ marginRight: 4 }} />
          Sample Topics:
        </span>
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

      {/* Note Editor */}
      <div className="editor-container">
        <textarea
          value={notes}
          onChange={(e) => onChangeNotes(e.target.value)}
          placeholder={`Paste your personal study notes, lecture summaries, or textbook highlights here...

Tip: Select one of the sample topics above to test instantly with zero typing!`}
          spellCheck="false"
        />
        <div className="editor-footer">
          <span>{wordCount.toLocaleString()} words • {charCount.toLocaleString()} characters</span>
          <span className="status-tip">Notes processed 100% on your device</span>
        </div>
      </div>

      {/* Controls & Generate Button */}
      <div className="generation-box">
        <div className="gen-controls">
          <div className="control-group">
            <label htmlFor="itemCountSelect">Count:</label>
            <select
              id="itemCountSelect"
              value={itemCount}
              onChange={(e) => onChangeItemCount(Number(e.target.value))}
            >
              <option value={3}>3 items</option>
              <option value={5}>5 items</option>
              <option value={8}>8 items</option>
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="targetModeSelect">Target:</label>
            <select
              id="targetModeSelect"
              value={targetMode}
              onChange={(e) => onChangeTargetMode(e.target.value)}
            >
              <option value="flashcards">3D Flashcards</option>
              <option value="quiz">Multi-Choice Quiz</option>
              <option value="evaluator">Active Recall Grader</option>
            </select>
          </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating || !notes.trim()}
          className="btn-primary btn-glow"
        >
          <FiZap size={16} className={isGenerating ? 'spin-icon' : ''} />
          <span>{isGenerating ? 'Generating on Device...' : 'Generate from Notes'}</span>
        </button>
      </div>
    </section>
  );
}
