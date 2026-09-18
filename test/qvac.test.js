/**
 * Automated Verification Tests for QvacStudy
 * Verifies QVAC SDK dependencies, required function calls, parser logic, and note sets.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as qvac from '@qvac/sdk';
import { qvacService } from '../src/engine/qvacService.js';
import { SAMPLE_NOTES } from '../src/data/sampleNotes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Starting QvacStudy automated test suite...\n');

// Test 1: Validate package.json declares @qvac/sdk >= 0.19.0
console.log('1️⃣ Checking package.json requirements...');
const pkgPath = path.join(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

assert.ok(pkg.dependencies['@qvac/sdk'], 'package.json must declare @qvac/sdk dependency');
const sdkVersionStr = pkg.dependencies['@qvac/sdk'].replace(/[\^~>=]/g, '');
const [major, minor] = sdkVersionStr.split('.').map(Number);
assert.ok(
  major > 0 || (major === 0 && minor >= 19),
  `@qvac/sdk must be version 0.19.0 or higher. Found: ${pkg.dependencies['@qvac/sdk']}`
);
console.log(`   ✅ @qvac/sdk dependency declared correctly: ${pkg.dependencies['@qvac/sdk']}`);

// Test 2: Check required QVAC SDK functions exist
console.log('2️⃣ Verifying required QVAC SDK exports exist...');
assert.strictEqual(typeof qvac.loadModel, 'function', 'loadModel must be a function in @qvac/sdk');
assert.strictEqual(typeof qvac.completion, 'function', 'completion must be a function in @qvac/sdk');
assert.strictEqual(typeof qvac.unloadModel, 'function', 'unloadModel must be a function in @qvac/sdk');
assert.strictEqual(typeof qvac.ragIngest, 'function', 'ragIngest must be a function in @qvac/sdk');
assert.strictEqual(typeof qvac.ragSearch, 'function', 'ragSearch must be a function in @qvac/sdk');
assert.ok(qvac.QWEN3_600M_INST_Q4, 'QWEN3_600M_INST_Q4 model constant must exist');
console.log('   ✅ All required QVAC SDK functions and constants verified.');

// Test 3: Validate sample notes library
console.log('3️⃣ Checking sample notes data integrity...');
assert.ok(Array.isArray(SAMPLE_NOTES), 'SAMPLE_NOTES must be an array');
assert.ok(SAMPLE_NOTES.length >= 3, 'Must have at least 3 sample study topics');
SAMPLE_NOTES.forEach((note) => {
  assert.ok(note.id && note.title && note.category, 'Note must have id, title, and category');
  assert.ok(note.content && note.content.length > 100, `Note ${note.id} must have substantial content`);
});
console.log(`   ✅ Validated ${SAMPLE_NOTES.length} educational study note sets.`);

// Test 4: Test JSON extraction and fallback parsing
console.log('4️⃣ Testing JSON parsing utilities in QvacService...');
const validJsonArray = JSON.stringify([
  { question: 'What is a process?', answer: 'An executing program instance.' }
]);
const parsedArray = qvacService._extractJsonArray(validJsonArray);
assert.strictEqual(parsedArray.length, 1);
assert.strictEqual(parsedArray[0].question, 'What is a process?');

// Test markdown wrapped JSON
const markdownWrapped = '```json\n[{"question": "Q1", "answer": "A1"}]\n```';
const parsedMarkdown = qvacService._extractJsonArray(markdownWrapped);
assert.strictEqual(parsedMarkdown.length, 1);
assert.strictEqual(parsedMarkdown[0].question, 'Q1');

// Test JSON object extraction for evaluator
const validJsonObject = JSON.stringify({
  score: 92,
  verdict: 'Excellent',
  feedback: 'Comprehensive recall of key points.'
});
const parsedObj = qvacService._extractJsonObject(validJsonObject);
assert.strictEqual(parsedObj.score, 92);
console.log('   ✅ JSON extraction routines handle raw and markdown-embedded outputs reliably.');

// Test 5: Verify status structure
console.log('5️⃣ Testing qvacService status reporting...');
const status = qvacService.getStatus();
assert.strictEqual(typeof status.loaded, 'boolean');
assert.ok(Array.isArray(status.supportedModels));
console.log('   ✅ Engine status schema is correct.');

console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! Ready for execution.\n');
