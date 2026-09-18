#!/usr/bin/env node

/**
 * QvacStudy CLI - Terminal Study Quizzer powered by Tether QVAC SDK
 * Run: node cli.js [--notes ./path/to/notes.txt]
 */

import fs from 'fs';
import readline from 'readline';
import { qvacService } from './src/engine/qvacService.js';
import { SAMPLE_NOTES } from './src/data/sampleNotes.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.clear();
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║       🎓 QvacStudy CLI - On-Device AI Study & Quizzer          ║');
  console.log('║        Powered by Tether QVAC SDK (@qvac/sdk)                  ║');
  console.log('║        100% Private, On-Device LLM Inference                   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Parse notes from args or ask
  const args = process.argv.slice(2);
  let notesContent = '';

  const notesArgIndex = args.indexOf('--notes');
  if (notesArgIndex !== -1 && args[notesArgIndex + 1]) {
    const filePath = args[notesArgIndex + 1];
    if (fs.existsSync(filePath)) {
      notesContent = fs.readFileSync(filePath, 'utf-8');
      console.log(`📁 Loaded notes from: ${filePath}\n`);
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  }

  if (!notesContent) {
    console.log('Select study notes to quiz from:');
    SAMPLE_NOTES.forEach((note, i) => {
      console.log(`  [${i + 1}] ${note.title} (${note.category})`);
    });
    console.log(`  [${SAMPLE_NOTES.length + 1}] Paste custom notes`);

    const choice = await askQuestion('\nChoice (1-5): ');
    const index = parseInt(choice) - 1;

    if (index >= 0 && index < SAMPLE_NOTES.length) {
      notesContent = SAMPLE_NOTES[index].content;
      console.log(`\n✅ Selected: ${SAMPLE_NOTES[index].title}\n`);
    } else {
      console.log('\nPaste your notes (type END on a single line when done):');
      const lines = [];
      while (true) {
        const line = await askQuestion('');
        if (line.trim() === 'END') break;
        lines.push(line);
      }
      notesContent = lines.join('\n');
    }
  }

  if (!notesContent.trim()) {
    console.log('❌ No notes provided. Exiting.');
    rl.close();
    process.exit(1);
  }

  console.log('\n⚙️ Initializing Tether QVAC SDK on-device engine...');
  const unsubscribe = qvacService.onProgress((p) => {
    if (p.stage === 'downloading') {
      const mb = (n) => (n / 1e6).toFixed(1);
      process.stdout.write(`\r▸ Downloading model: ${p.percentage.toFixed(0)}% (${mb(p.downloaded)}/${mb(p.total)} MB)`);
      if (p.percentage >= 100) process.stdout.write('\n');
    } else if (p.stage === 'ready') {
      console.log('✅ Model ready in local memory!\n');
    }
  });

  try {
    await qvacService.ensureModelLoaded();
    unsubscribe();

    console.log('Choose study mode:');
    console.log('  [1] Multiple Choice Challenge');
    console.log('  [2] Active-Recall Open Question (AI Graded)');
    console.log('  [3] Ask Notes (Tutor Chat)');

    const mode = await askQuestion('\nMode (1-3): ');

    if (mode === '1') {
      console.log('\n🧠 Generating 3 quiz questions with QVAC on-device AI...');
      const questions = await qvacService.generateQuiz({ notes: notesContent, count: 3 });

      if (!questions || questions.length === 0) {
        console.log('❌ Could not parse questions. Try again.');
      } else {
        let score = 0;
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
          console.log(`Question ${i + 1}/${questions.length}: ${q.question}\n`);
          q.options.forEach((opt) => console.log(`  ${opt}`));

          const ans = await askQuestion('\nYour answer (A, B, C, or D): ');
          const selectedIdx = ['a', 'b', 'c', 'd'].indexOf(ans.trim().toLowerCase());

          if (selectedIdx === q.correctIndex) {
            console.log('🎉 CORRECT!');
            score++;
          } else {
            console.log(`❌ INCORRECT. Correct answer was option: ${['A', 'B', 'C', 'D'][q.correctIndex]}`);
          }
          if (q.explanation) {
            console.log(`💡 Explanation: ${q.explanation}`);
          }
        }
        console.log(`\n🏁 Final Score: ${score}/${questions.length} (${Math.round((score / questions.length) * 100)}%)`);
      }
    } else if (mode === '2') {
      console.log('\n🧠 Generating active-recall question with QVAC on-device AI...');
      const flashcards = await qvacService.generateFlashcards({ notes: notesContent, count: 1 });
      if (flashcards.length > 0) {
        const fc = flashcards[0];
        console.log(`\nQUESTION: ${fc.question}`);
        const userAns = await askQuestion('\nYour Answer (in your own words): ');

        console.log('\n🤖 Grading your response on-device with QVAC...');
        const evalRes = await qvacService.evaluateAnswer({
          question: fc.question,
          expectedContext: fc.answer,
          userAnswer: userAns
        });

        console.log(`\n📊 Score: ${evalRes.score}/100 - ${evalRes.verdict}`);
        console.log(`💬 Feedback: ${evalRes.feedback}`);
        console.log(`📖 Reference answer: ${fc.answer}`);
      }
    } else {
      console.log('\n💬 AI Study Tutor mode (type exit to quit):');
      while (true) {
        const query = await askQuestion('\nAsk question: ');
        if (query.trim().toLowerCase() === 'exit') break;

        process.stdout.write('Tutor: ');
        for await (const chunk of qvacService.streamCompletion({
          prompt: `NOTES:\n${notesContent}\n\nQUESTION: ${query}`,
          systemPrompt: 'You are an AI study tutor. Answer concisely based on the notes.'
        })) {
          process.stdout.write(chunk);
        }
        process.stdout.write('\n');
      }
    }

    console.log('\n🧹 Cleaning up model memory...');
    await qvacService.unloadCurrentModel();
    console.log('👋 Session complete. Keep studying!');
  } catch (err) {
    console.error('✖ Error:', err);
  } finally {
    rl.close();
  }
}

main();
