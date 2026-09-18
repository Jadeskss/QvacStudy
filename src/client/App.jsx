import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar.jsx';
import ChatHeader from './components/ChatHeader.jsx';
import ChatFeed from './components/ChatFeed.jsx';
import ChatInput from './components/ChatInput.jsx';
import DownloadBanner from './components/DownloadBanner.jsx';
import NoteEditorModal from './components/NoteEditorModal.jsx';
import { sounds } from './utils/sounds.js';
import {
  createNewSession,
  loadSessions,
  saveSessions,
  loadActiveSessionId,
  saveActiveSessionId
} from './utils/storage.js';

export default function App() {
  const [sessions, setSessions] = useState(() => loadSessions());
  const [activeSessionId, setActiveSessionId] = useState(() => {
    const initialSessions = loadSessions();
    return loadActiveSessionId(initialSessions);
  });

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  const [selectedModel, setSelectedModel] = useState('QWEN3_600M_INST_Q4');
  const [modelStatus, setModelStatus] = useState(null);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const abortControllerRef = useRef(null);

  // Sync sessions to localStorage whenever sessions change
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Sync activeSessionId to localStorage whenever it changes
  useEffect(() => {
    if (activeSessionId) {
      saveActiveSessionId(activeSessionId);
    }
  }, [activeSessionId]);

  // Initialize model status and SSE connection on mount
  useEffect(() => {
    fetch('/api/status')
      .then((r) => r.json())
      .then((data) => setModelStatus(data.qvac))
      .catch(() => {});

    // SSE connection for model progress
    const eventSource = new EventSource('/api/model/progress');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data) {
          setDownloadProgress(data);
          if (data.stage === 'ready' || data.percentage >= 100) {
            setIsLoadingModel(false);
            setModelStatus((prev) => ({ ...prev, loaded: true }));
          }
        }
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };

    return () => eventSource.close();
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const activeNotes = activeSession?.notes || '';
  const wordCount = activeNotes.trim() ? activeNotes.trim().split(/\s+/).length : 0;

  // Session Handlers
  const handleNewSession = () => {
    const newSession = createNewSession('New Study Session', '', 'Custom Notes');
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (id) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (remaining.length === 0) {
        const fresh = createNewSession('New Study Session', '', 'Custom Notes');
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleRenameSession = (id, newTitle) => {
    if (!newTitle?.trim()) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, title: newTitle.trim(), updatedAt: Date.now() } : s
      )
    );
  };

  const handleUpdateNotes = (newNotes) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        let title = s.title;
        // If session still has the default title, infer from first line/heading
        if (title === 'New Study Session' && newNotes.trim()) {
          const firstLine = newNotes.trim().split('\n')[0].replace(/^#+\s*/, '').trim();
          if (firstLine) {
            title = firstLine.length > 40 ? firstLine.substring(0, 37) + '...' : firstLine;
          }
        }
        return { ...s, notes: newNotes, title, updatedAt: Date.now() };
      })
    );
  };

  const handleUploadSuccess = (title) => {
    const cleanTitle = title.replace(/[-_]/g, ' ');
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: cleanTitle,
              category: 'Uploaded Document',
              messages: [
                {
                  sender: 'bot',
                  text: `📄 Document "${cleanTitle}" loaded into on-device memory! Ask questions, or click Flashcards / Quiz to test your mastery.`
                }
              ]
            }
          : s
      )
    );
  };

  const handleToggleAudio = () => {
    sounds.enabled = !isAudioEnabled;
    setIsAudioEnabled(!isAudioEnabled);
  };

  const handleLoadModel = async () => {
    setIsLoadingModel(true);
    try {
      await fetch('/api/model/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelKey: selectedModel })
      });
    } catch (err) {
      alert('Error triggering model load: ' + err.message);
      setIsLoadingModel(false);
    }
  };

  // Helper to append message to active session
  const appendMessage = (message) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [...s.messages, message] }
          : s
      )
    );
  };

  // Trigger Study Tool (Flashcards, Quiz, Evaluator)
  const handleOpenTool = async (toolType) => {
    if (toolType === 'flashcards') {
      appendMessage({
        sender: 'user',
        text: 'Generate 5 interactive 3D flashcards from my study notes'
      });
      setIsStreaming(true);

      try {
        const res = await fetch('/api/flashcards/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: activeNotes, count: 5 })
        });
        const data = await res.json();
        if (data.success && data.flashcards?.length > 0) {
          appendMessage({
            sender: 'bot',
            text: 'I have extracted 5 active-recall flashcards from your notes. Click the card or press Space to flip:',
            widget: 'flashcards',
            data: data.flashcards
          });
          sounds.playFlip();
        }
      } catch (err) {
        appendMessage({ sender: 'bot', text: 'Error generating flashcards: ' + err.message });
      } finally {
        setIsStreaming(false);
      }
    } else if (toolType === 'quiz') {
      appendMessage({
        sender: 'user',
        text: 'Start a 5-question multiple-choice quiz from my study notes'
      });
      setIsStreaming(true);

      try {
        const res = await fetch('/api/quiz/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: activeNotes, count: 5 })
        });
        const data = await res.json();
        if (data.success && data.questions?.length > 0) {
          appendMessage({
            sender: 'bot',
            text: 'Here is your active-recall quiz challenge based on your notes. Select the best answer for each question:',
            widget: 'quiz',
            data: data.questions
          });
          sounds.playFlip();
        }
      } catch (err) {
        appendMessage({ sender: 'bot', text: 'Error generating quiz: ' + err.message });
      } finally {
        setIsStreaming(false);
      }
    } else if (toolType === 'evaluator') {
      appendMessage({
        sender: 'user',
        text: 'Test my active recall with an open-ended question'
      });
      appendMessage({
        sender: 'bot',
        text: 'Here is an open-ended concept challenge. Type your response in your own words below to get on-device AI scoring:',
        widget: 'evaluator',
        data: {
          question: activeNotes.trim()
            ? 'Explain the key principles and primary concepts from your study notes in your own words.'
            : 'Summarize what you have learned and explain the primary concepts in your own words.'
        }
      });
    }
  };

  // Conversational Send
  const handleSend = async () => {
    const query = input.trim();
    if (!query || isStreaming) return;

    setInput('');

    // Check if user is asking for flashcards or quiz via text
    const lower = query.toLowerCase();
    if (lower.includes('flashcard') || lower.includes('flash card')) {
      handleOpenTool('flashcards');
      return;
    }
    if (lower.includes('quiz') || lower.includes('test me') || lower.includes('multiple choice')) {
      handleOpenTool('quiz');
      return;
    }
    if (lower.includes('active recall') || lower.includes('grade my')) {
      handleOpenTool('evaluator');
      return;
    }

    // Append user message
    appendMessage({ sender: 'user', text: query });
    setIsStreaming(true);

    // Prepare bot streaming message
    appendMessage({ sender: 'bot', text: '' });

    try {
      abortControllerRef.current = new AbortController();

      // Extract prior conversation history for intelligent multi-turn context
      const conversationHistory = (activeSession?.messages || [])
        .filter((m) => m.text && !m.widget)
        .slice(-6)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }));

      const response = await fetch('/api/tutor/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          notes: activeNotes,
          question: query,
          history: conversationHistory
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.token) {
                accumulated += data.token;
                setSessions((prev) =>
                  prev.map((s) => {
                    if (s.id !== activeSessionId) return s;
                    const msgs = [...s.messages];
                    msgs[msgs.length - 1] = { sender: 'bot', text: accumulated };
                    return { ...s, messages: msgs };
                  })
                );
              }
            } catch (err) {
              // Ignore non-json chunks
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== activeSessionId) return s;
            const msgs = [...s.messages];
            msgs[msgs.length - 1] = {
              sender: 'bot',
              text: 'Error streaming from on-device model: ' + err.message
            };
            return { ...s, messages: msgs };
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  return (
    <div className="chat-layout-root">
      {/* Background ambient glow orbs */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      {/* Left History & Tools Sidebar */}
      {/* Left History & Tools Sidebar (collapsible icon rail or full drawer) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onOpenTool={handleOpenTool}
        onOpenNotesModal={() => setIsNotesModalOpen(true)}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        onLoadModel={handleLoadModel}
        isLoadingModel={isLoadingModel}
        modelStatus={modelStatus}
      />

      {/* Main Chat Interface */}
      <main className="chat-main-container">
        {/* Top Navbar */}
        <ChatHeader
          sessionTitle={activeSession?.title || 'Study Session'}
          notesWordCount={wordCount}
          onRenameSession={(title) => handleRenameSession(activeSessionId, title)}
          onOpenNotesModal={() => setIsNotesModalOpen(true)}
          onOpenTool={handleOpenTool}
          onNewSession={handleNewSession}
          isAudioEnabled={isAudioEnabled}
          onToggleAudio={handleToggleAudio}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          currentView="chat"
          onSelectView={() => {}}
        />

        {/* Model Download Progress Banner (only shown during active downloads) */}
        <DownloadBanner progress={downloadProgress} />

        {/* Conversation Feed or Ready when you are Hero State */}
        <ChatFeed
          messages={activeSession?.messages || []}
          isStreaming={isStreaming}
          onQuickPrompt={handleOpenTool}
          onOpenTool={handleOpenTool}
          onOpenNotesModal={() => setIsNotesModalOpen(true)}
          onUploadDocument={(text, filename) => {
            handleUploadSuccess(filename.replace(/\.[^/.]+$/, ''));
            handleUpdateNotes(text);
          }}
          notes={activeNotes}
          input={input}
          onChangeInput={setInput}
          onSend={handleSend}
          onStop={handleStopStreaming}
          onRegenerateFlashcards={() => handleOpenTool('flashcards')}
          onRegenerateQuiz={() => handleOpenTool('quiz')}
        />

        {/* Floating Bottom Input Bar (rendered at bottom when conversation is active) */}
        {(activeSession?.messages || []).length > 0 && (
          <div className="chat-bottom-dock">
            <ChatInput
              input={input}
              onChangeInput={setInput}
              onSend={handleSend}
              isStreaming={isStreaming}
              onStop={handleStopStreaming}
              onOpenNotesModal={() => setIsNotesModalOpen(true)}
              onOpenTool={handleOpenTool}
              onUploadDocument={(text, filename) => {
                handleUploadSuccess(filename.replace(/\.[^/.]+$/, ''));
                handleUpdateNotes(text);
              }}
              isHero={false}
            />
          </div>
        )}
      </main>

      {/* Source Note Editor Modal */}
      <NoteEditorModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        notes={activeNotes}
        onChangeNotes={handleUpdateNotes}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
