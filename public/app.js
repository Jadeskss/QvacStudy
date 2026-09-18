/**
 * QvacStudy Client Application
 * Interacts with local Node.js backend powered by Tether QVAC SDK
 */

// Sound Effects via Web Audio API (No external sound files needed)
class SoundManager {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  _init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playFlip() {
    if (!this.enabled) return;
    this._init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playCorrect() {
    if (!this.enabled) return;
    this._init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.12, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.2);
    });
  }

  playWrong() {
    if (!this.enabled) return;
    this._init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }
}

const sounds = new SoundManager();

// State
let sampleNotes = [];
let currentFlashcards = [];
let currentCardIndex = 0;
let flashcardStats = { mastered: 0, review: 0, needsWork: 0 };

let currentQuizQuestions = [];
let currentQuestionIndex = 0;
let quizScore = 0;

// DOM Elements
const notesInput = document.getElementById('notesInput');
const wordCountLabel = document.getElementById('wordCountLabel');
const presetPillsContainer = document.getElementById('presetPillsContainer');
const fileUploadInput = document.getElementById('fileUploadInput');
const clearNotesBtn = document.getElementById('clearNotesBtn');

const generateBtn = document.getElementById('generateBtn');
const generateBtnText = document.getElementById('generateBtnText');
const questionCountSelect = document.getElementById('questionCount');
const studyModeSelect = document.getElementById('studyModeSelect');

const modelSelect = document.getElementById('modelSelect');
const loadModelBtn = document.getElementById('loadModelBtn');
const loadModelLabel = document.getElementById('loadModelLabel');
const statusDot = document.getElementById('statusDot');
const downloadBanner = document.getElementById('downloadBanner');
const bannerTitle = document.getElementById('bannerTitle');
const bannerDetails = document.getElementById('bannerDetails');
const downloadProgressBar = document.getElementById('downloadProgressBar');
const downloadPercentage = document.getElementById('downloadPercentage');

const audioToggleBtn = document.getElementById('audioToggleBtn');
const audioIcon = document.getElementById('audioIcon');

// Views
const modeTabs = document.querySelectorAll('.mode-tab');
const modeViews = {
  flashcards: document.getElementById('flashcardsView'),
  quiz: document.getElementById('quizView'),
  evaluator: document.getElementById('evaluatorView'),
  tutor: document.getElementById('tutorView')
};

// Flashcard elements
const flashcardsEmptyState = document.getElementById('flashcardsEmptyState');
const flashcardDeckContainer = document.getElementById('flashcardDeckContainer');
const activeFlashcard = document.getElementById('activeFlashcard');
const cardQuestionText = document.getElementById('cardQuestionText');
const cardAnswerText = document.getElementById('cardAnswerText');
const cardProgressText = document.getElementById('cardProgressText');
const prevCardBtn = document.getElementById('prevCardBtn');
const nextCardBtn = document.getElementById('nextCardBtn');
const flipCardBtn = document.getElementById('flipCardBtn');
const rateAgainBtn = document.getElementById('rateAgainBtn');
const rateHardBtn = document.getElementById('rateHardBtn');
const rateGoodBtn = document.getElementById('rateGoodBtn');
const rateEasyBtn = document.getElementById('rateEasyBtn');

// Quiz elements
const quizEmptyState = document.getElementById('quizEmptyState');
const quizContainer = document.getElementById('quizContainer');
const quizQuestionCounter = document.getElementById('quizQuestionCounter');
const quizCurrentScore = document.getElementById('quizCurrentScore');
const quizQuestionTitle = document.getElementById('quizQuestionTitle');
const quizOptionsContainer = document.getElementById('quizOptionsContainer');
const quizExplanationBox = document.getElementById('quizExplanationBox');
const explVerdictIcon = document.getElementById('explVerdictIcon');
const explVerdictText = document.getElementById('explVerdictText');
const explContentText = document.getElementById('explContentText');
const nextQuestionBtn = document.getElementById('nextQuestionBtn');
const quizSummaryCard = document.getElementById('quizSummaryCard');
const finalScorePct = document.getElementById('finalScorePct');
const finalScoreFraction = document.getElementById('finalScoreFraction');
const retakeQuizBtn = document.getElementById('retakeQuizBtn');
const newQuizFromNotesBtn = document.getElementById('newQuizFromNotesBtn');

// Evaluator elements
const evalQuestionPrompt = document.getElementById('evalQuestionPrompt');
const refreshEvalQuestionBtn = document.getElementById('refreshEvalQuestionBtn');
const evalUserAnswer = document.getElementById('evalUserAnswer');
const submitEvalBtn = document.getElementById('submitEvalBtn');
const evalResultContainer = document.getElementById('evalResultContainer');
const evalScoreNumber = document.getElementById('evalScoreNumber');
const evalVerdict = document.getElementById('evalVerdict');
const evalFeedbackSummary = document.getElementById('evalFeedbackSummary');
const coveredPointsList = document.getElementById('coveredPointsList');
const missedPointsList = document.getElementById('missedPointsList');

// Tutor elements
const chatFeed = document.getElementById('chatFeed');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatSuggestions = document.getElementById('chatSuggestions');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  setupSSE();
  await loadSampleNotes();
  await checkStatus();
});

// Setup SSE for model progress
function setupSSE() {
  const eventSource = new EventSource('/api/model/progress');
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleProgressUpdate(data);
    } catch (e) {
      console.error('Failed to parse SSE event', e);
    }
  };
}

function handleProgressUpdate(data) {
  if (!data) return;

  if (data.stage === 'downloading' || (data.percentage > 0 && data.percentage < 100)) {
    downloadBanner.classList.remove('hidden');
    statusDot.className = 'model-status-icon loading';
    bannerTitle.textContent = 'Downloading On-Device Model...';
    const mb = (n) => (n / 1e6).toFixed(1);
    bannerDetails.textContent = `Retrieved ${mb(data.downloaded || 0)} MB / ${mb(data.total || 0)} MB directly to your device`;
    downloadProgressBar.style.width = `${data.percentage}%`;
    downloadPercentage.textContent = `${Math.round(data.percentage)}%`;
  } else if (data.stage === 'loading_memory') {
    downloadBanner.classList.remove('hidden');
    bannerTitle.textContent = 'Loading Weights into RAM/VRAM...';
    bannerDetails.textContent = 'Preparing model for local on-device inference';
    downloadProgressBar.style.width = '100%';
    downloadPercentage.textContent = '100%';
  } else if (data.stage === 'ready' || data.percentage >= 100) {
    statusDot.className = 'model-status-icon';
    loadModelLabel.textContent = 'Loaded';
    setTimeout(() => {
      downloadBanner.classList.add('hidden');
    }, 2500);
  } else if (data.stage === 'error') {
    downloadBanner.classList.remove('hidden');
    bannerTitle.textContent = 'Error Loading Model';
    bannerDetails.textContent = data.error || 'Check console for details';
  }
}

// Fetch Status
async function checkStatus() {
  try {
    const res = await fetch('/api/status');
    const json = await res.json();
    if (json.qvac?.loaded) {
      statusDot.className = 'model-status-icon';
      loadModelLabel.textContent = 'Loaded';
    } else {
      loadModelLabel.textContent = 'Load';
    }
  } catch (err) {
    console.warn('Status check warning:', err);
  }
}

// Load Samples
async function loadSampleNotes() {
  try {
    const res = await fetch('/api/notes/samples');
    const json = await res.json();
    if (json.success && json.samples.length > 0) {
      sampleNotes = json.samples;
      renderPresetPills();
      selectPreset(sampleNotes[0].id);
    }
  } catch (err) {
    console.error('Failed to load sample notes:', err);
  }
}

function renderPresetPills() {
  presetPillsContainer.innerHTML = '';
  sampleNotes.forEach((sample, idx) => {
    const btn = document.createElement('button');
    btn.className = `preset-pill ${idx === 0 ? 'active' : ''}`;
    btn.textContent = sample.title.split('&')[0].trim();
    btn.dataset.id = sample.id;
    btn.addEventListener('click', () => selectPreset(sample.id));
    presetPillsContainer.appendChild(btn);
  });
}

function selectPreset(id) {
  const selected = sampleNotes.find((n) => n.id === id);
  if (!selected) return;

  document.querySelectorAll('.preset-pill').forEach((p) => {
    p.classList.toggle('active', p.dataset.id === id);
  });

  notesInput.value = selected.content;
  updateWordCount();
  updateEvaluatorPromptFromNotes();
}

function updateWordCount() {
  const text = notesInput.value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  const chars = text.length;
  wordCountLabel.textContent = `${words.toLocaleString()} words • ${chars.toLocaleString()} characters`;
}

// Event Listeners
function setupEventListeners() {
  notesInput.addEventListener('input', updateWordCount);

  clearNotesBtn.addEventListener('click', () => {
    notesInput.value = '';
    updateWordCount();
  });

  fileUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        notesInput.value = event.target.result;
        updateWordCount();
      };
      reader.readAsText(file);
    }
  });

  // Audio Toggle
  audioToggleBtn.addEventListener('click', () => {
    sounds.enabled = !sounds.enabled;
    audioIcon.style.opacity = sounds.enabled ? '1' : '0.4';
  });

  // Model Loading
  loadModelBtn.addEventListener('click', async () => {
    const modelKey = modelSelect.value;
    loadModelLabel.textContent = 'Loading...';
    try {
      await fetch('/api/model/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelKey })
      });
    } catch (err) {
      alert('Error triggering model load: ' + err.message);
    }
  });

  // Mode switching tabs
  modeTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.mode;
      switchStudyMode(mode);
    });
  });

  // Generate Button
  generateBtn.addEventListener('click', handleGenerate);

  // Flashcard controls
  activeFlashcard.addEventListener('click', toggleCardFlip);
  flipCardBtn.addEventListener('click', toggleCardFlip);
  prevCardBtn.addEventListener('click', () => navigateCard(-1));
  nextCardBtn.addEventListener('click', () => navigateCard(1));

  rateAgainBtn.addEventListener('click', () => rateCard('needsWork'));
  rateHardBtn.addEventListener('click', () => rateCard('review'));
  rateGoodBtn.addEventListener('click', () => rateCard('mastered'));
  rateEasyBtn.addEventListener('click', () => rateCard('mastered'));

  // Keyboard shortcut for flashcard flip (Space bar)
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && modeViews.flashcards.classList.contains('active') && !['TEXTAREA', 'INPUT'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      toggleCardFlip();
    }
  });

  // Quiz next question
  nextQuestionBtn.addEventListener('click', advanceQuizQuestion);
  retakeQuizBtn.addEventListener('click', restartQuiz);
  newQuizFromNotesBtn.addEventListener('click', () => {
    studyModeSelect.value = 'quiz';
    handleGenerate();
  });

  // Evaluator
  submitEvalBtn.addEventListener('click', handleEvaluateAnswer);
  refreshEvalQuestionBtn.addEventListener('click', updateEvaluatorPromptFromNotes);

  // Tutor Chat
  chatForm.addEventListener('submit', handleChatSubmit);
  chatSuggestions.querySelectorAll('.sugg-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      chatInput.value = chip.textContent;
      chatForm.dispatchEvent(new Event('submit'));
    });
  });
}

function switchStudyMode(mode) {
  modeTabs.forEach((t) => t.classList.toggle('active', t.dataset.mode === mode));
  Object.keys(modeViews).forEach((m) => {
    modeViews[m].classList.toggle('active', m === mode);
  });
}

// Generate Workflow
async function handleGenerate() {
  const notes = notesInput.value.trim();
  if (!notes) {
    alert('Please enter or select some study notes first.');
    return;
  }

  const targetMode = studyModeSelect.value;
  const count = parseInt(questionCountSelect.value, 10) || 5;

  generateBtn.disabled = true;
  generateBtnText.textContent = 'Generating with QVAC...';

  try {
    if (targetMode === 'flashcards') {
      switchStudyMode('flashcards');
      const res = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, count })
      });
      const data = await res.json();
      if (data.success && data.flashcards.length > 0) {
        currentFlashcards = data.flashcards;
        currentCardIndex = 0;
        flashcardStats = { mastered: 0, review: 0, needsWork: 0 };
        renderCurrentFlashcard();
        flashcardsEmptyState.classList.add('hidden');
        flashcardDeckContainer.classList.remove('hidden');
        sounds.playFlip();
      } else {
        alert('Could not generate flashcards: ' + (data.error || 'Try again'));
      }
    } else if (targetMode === 'quiz') {
      switchStudyMode('quiz');
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, count })
      });
      const data = await res.json();
      if (data.success && data.questions.length > 0) {
        currentQuizQuestions = data.questions;
        currentQuestionIndex = 0;
        quizScore = 0;
        renderCurrentQuizQuestion();
        quizEmptyState.classList.add('hidden');
        quizContainer.classList.remove('hidden');
        quizSummaryCard.classList.add('hidden');
        sounds.playFlip();
      } else {
        alert('Could not generate quiz: ' + (data.error || 'Try again'));
      }
    } else if (targetMode === 'evaluator') {
      switchStudyMode('evaluator');
      updateEvaluatorPromptFromNotes();
    }
  } catch (err) {
    alert('Generation error: ' + err.message);
  } finally {
    generateBtn.disabled = false;
    generateBtnText.textContent = 'Generate from Notes';
  }
}

// Flashcard Deck Functions
function renderCurrentFlashcard() {
  if (!currentFlashcards || currentFlashcards.length === 0) return;
  const card = currentFlashcards[currentCardIndex];
  activeFlashcard.classList.remove('flipped');
  cardQuestionText.textContent = card.question;
  cardAnswerText.textContent = card.answer;
  cardProgressText.textContent = `Card ${currentCardIndex + 1} of ${currentFlashcards.length}`;

  document.getElementById('masteredCount').textContent = flashcardStats.mastered;
  document.getElementById('reviewCount').textContent = flashcardStats.review;
  document.getElementById('needsWorkCount').textContent = flashcardStats.needsWork;
}

function toggleCardFlip() {
  sounds.playFlip();
  activeFlashcard.classList.toggle('flipped');
}

function navigateCard(direction) {
  const newIndex = currentCardIndex + direction;
  if (newIndex >= 0 && newIndex < currentFlashcards.length) {
    currentCardIndex = newIndex;
    sounds.playFlip();
    renderCurrentFlashcard();
  }
}

function rateCard(category) {
  flashcardStats[category]++;
  sounds.playFlip();
  if (currentCardIndex < currentFlashcards.length - 1) {
    currentCardIndex++;
    renderCurrentFlashcard();
  } else {
    renderCurrentFlashcard();
    alert(`🎉 Deck Finished! Mastered: ${flashcardStats.mastered} | Needs Work: ${flashcardStats.needsWork}`);
  }
}

// Quiz Functions
function renderCurrentQuizQuestion() {
  if (!currentQuizQuestions || currentQuizQuestions.length === 0) return;
  const q = currentQuizQuestions[currentQuestionIndex];

  quizQuestionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${currentQuizQuestions.length}`;
  quizCurrentScore.textContent = quizScore;
  quizQuestionTitle.textContent = q.question;

  quizExplanationBox.classList.add('hidden');
  quizOptionsContainer.innerHTML = '';

  q.options.forEach((optText, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="opt-badge">${['A', 'B', 'C', 'D'][idx]}</span> <span>${optText}</span>`;
    btn.addEventListener('click', () => handleOptionSelect(idx));
    quizOptionsContainer.appendChild(btn);
  });
}

function handleOptionSelect(selectedIdx) {
  const q = currentQuizQuestions[currentQuestionIndex];
  const buttons = quizOptionsContainer.querySelectorAll('.option-btn');

  buttons.forEach((b) => b.classList.add('disabled'));

  const isCorrect = selectedIdx === q.correctIndex;
  if (isCorrect) {
    buttons[selectedIdx].classList.add('correct');
    quizScore++;
    quizCurrentScore.textContent = quizScore;
    sounds.playCorrect();
    explVerdictIcon.textContent = '✅';
    explVerdictText.textContent = 'Correct!';
    explVerdictText.style.color = 'var(--accent-emerald)';
  } else {
    buttons[selectedIdx].classList.add('wrong');
    if (buttons[q.correctIndex]) {
      buttons[q.correctIndex].classList.add('correct');
    }
    sounds.playWrong();
    explVerdictIcon.textContent = '❌';
    explVerdictText.textContent = `Incorrect (Option ${['A', 'B', 'C', 'D'][q.correctIndex]} is correct)`;
    explVerdictText.style.color = 'var(--accent-rose)';
  }

  explContentText.textContent = q.explanation || 'Reviewed from notes.';
  quizExplanationBox.classList.remove('hidden');
}

function advanceQuizQuestion() {
  if (currentQuestionIndex < currentQuizQuestions.length - 1) {
    currentQuestionIndex++;
    renderCurrentQuizQuestion();
  } else {
    showQuizSummary();
  }
}

function showQuizSummary() {
  document.querySelector('.question-card').style.display = 'none';
  quizExplanationBox.classList.add('hidden');
  quizSummaryCard.classList.remove('hidden');

  const total = currentQuizQuestions.length;
  const pct = Math.round((quizScore / total) * 100);
  finalScorePct.textContent = `${pct}%`;
  finalScoreFraction.textContent = `${quizScore} / ${total} Correct`;
  sounds.playCorrect();
}

function restartQuiz() {
  document.querySelector('.question-card').style.display = 'block';
  currentQuestionIndex = 0;
  quizScore = 0;
  quizSummaryCard.classList.add('hidden');
  renderCurrentQuizQuestion();
}

// Evaluator Functions
function updateEvaluatorPromptFromNotes() {
  const notes = notesInput.value.trim();
  if (notes.includes('Coffman')) {
    evalQuestionPrompt.textContent = 'Explain the four Coffman conditions required for a deadlock to occur in an operating system.';
  } else if (notes.includes('Mitochondria') || notes.includes('Central Dogma')) {
    evalQuestionPrompt.textContent = 'Explain the Central Dogma of molecular biology and describe what occurs during replication, transcription, and translation.';
  } else if (notes.includes('Gradient Descent')) {
    evalQuestionPrompt.textContent = 'Explain the difference between overfitting and underfitting in Machine Learning, and name two regularization techniques.';
  } else if (notes.includes('Industrial Revolution')) {
    evalQuestionPrompt.textContent = 'What key inventions and economic factors allowed Great Britain to lead the First Industrial Revolution?';
  } else {
    evalQuestionPrompt.textContent = 'Summarize the primary thesis and key points introduced in your study notes.';
  }
  evalResultContainer.classList.add('hidden');
  evalUserAnswer.value = '';
}

async function handleEvaluateAnswer() {
  const answer = evalUserAnswer.value.trim();
  if (!answer) {
    alert('Please type an answer in your own words before submitting.');
    return;
  }

  submitEvalBtn.disabled = true;
  submitEvalBtn.innerHTML = '<span>🤖 Analyzing on-device...</span>';

  try {
    const res = await fetch('/api/quiz/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: evalQuestionPrompt.textContent,
        expectedContext: notesInput.value.substring(0, 1500),
        userAnswer: answer
      })
    });

    const data = await res.json();
    if (data.success && data.evaluation) {
      const ev = data.evaluation;
      evalScoreNumber.textContent = ev.score || 80;
      evalVerdict.textContent = ev.verdict || 'Evaluation Complete';
      evalFeedbackSummary.textContent = ev.feedback || 'Good effort.';

      coveredPointsList.innerHTML = '';
      (ev.keyPointsCovered || ['Relevant concepts recalled accurately']).forEach((p) => {
        const li = document.createElement('li');
        li.textContent = p;
        coveredPointsList.appendChild(li);
      });

      missedPointsList.innerHTML = '';
      (ev.missedPoints || ['Review specific terminology in notes']).forEach((p) => {
        const li = document.createElement('li');
        li.textContent = p;
        missedPointsList.appendChild(li);
      });

      evalResultContainer.classList.remove('hidden');
      if ((ev.score || 0) >= 70) {
        sounds.playCorrect();
      } else {
        sounds.playWrong();
      }
    }
  } catch (err) {
    alert('Grading error: ' + err.message);
  } finally {
    submitEvalBtn.disabled = false;
    submitEvalBtn.innerHTML = '<span>🤖 Grade Answer with On-Device AI</span>';
  }
}

// Tutor Chat Functions
async function handleChatSubmit(e) {
  e.preventDefault();
  const query = chatInput.value.trim();
  if (!query) return;

  // Append user message
  appendChatMessage(query, 'user');
  chatInput.value = '';

  // Append bot placeholder
  const botMsgDiv = appendChatMessage('', 'bot');
  const bubble = botMsgDiv.querySelector('.msg-bubble');
  bubble.innerHTML = '<span class="typing-dots">Thinking...</span>';

  try {
    const response = await fetch('/api/tutor/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes: notesInput.value,
        question: query
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';
    bubble.innerHTML = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.substring(6));
            if (parsed.token) {
              accumulatedText += parsed.token;
              bubble.textContent = accumulatedText;
              chatFeed.scrollTop = chatFeed.scrollHeight;
            }
          } catch (err) {
            // non-json or partial line
          }
        }
      }
    }
  } catch (err) {
    bubble.textContent = 'Error answering question: ' + err.message;
  }
}

function appendChatMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender}-msg`;
  msgDiv.innerHTML = `
    <div class="msg-avatar">${sender === 'user' ? '👤' : '🤖'}</div>
    <div class="msg-bubble">${text ? `<p>${text}</p>` : ''}</div>
  `;
  chatFeed.appendChild(msgDiv);
  chatFeed.scrollTop = chatFeed.scrollHeight;
  return msgDiv;
}
