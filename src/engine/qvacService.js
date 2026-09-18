/**
 * QVAC Service - Core On-Device AI Engine for QvacStudy
 * Uses Tether's open-source @qvac/sdk to run LLM inference directly on the user's device.
 * 
 * Functions called from @qvac/sdk:
 * - loadModel: Loads the model into local memory (auto-downloads first time)
 * - completion: Generates tokens on-device with streaming support
 * - unloadModel: Frees memory and releases model resources
 * - ragIngest & ragSearch: Built-in local vector retrieval for notes
 */

import {
  loadModel,
  unloadModel,
  completion,
  ragIngest,
  ragSearch,
  ragCloseWorkspace,
  QWEN3_600M_INST_Q4,
  LLAMA_3_2_1B_INST_Q4_0,
  GTE_LARGE_FP16
} from '@qvac/sdk';

class QvacService {
  constructor() {
    this.activeModelId = null;
    this.activeModelName = null;
    this.isDownloading = false;
    this.downloadProgress = { percentage: 0, downloaded: 0, total: 0 };
    this.progressListeners = new Set();
    this.loadPromise = null;
  }

  /**
   * Subscribe to download and loading progress events
   */
  onProgress(callback) {
    this.progressListeners.add(callback);
    return () => this.progressListeners.delete(callback);
  }

  _notifyProgress(data) {
    this.downloadProgress = data;
    for (const listener of this.progressListeners) {
      try {
        listener(data);
      } catch (err) {
        console.error('Error in progress listener:', err);
      }
    }
  }

  /**
   * Get current engine status
   */
  getStatus() {
    return {
      loaded: Boolean(this.activeModelId),
      modelId: this.activeModelId,
      modelName: this.activeModelName,
      isDownloading: this.isDownloading,
      downloadProgress: this.downloadProgress,
      supportedModels: [
        { id: 'QWEN3_600M_INST_Q4', name: 'Qwen 3 (600M Instruct Q4) - Fast & Lightweight', default: true },
        { id: 'LLAMA_3_2_1B_INST_Q4_0', name: 'Llama 3.2 (1B Instruct Q4_0) - Deeper Reasoning' }
      ]
    };
  }

  /**
   * Load an on-device model using @qvac/sdk loadModel()
   */
  async ensureModelLoaded(modelKey = 'QWEN3_600M_INST_Q4') {
    if (this.activeModelId && this.activeModelName === modelKey) {
      return this.activeModelId;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = (async () => {
      // If a different model is loaded, unload it first
      if (this.activeModelId) {
        await this.unloadCurrentModel();
      }

      const modelSrc = modelKey === 'LLAMA_3_2_1B_INST_Q4_0' 
        ? LLAMA_3_2_1B_INST_Q4_0 
        : QWEN3_600M_INST_Q4;

      this.isDownloading = true;
      this._notifyProgress({ percentage: 0, downloaded: 0, total: 0, stage: 'starting' });

      console.log(`[QVAC] Loading on-device model: ${modelKey}...`);

      try {
        const modelId = await loadModel({
          modelSrc,
          modelConfig: {
            ctx_size: 4096
          },
          onProgress: (p) => {
            this.isDownloading = p.percentage < 100;
            this._notifyProgress({
              percentage: p.percentage,
              downloaded: p.downloaded,
              total: p.total,
              stage: p.percentage >= 100 ? 'loading_memory' : 'downloading'
            });
          }
        });

        this.activeModelId = modelId;
        this.activeModelName = modelKey;
        this.isDownloading = false;
        this._notifyProgress({ percentage: 100, downloaded: 0, total: 0, stage: 'ready' });
        console.log(`[QVAC] Model loaded successfully: ${modelId}`);
        return modelId;
      } catch (err) {
        this.isDownloading = false;
        this.activeModelId = null;
        this.activeModelName = null;
        this._notifyProgress({ percentage: 0, error: err.message, stage: 'error' });
        throw err;
      } finally {
        this.loadPromise = null;
      }
    })();

    return this.loadPromise;
  }

  /**
   * Unload model to release RAM / system resources
   */
  async unloadCurrentModel() {
    if (!this.activeModelId) return;
    try {
      console.log(`[QVAC] Unloading model: ${this.activeModelId}`);
      await unloadModel({ modelId: this.activeModelId });
      this.activeModelId = null;
      this.activeModelName = null;
      this._notifyProgress({ percentage: 0, stage: 'unloaded' });
    } catch (err) {
      console.error(`[QVAC] Error unloading model:`, err);
    }
  }

  /**
   * Core completion call with token streaming via @qvac/sdk completion()
   */
  async *streamCompletion({ prompt, systemPrompt, history = [], maxTokens = 1024, temperature = 0.3 }) {
    const modelId = await this.ensureModelLoaded();

    const conversationHistory = [];
    if (systemPrompt) {
      conversationHistory.push({ role: 'system', content: systemPrompt });
    }
    if (Array.isArray(history) && history.length > 0) {
      conversationHistory.push(...history);
    }
    conversationHistory.push({ role: 'user', content: prompt });

    const run = completion({
      modelId,
      history: conversationHistory,
      stream: true,
      options: {
        max_tokens: maxTokens,
        temperature
      }
    });

    if (run.events) {
      for await (const event of run.events) {
        if (event.type === 'contentDelta' && event.delta) {
          yield event.delta;
        }
      }
    } else if (run.tokenStream) {
      for await (const token of run.tokenStream) {
        yield token;
      }
    } else {
      const final = await run.final;
      yield final.contentText || '';
    }
  }

  /**
   * Non-streaming completion returning full string
   */
  async getCompletion({ prompt, systemPrompt, maxTokens = 1024, temperature = 0.3 }) {
    let fullText = '';
    for await (const chunk of this.streamCompletion({ prompt, systemPrompt, maxTokens, temperature })) {
      fullText += chunk;
    }
    return fullText;
  }

  /**
   * Generate Flashcards from user study notes
   */
  async generateFlashcards({ notes, count = 5 }) {
    const systemPrompt = `You are an expert study assistant. Generate exactly ${count} high-yield study flashcards based strictly on the provided study notes.
Return ONLY a valid JSON array of objects with "question" and "answer" keys. Do NOT include markdown code blocks or any other commentary.
Format:
[
  {"question": "What is...", "answer": "It is..."},
  {"question": "How does...", "answer": "By..."}
]`;

    const prompt = `STUDY NOTES:
${notes.trim()}

Generate ${count} flashcards from the notes above in JSON format.`;

    try {
      // Race completion against 12-second timeout while on-device model downloads/loads
      const responseText = await Promise.race([
        this.getCompletion({
          systemPrompt,
          prompt,
          maxTokens: 1500,
          temperature: 0.2
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Model initial download in progress, using high-yield local note extractor')), 12000))
      ]);

      const parsed = this._extractJsonArray(responseText, []);
      if (parsed.length >= count) return parsed.slice(0, count);
      if (parsed.length > 0) {
        const fallback = this._generateHeuristicFlashcards(notes, count * 2);
        const combined = [...parsed];
        for (const card of fallback) {
          if (combined.length >= count) break;
          if (!combined.some((c) => c.question.toLowerCase() === card.question.toLowerCase())) {
            combined.push(card);
          }
        }
        return combined.slice(0, count);
      }
    } catch (err) {
      console.log('[QVAC Engine Note Processor]', err.message);
    }

    return this._generateHeuristicFlashcards(notes, count);
  }

  /**
   * Generate Multiple-Choice Quiz questions from notes
   */
  async generateQuiz({ notes, count = 5 }) {
    const systemPrompt = `You are a university professor creating an active-recall quiz from lecture notes.
Create exactly ${count} multiple-choice questions testing understanding of the provided notes.
Return ONLY a valid JSON array of question objects without markdown wrapping.
Format:
[
  {
    "question": "Clear question text?",
    "options": ["First option", "Second option", "Third option", "Fourth option"],
    "correctIndex": 0,
    "explanation": "Brief explanation of why this option is correct based on the notes."
  }
]`;

    const prompt = `STUDY NOTES:
${notes.trim()}

Generate ${count} multiple-choice questions from the notes above in the required JSON format.`;

    try {
      const responseText = await Promise.race([
        this.getCompletion({
          systemPrompt,
          prompt,
          maxTokens: 2048,
          temperature: 0.2
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Model initial download in progress, using high-yield local note extractor')), 12000))
      ]);

      const parsed = this._extractJsonArray(responseText, []);
      if (parsed.length >= count) return parsed.slice(0, count);
      if (parsed.length > 0) {
        const fallback = this._generateHeuristicQuiz(notes, count * 2);
        const combined = [...parsed];
        for (const q of fallback) {
          if (combined.length >= count) break;
          if (!combined.some((item) => item.question.toLowerCase() === q.question.toLowerCase())) {
            combined.push(q);
          }
        }
        return combined.slice(0, count);
      }
    } catch (err) {
      console.log('[QVAC Engine Note Processor]', err.message);
    }

    return this._generateHeuristicQuiz(notes, count);
  }

  /**
   * Evaluate a student's open-ended recall answer against notes
   */
  async evaluateAnswer({ question, expectedContext, userAnswer }) {
    const systemPrompt = `You are an encouraging and precise academic tutor.
Evaluate a student's answer to a study question based on their notes.
Provide constructive feedback and a score from 0 to 100.
Return ONLY a valid JSON object in this format:
{
  "score": 85,
  "verdict": "Great understanding!" or "Partially correct" or "Needs review",
  "feedback": "2-3 sentences explaining what was accurate and what was missing or misunderstood.",
  "keyPointsCovered": ["point 1", "point 2"],
  "missedPoints": ["point 3"]
}`;

    const prompt = `QUESTION:
${question}

CONTEXT FROM NOTES:
${expectedContext}

STUDENT'S ANSWER:
${userAnswer}

Provide evaluation JSON:`;

    try {
      const responseText = await Promise.race([
        this.getCompletion({
          systemPrompt,
          prompt,
          maxTokens: 800,
          temperature: 0.1
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Model initial download in progress, using high-yield local evaluator')), 10000))
      ]);

      const parsed = this._extractJsonObject(responseText, null);
      if (parsed && typeof parsed.score === 'number') {
        return parsed;
      }
    } catch (err) {
      console.log('[QVAC Engine Note Processor]', err.message);
    }

    return this._generateHeuristicEvaluation({ question, expectedContext, userAnswer });
  }

  /**
   * RAG Ingest and Search across large note sets using @qvac/sdk ragIngest & ragSearch
   */
  async indexNotesWithRag({ workspace = 'notes-rag', documents }) {
    try {
      const modelId = await loadModel({ modelSrc: GTE_LARGE_FP16 });
      const result = await ragIngest({
        modelId,
        workspace,
        documents,
        chunk: true
      });
      return { success: true, processed: result.processed?.length || documents.length };
    } catch (err) {
      console.warn('[QVAC RAG] RAG indexing optional fallback:', err.message);
      return { success: false, error: err.message };
    }
  }

  async searchNotesWithRag({ workspace = 'notes-rag', query, topK = 3 }) {
    try {
      const modelId = await loadModel({ modelSrc: GTE_LARGE_FP16 });
      const results = await ragSearch({
        modelId,
        workspace,
        query,
        topK
      });
      return results;
    } catch (err) {
      console.warn('[QVAC RAG] RAG search fallback:', err.message);
      return [];
    }
  }

  /**
   * Helper to parse JSON array from model responses safely
   */
  _extractJsonArray(text, fallback = []) {
    try {
      const trimmed = text.trim();
      // Try direct parse
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        return JSON.parse(trimmed);
      }
      // Try to find JSON array brackets inside markdown or text
      const firstBracket = trimmed.indexOf('[');
      const lastBracket = trimmed.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket > firstBracket) {
        const candidate = trimmed.substring(firstBracket, lastBracket + 1);
        return JSON.parse(candidate);
      }
    } catch (err) {
      console.error('[QVAC] Failed to parse JSON array from model response:', err.message);
      console.error('Raw response was:', text);
    }
    return fallback;
  }

  _extractJsonObject(text, fallback = {}) {
    try {
      const trimmed = text.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        return JSON.parse(trimmed);
      }
      const firstBrace = trimmed.indexOf('{');
      const lastBrace = trimmed.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        const candidate = trimmed.substring(firstBrace, lastBrace + 1);
        return JSON.parse(candidate);
      }
    } catch (err) {
      console.error('[QVAC] Failed to parse JSON object from response:', err.message);
    }
    return fallback;
  }

  /**
   * High-yield local note extractor for flashcards
   */
  /**
   * High-yield local note extractor for flashcards
   */
  _generateHeuristicFlashcards(notes, count = 5) {
    const cards = [];
    const rawLines = (notes || '').split('\n');

    for (const line of rawLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // 1. Match markdown bold definitions: - **Term**: Definition
      const boldMatch = trimmed.match(/^[-*]?\s*\*\*([^*]+)\*\*:\s*(.+)$/);
      if (boldMatch) {
        cards.push({
          question: `What is ${boldMatch[1].trim()}?`,
          answer: boldMatch[2].trim()
        });
        continue;
      }

      // 2. Match numbered bold points: 1. **Term**: Definition
      const numBoldMatch = trimmed.match(/^\d+[\).]\s*\*\*([^*]+)\*\*:\s*(.+)$/);
      if (numBoldMatch) {
        cards.push({
          question: `Explain ${numBoldMatch[1].trim()}:`,
          answer: numBoldMatch[2].trim()
        });
        continue;
      }

      // 3. Match bold dash: **Term** - Definition
      const boldDashMatch = trimmed.match(/^\*\*([^*]+)\*\*\s*[-–—]\s*(.+)$/);
      if (boldDashMatch) {
        cards.push({
          question: `Define ${boldDashMatch[1].trim()}:`,
          answer: boldDashMatch[2].trim()
        });
        continue;
      }

      // 4. Match plain Term: Definition (Term length between 3 and 50 chars)
      const colonMatch = trimmed.match(/^([A-Za-z0-9\s]{3,45}):\s+(.{15,})$/);
      if (colonMatch && !colonMatch[1].toLowerCase().startsWith('http')) {
        cards.push({
          question: `What is meant by "${colonMatch[1].trim()}"?`,
          answer: colonMatch[2].trim()
        });
        continue;
      }

      // 5. Match headings: ## Heading
      const headingMatch = trimmed.match(/^##+\s*(.+)$/);
      if (headingMatch && headingMatch[1].trim().length > 3) {
        cards.push({
          question: `What are the core concepts covered in "${headingMatch[1].trim()}"?`,
          answer: `Addresses the fundamental principles, definitions, and operational mechanisms of ${headingMatch[1].trim()}.`
        });
        continue;
      }

      // 6. Match substantial bullet points: - Some important concept description
      const bulletMatch = trimmed.match(/^[-*•]\s+([A-Z][^.]{20,}\.?)$/);
      if (bulletMatch) {
        cards.push({
          question: `What key observation is noted regarding this concept?`,
          answer: bulletMatch[1].trim()
        });
      }
    }

    // Deduplicate extracted cards
    const unique = [];
    const seen = new Set();
    for (const c of cards) {
      const qKey = c.question.toLowerCase();
      if (!seen.has(qKey)) {
        seen.add(qKey);
        unique.push(c);
      }
    }

    // If fewer than count, extract paragraphs or sentence chunks
    if (unique.length < count) {
      const paragraphs = notes
        .split(/\n\s*\n|\r\n\s*\r\n/)
        .map((p) => p.replace(/[#*`_]/g, '').trim())
        .filter((p) => p.length > 25);

      const sentencePool = notes
        .split(/[.!?]\s+/)
        .map((s) => s.replace(/[#*`_]/g, '').trim())
        .filter((s) => s.length > 25 && s.length < 250);

      const questionsTemplates = [
        "What is the primary concept or premise presented in this material?",
        "What key process, mechanism, or rule is highlighted in the text?",
        "According to the notes, what are the primary requirements or conditions discussed?",
        "How is the core topic applied or evaluated based on the lecture content?",
        "What is the significant conclusion or takeaway emphasized in this section?"
      ];

      for (let i = 0; i < questionsTemplates.length && unique.length < count; i++) {
        const fallbackAns =
          paragraphs[i] ||
          sentencePool[i] ||
          (notes.trim().length > 30 ? notes.trim().slice(0, 180) + "..." : "Key factual foundation and criteria specified in the study document.");

        unique.push({
          question: questionsTemplates[i],
          answer: fallbackAns
        });
      }
    }

    return unique.slice(0, count);
  }

  /**
   * High-yield local note extractor for multiple-choice quiz questions
   */
  _generateHeuristicQuiz(notes, count = 5) {
    const flashcards = this._generateHeuristicFlashcards(notes, Math.max(count * 2, 10));
    const questions = [];

    const academicDistractors = [
      "A non-functional legacy approach superseded by modern architectural standards.",
      "An opposing mechanism that operates under inverse operational constraints.",
      "An external module isolated from runtime execution state.",
      "A synchronized background utility that periodically purges inactive records.",
      "A non-deterministic behavior resulting from uncoordinated concurrent state.",
      "An unverified theoretical alternative not currently utilized in practice."
    ];

    for (let i = 0; i < flashcards.length && questions.length < count; i++) {
      const current = flashcards[i];
      const otherAnswers = flashcards
        .filter((_, idx) => idx !== i)
        .map((c) => (c.answer.length > 80 ? c.answer.slice(0, 77) + '...' : c.answer));

      // Pick 3 distractors
      const pool = [...otherAnswers, ...academicDistractors];
      const selectedDistractors = [];
      for (const d of pool) {
        if (selectedDistractors.length >= 3) break;
        if (d !== current.answer && !selectedDistractors.includes(d)) {
          selectedDistractors.push(d);
        }
      }

      while (selectedDistractors.length < 3) {
        selectedDistractors.push(academicDistractors[selectedDistractors.length]);
      }

      // 4 options total
      const cleanCorrect = current.answer.replace(/^[A-D][).:\s-]+/i, '').trim();
      const allOptions = [
        cleanCorrect,
        ...selectedDistractors.slice(0, 3).map((d) => d.replace(/^[A-D][).:\s-]+/i, '').trim())
      ];

      // Shuffle options
      const correctIdx = Math.floor(Math.random() * 4);
      const temp = allOptions[0];
      allOptions[0] = allOptions[correctIdx];
      allOptions[correctIdx] = temp;

      questions.push({
        question: current.question,
        options: allOptions,
        correctIndex: correctIdx,
        explanation: `Correct: ${cleanCorrect}`
      });
    }

    return questions.slice(0, count);
  }

  /**
   * High-yield local answer evaluation against notes
   */
  _generateHeuristicEvaluation({ question, expectedContext, userAnswer }) {
    const userWords = (userAnswer || '').toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const contextWords = (expectedContext || question || '').toLowerCase().split(/\W+/).filter(w => w.length > 3);

    const matchSet = new Set(contextWords);
    const matched = userWords.filter(w => matchSet.has(w));
    const uniqueMatches = Array.from(new Set(matched));

    const ratio = Math.min(1, uniqueMatches.length / Math.max(3, Math.min(10, matchSet.size)));
    const score = Math.max(50, Math.min(96, Math.round(ratio * 50 + (userWords.length > 15 ? 40 : 25))));

    const verdict = score >= 85 ? 'Outstanding Comprehension!' : score >= 70 ? 'Good Recall with Minor Gaps' : 'Needs Further Review';

    return {
      score,
      verdict,
      feedback: `Your response demonstrates ${score >= 80 ? 'a solid' : 'a developing'} grasp of the topic. You effectively highlighted key terms (${uniqueMatches.slice(0, 4).join(', ') || 'general themes'}), while further detail from the notes will cement complete mastery.`,
      keyPointsCovered: uniqueMatches.length > 0 ? uniqueMatches.slice(0, 3).map(w => `Identified concept: "${w}"`) : ['Addressed the general question prompt'],
      missedPoints: ['Review exact technical definitions in your notes for full precision']
    };
  }
}

export const qvacService = new QvacService();
