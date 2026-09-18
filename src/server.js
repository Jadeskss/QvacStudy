import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { qvacService } from './engine/qvacService.js';
import { SAMPLE_NOTES } from './data/sampleNotes.js';

import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve Vite compiled React frontend if dist exists, else public
const staticDir = fs.existsSync(path.join(__dirname, '../dist'))
  ? path.join(__dirname, '../dist')
  : path.join(__dirname, '../public');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(staticDir));

// Store SSE clients for model download progress
const sseClients = new Set();

qvacService.onProgress((progress) => {
  const data = JSON.stringify(progress);
  for (const client of sseClients) {
    client.write(`data: ${data}\n\n`);
  }
});

// GET: Current engine status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    qvac: qvacService.getStatus(),
    timestamp: new Date().toISOString()
  });
});

// GET: Sample study notes library
app.get('/api/notes/samples', (req, res) => {
  res.json({
    success: true,
    samples: SAMPLE_NOTES
  });
});

// POST: Parse uploaded document (PDF, DOCX, DOC, TXT, MD) into plain text notes on-device
app.post('/api/notes/parse-file', async (req, res) => {
  try {
    const { filename, contentBase64 } = req.body;
    if (!filename || !contentBase64) {
      return res.status(400).json({ success: false, error: 'filename and contentBase64 required' });
    }

    const buffer = Buffer.from(contentBase64, 'base64');
    const ext = path.extname(filename).toLowerCase();
    let text = '';

    if (ext === '.pdf') {
      const { PDFParse } = await import('pdf-parse');
      const data = await PDFParse(buffer);
      text = data.text || '';
    } else if (ext === '.docx' || ext === '.doc') {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || '';
    } else {
      // .txt, .md, .markdown, etc.
      text = buffer.toString('utf8');
    }

    text = text.trim();
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'No readable text could be extracted from this document.'
      });
    }

    const wordCount = text.split(/\s+/).length;
    res.json({
      success: true,
      filename,
      text,
      wordCount,
      characterCount: text.length
    });
  } catch (err) {
    console.error('Document parse error:', err);
    res.status(500).json({
      success: false,
      error: `Failed to parse document: ${err.message}`
    });
  }
});

// GET: SSE stream for real-time model download & loading progress
app.get('/api/model/progress', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send current state immediately
  res.write(`data: ${JSON.stringify(qvacService.downloadProgress)}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// POST: Trigger on-device model loading
app.post('/api/model/load', async (req, res) => {
  const { modelKey = 'QWEN3_600M_INST_Q4' } = req.body;
  try {
    // Start loading asynchronously if not already loaded
    qvacService.ensureModelLoaded(modelKey).catch((err) => {
      console.error('[QVAC Server] Background load error:', err);
    });

    res.json({
      success: true,
      message: `Model ${modelKey} load initiated`,
      status: qvacService.getStatus()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST: Unload model
app.post('/api/model/unload', async (req, res) => {
  try {
    await qvacService.unloadCurrentModel();
    res.json({ success: true, message: 'Model unloaded from memory' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST: Generate Flashcards from notes
app.post('/api/flashcards/generate', async (req, res) => {
  const { notes, count = 5 } = req.body;
  if (!notes || !notes.trim()) {
    return res.status(400).json({ success: false, error: 'Notes content is required' });
  }

  try {
    const flashcards = await qvacService.generateFlashcards({ notes, count: Number(count) || 5 });
    res.json({ success: true, flashcards });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST: Generate Multiple-Choice Quiz from notes
app.post('/api/quiz/generate', async (req, res) => {
  const { notes, count = 5 } = req.body;
  if (!notes || !notes.trim()) {
    return res.status(400).json({ success: false, error: 'Notes content is required' });
  }

  try {
    const questions = await qvacService.generateQuiz({ notes, count: Number(count) || 5 });
    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST: Evaluate open-ended student answer
app.post('/api/quiz/evaluate', async (req, res) => {
  const { question, expectedContext, userAnswer } = req.body;
  if (!question || !userAnswer) {
    return res.status(400).json({ success: false, error: 'Question and student answer are required' });
  }

  try {
    const evaluation = await qvacService.evaluateAnswer({
      question,
      expectedContext: expectedContext || '',
      userAnswer
    });
    res.json({ success: true, evaluation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST: Real-time Tutor Chat streaming
app.post('/api/tutor/stream', async (req, res) => {
  const { notes, question } = req.body;
  if (!question) {
    return res.status(400).json({ success: false, error: 'Question is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const systemPrompt = `You are a friendly, brilliant, and patient personal study tutor.
Explain concepts clearly and concisely using the student's study notes as your primary source of truth.
If the notes do not cover a specific detail, mention that gently while answering using sound fundamental knowledge.`;

  const prompt = `STUDY NOTES:
${notes ? notes.trim() : '(No specific notes provided)'}

STUDENT'S QUESTION:
${question.trim()}

Answer the student clearly:`;

  try {
    for await (const chunk of qvacService.streamCompletion({ prompt, systemPrompt, maxTokens: 800 })) {
      res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// POST: Semantic RAG search
app.post('/api/rag/search', async (req, res) => {
  const { query, workspace = 'notes-rag' } = req.body;
  if (!query) {
    return res.status(400).json({ success: false, error: 'Query is required' });
  }

  try {
    const results = await qvacService.searchNotesWithRag({ workspace, query });
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Catch-all: serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Start listening on 0.0.0.0 for reliable local access
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 QvacStudy On-Device AI App running at:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`⚡ Powered by Tether QVAC SDK (@qvac/sdk)`);
  console.log(`🔒 100% Private, Local On-Device Inference`);
  console.log(`======================================================\n`);
});
