import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import DownloadBanner from './components/DownloadBanner.jsx';
import NotesStudio from './components/NotesStudio.jsx';
import FlashcardDeck from './components/FlashcardDeck.jsx';
import QuizChallenge from './components/QuizChallenge.jsx';
import AnswerGrader from './components/AnswerGrader.jsx';
import NotesTutor from './components/NotesTutor.jsx';
import { sounds } from './utils/sounds.js';

import { TbCards, TbTarget, TbBrain, TbMessageChatbot } from 'react-icons/tb';
import { FiExternalLink, FiHeart } from 'react-icons/fi';

export default function App() {
  const [sampleNotes, setSampleNotes] = useState([]);
  const [selectedSampleId, setSelectedSampleId] = useState('');
  const [notes, setNotes] = useState('');

  const [activeTab, setActiveTab] = useState('flashcards');
  const [targetMode, setTargetMode] = useState('flashcards');
  const [itemCount, setItemCount] = useState(5);

  const [flashcards, setFlashcards] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedModel, setSelectedModel] = useState('QWEN3_600M_INST_Q4');
  const [modelStatus, setModelStatus] = useState(null);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);

  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // Load sample notes and status on mount
  useEffect(() => {
    fetch('/api/notes/samples')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.samples?.length > 0) {
          setSampleNotes(data.samples);
          setSelectedSampleId(data.samples[0].id);
          setNotes(data.samples[0].content);
        }
      })
      .catch((err) => console.error('Failed to load sample notes:', err));

    fetch('/api/status')
      .then((r) => r.json())
      .then((data) => {
        setModelStatus(data.qvac);
      })
      .catch(() => {});

    // SSE for download and load progress
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

  const handleSelectSample = (id) => {
    setSelectedSampleId(id);
    const found = sampleNotes.find((s) => s.id === id);
    if (found) {
      setNotes(found.content);
    }
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

  const handleGenerate = async () => {
    if (!notes.trim()) return;

    setIsGenerating(true);
    setActiveTab(targetMode);

    try {
      if (targetMode === 'flashcards') {
        const res = await fetch('/api/flashcards/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes, count: itemCount })
        });
        const data = await res.json();
        if (data.success && data.flashcards?.length > 0) {
          setFlashcards(data.flashcards);
          sounds.playFlip();
        }
      } else if (targetMode === 'quiz') {
        const res = await fetch('/api/quiz/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes, count: itemCount })
        });
        const data = await res.json();
        if (data.success && data.questions?.length > 0) {
          setQuizQuestions(data.questions);
          sounds.playFlip();
        }
      }
    } catch (err) {
      alert('Generation error: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Compute prompt for active recall evaluator based on notes
  const getEvaluatorPrompt = () => {
    if (notes.includes('Coffman')) {
      return 'Explain the four Coffman conditions required for a deadlock to occur in an operating system.';
    } else if (notes.includes('Central Dogma') || notes.includes('Mitochondria')) {
      return 'Explain the Central Dogma of molecular biology and describe replication, transcription, and translation.';
    } else if (notes.includes('Gradient Descent') || notes.includes('Overfitting')) {
      return 'Explain the difference between overfitting and underfitting in Machine Learning, and name two regularization techniques.';
    } else if (notes.includes('Industrial Revolution')) {
      return 'What key inventions and economic factors allowed Great Britain to lead the First Industrial Revolution?';
    }
    return 'Summarize the primary thesis and key points introduced in your study notes.';
  };

  return (
    <div className="app-container">
      {/* Background ambient glow orbs */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>
      <div className="glow-orb orb-3"></div>

      {/* Navigation Header */}
      <Header
        status={modelStatus}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={handleToggleAudio}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        onLoadModel={handleLoadModel}
        isLoadingModel={isLoadingModel}
      />

      {/* Model Download Progress Banner */}
      <DownloadBanner progress={downloadProgress} />

      {/* Main Workspace Split Grid */}
      <main className="main-grid">
        {/* Left Column: Note Studio & Library */}
        <NotesStudio
          notes={notes}
          onChangeNotes={setNotes}
          sampleNotes={sampleNotes}
          selectedSampleId={selectedSampleId}
          onSelectSample={handleSelectSample}
          targetMode={targetMode}
          onChangeTargetMode={setTargetMode}
          itemCount={itemCount}
          onChangeItemCount={setItemCount}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />

        {/* Right Column: Interactive Study Arena */}
        <section className="panel arena-panel">
          <div className="panel-header">
            <div className="mode-tabs">
              <button
                className={`mode-tab ${activeTab === 'flashcards' ? 'active' : ''}`}
                onClick={() => setActiveTab('flashcards')}
              >
                <TbCards size={16} />
                <span>Flashcards</span>
              </button>
              <button
                className={`mode-tab ${activeTab === 'quiz' ? 'active' : ''}`}
                onClick={() => setActiveTab('quiz')}
              >
                <TbTarget size={16} />
                <span>Quiz Mode</span>
              </button>
              <button
                className={`mode-tab ${activeTab === 'evaluator' ? 'active' : ''}`}
                onClick={() => setActiveTab('evaluator')}
              >
                <TbBrain size={16} />
                <span>AI Grader</span>
              </button>
              <button
                className={`mode-tab ${activeTab === 'tutor' ? 'active' : ''}`}
                onClick={() => setActiveTab('tutor')}
              >
                <TbMessageChatbot size={16} />
                <span>Notes Tutor</span>
              </button>
            </div>

            <div className="arena-stats">
              {activeTab === 'flashcards' && <span>{flashcards.length} Cards</span>}
              {activeTab === 'quiz' && <span>{quizQuestions.length} Questions</span>}
            </div>
          </div>

          {/* Arena Views */}
          <div className="arena-body">
            {activeTab === 'flashcards' && (
              <FlashcardDeck
                flashcards={flashcards}
                onQuickGenerate={() => {
                  setTargetMode('flashcards');
                  handleGenerate();
                }}
              />
            )}

            {activeTab === 'quiz' && (
              <QuizChallenge
                questions={quizQuestions}
                onQuickGenerate={() => {
                  setTargetMode('quiz');
                  handleGenerate();
                }}
              />
            )}

            {activeTab === 'evaluator' && (
              <AnswerGrader
                promptQuestion={getEvaluatorPrompt()}
                expectedContext={notes}
                onRefreshPrompt={() => {}}
              />
            )}

            {activeTab === 'tutor' && <NotesTutor notes={notes} />}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-left">
          <span>⚡ Built with <strong><a href="https://qvac.tether.io" target="_blank" rel="noreferrer">Tether QVAC SDK</a></strong></span>
          <span className="divider">•</span>
          <span>Runs locally on your device</span>
          <span className="divider">•</span>
          <span>Open Source MIT</span>
        </div>
        <div className="footer-right">
          <a href="https://github.com/tetherto/qvac" target="_blank" rel="noreferrer" className="footer-link">
            QVAC GitHub <FiExternalLink size={12} style={{ verticalAlign: 'middle' }} />
          </a>
          <a href="https://docs.qvac.tether.io" target="_blank" rel="noreferrer" className="footer-link">
            SDK Docs <FiExternalLink size={12} style={{ verticalAlign: 'middle' }} />
          </a>
        </div>
      </footer>
    </div>
  );
}
