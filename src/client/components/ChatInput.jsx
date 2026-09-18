import React, { useState, useRef, useEffect } from 'react';
import { FiArrowUp, FiPlus, FiSquare, FiPaperclip, FiEdit3 } from 'react-icons/fi';
import { TbCards, TbBooks } from 'react-icons/tb';

export default function ChatInput({
  input,
  onChangeInput,
  onSend,
  isStreaming,
  onStop,
  onOpenNotesModal,
  onOpenTool,
  onUploadDocument,
  isHero = false
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef(null);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Handle direct file selection from computer (PDF, DOCX, DOC, TXT, MD)
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsMenuOpen(false);
    setIsUploading(true);

    try {
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'txt' || ext === 'md') {
        const text = await file.text();
        if (onUploadDocument) onUploadDocument(text, file.name);
      } else if (ext === 'pdf' || ext === 'docx' || ext === 'doc') {
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
              if (onUploadDocument) onUploadDocument(data.text, file.name);
            } else {
              alert(data.error || 'Failed to extract text from document');
            }
          } catch (err) {
            alert('Error parsing document: ' + err.message);
          } finally {
            setIsUploading(false);
          }
        };
        reader.readAsDataURL(file);
        return;
      } else {
        alert('Unsupported file type. Please upload a PDF, Word doc (.docx), TXT, or Markdown file.');
      }
    } catch (err) {
      alert('Error reading file: ' + err.message);
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be re-uploaded if desired
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`chat-input-container ${isHero ? 'is-hero' : ''}`} ref={menuRef}>
      {/* Hidden file input for uploading from computer */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt,.md"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div className="chat-pill-input-wrapper">
        {/* Plus Menu Dropdown Popup */}
        {isMenuOpen && (
          <div className={`plus-menu-dropdown ${isHero ? 'dropdown-down' : 'dropdown-up'}`}>
            {/* Option 1: Add photos & files (Upload from computer) */}
            <button
              className="plus-menu-item"
              onClick={() => {
                setIsMenuOpen(false);
                fileInputRef.current?.click();
              }}
            >
              <div className="menu-item-left">
                <FiPaperclip size={18} className="menu-item-icon" />
                <span className="menu-item-title">Add photos & files</span>
              </div>
              <span className="menu-item-subtitle">Upload from computer</span>
            </button>

            {/* Option 2: Add from library (Browse sample study topics) */}
            <button
              className="plus-menu-item"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenNotesModal();
              }}
            >
              <div className="menu-item-left">
                <TbBooks size={18} className="menu-item-icon" />
                <span className="menu-item-title">Add from library</span>
              </div>
              <span className="menu-item-subtitle">Browse and search your files</span>
            </button>

            {/* Option 3: Paste or edit notes */}
            <button
              className="plus-menu-item"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenNotesModal();
              }}
            >
              <div className="menu-item-left">
                <FiEdit3 size={17} className="menu-item-icon" />
                <span className="menu-item-title">Paste or edit notes</span>
              </div>
              <span className="menu-item-subtitle">Manual text editor</span>
            </button>
          </div>
        )}

        <div className="chat-pill-input">
          {/* Plus / Add Notes Button (like ChatGPT + button) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`pill-icon-btn plus-btn ${isMenuOpen ? 'open' : ''}`}
            title="Attach documents, PDF, or choose from library"
          >
            <FiPlus size={18} />
          </button>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => onChangeInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isUploading ? 'Reading and extracting document on device...' : 'Ask anything or quiz me on your notes...'}
            rows={1}
            disabled={isUploading}
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
                disabled={!input.trim() || isUploading}
                className={`pill-send-btn ${input.trim() && !isUploading ? 'active' : ''}`}
                title="Send (Enter)"
              >
                <FiArrowUp size={16} />
              </button>
            )}
          </div>
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
