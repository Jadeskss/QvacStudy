import React, { useState, useRef } from 'react';
import { FiX, FiUploadCloud, FiTrash2, FiCheck, FiBookOpen, FiFile, FiAlertCircle } from 'react-icons/fi';

export default function NoteEditorModal({
  isOpen,
  onClose,
  notes,
  onChangeNotes,
  sampleNotes,
  selectedSampleId,
  onSelectSample,
  onUploadSuccess
}) {
  if (!isOpen) return null;

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
  const charCount = notes.length;

  const processFile = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setUploadError('');

    try {
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'txt' || ext === 'md') {
        const text = await file.text();
        onChangeNotes(text);
        if (onUploadSuccess) onUploadSuccess(file.name.replace(/\.[^/.]+$/, ''));
      } else if (ext === 'pdf' || ext === 'docx' || ext === 'doc') {
        // Convert file to base64 and send to server parser
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64Content = reader.result.split(',')[1];
            const response = await fetch('/api/notes/parse-file', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                filename: file.name,
                contentBase64: base64Content
              })
            });

            const data = await response.json();
            if (data.success && data.text) {
              onChangeNotes(data.text);
              if (onUploadSuccess) onUploadSuccess(file.name.replace(/\.[^/.]+$/, ''));
            } else {
              setUploadError(data.error || 'Failed to extract text from document');
            }
          } catch (err) {
            setUploadError('Network error while parsing document: ' + err.message);
          } finally {
            setIsUploading(false);
          }
        };
        reader.readAsDataURL(file);
        return; // Early return since FileReader is async
      } else {
        setUploadError('Unsupported file type. Please upload PDF, Word (.docx), TXT, or Markdown.');
      }
    } catch (err) {
      setUploadError('Error reading file: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <FiBookOpen size={18} />
            <h3>Source Study Notes</h3>
          </div>
          <button onClick={onClose} className="icon-btn close-btn" title="Close">
            <FiX size={18} />
          </button>
        </div>

        {/* Drag & Drop Upload Zone for PDF, Word Docs, Text */}
        <div
          className={`modal-dropzone ${isDragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,.md"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <div className="dropzone-content">
            <FiUploadCloud size={24} className="dropzone-icon" />
            <div className="dropzone-text">
              <strong>{isUploading ? 'Extracting text from document...' : 'Click to upload or drag & drop PDF / Word doc'}</strong>
              <span>Supports .pdf, .docx, .doc, .txt, .md (Processed 100% locally on your machine)</span>
            </div>
          </div>
        </div>

        {uploadError && (
          <div className="modal-error-banner">
            <FiAlertCircle size={14} />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Preset Sample Notes Row */}
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

        {/* Notes Textarea */}
        <div className="modal-editor-area">
          <textarea
            value={notes}
            onChange={(e) => onChangeNotes(e.target.value)}
            placeholder="Paste your study notes, lecture transcript, syllabus, or extracted text here..."
            spellCheck="false"
          />
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="modal-footer-stats">
            <span>{wordCount.toLocaleString()} words • {charCount.toLocaleString()} characters</span>
          </div>

          <div className="modal-footer-actions">
            <button
              onClick={() => onChangeNotes('')}
              className="btn-modal-ghost"
              title="Clear notes"
            >
              <FiTrash2 size={13} style={{ marginRight: 4 }} />
              <span>Clear</span>
            </button>
            <button onClick={onClose} className="btn-modal-primary">
              <FiCheck size={14} style={{ marginRight: 4 }} />
              <span>Save & Continue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
