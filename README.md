# QvacStudy

On-device AI study tool and active-recall engine powered by Tether's open-source QVAC SDK (`@qvac/sdk`).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Tether QVAC SDK](https://img.shields.io/badge/Powered%20By-Tether%20QVAC%20SDK%20(%3E=0.19.0)-00f0ff.svg)](https://qvac.tether.io)
[![100% Local](https://img.shields.io/badge/Inference-100%25%20On--Device%20(Offline)-10b981.svg)](#technical-overview)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B%20%7C%20v20%2B%20%7C%20v22%2B%20%7C%20v24%2B-green.svg)](https://nodejs.org/)

QvacStudy is an on-device AI study tool that turns personal lecture notes and documents into interactive flashcards, practice quizzes, and an intelligent tutor without cloud inference. It calls the QVAC SDK's `loadModel`, `completion` (streaming token generation), `ragIngest` / `ragSearch` (local vector search), and `unloadModel` functions.

All processing occurs entirely on local hardware (CPU/GPU). No user data is sent over the network, no external API keys are required, and no subscription fees or cloud inference costs are incurred.

---

## Technical Overview

| Capability | Implementation |
| :--- | :--- |
| Core AI Runtime | Tether QVAC SDK (`@qvac/sdk` >= 0.19.0) |
| Local Inference Engine | Bare C++ runtime / llama.cpp on-device execution |
| Primary Models | Qwen 2.5/3 600M Instruct (Q4), Llama 3.2 1B Instruct (Q4) |
| Vector Retrieval | GTE-Large embeddings via `ragIngest` & `ragSearch` |
| Application Server | Node.js, Express, Server-Sent Events (SSE) |
| Frontend Stack | React 19, Vite, Vanilla CSS design system |
| Document Ingestion | PDF (`pdf-parse`), Word (`mammoth`), Markdown, Plain Text |
| Client Storage | Browser `localStorage` for offline study history and session persistence |

---

## Core Features

### 1. Interactive 3D Flashcards
- Automatically extracts key terminology, core mechanisms, and definitions from source materials.
- Generates high-yield study decks (5+ cards per set).
- Interactive 3D flip interaction with keyboard shortcut support (`Space` to flip).
- Spaced-repetition scoring: Again, Hard, Good, and Easy.

### 2. Multi-Choice Quiz Engine
- Synthesizes 5-question active-recall assessments directly from notes.
- Four distinct options per question with randomized distractor generation.
- Clear letter indicators (`A`, `B`, `C`, `D`), animated completion progress bar, and instant answer validation.
- Detailed conceptual explanations for correct and incorrect answers.
- Comprehensive completion summary with mastery percentage and scoring breakdown.

### 3. Open-Ended AI Answer Grader
- Tests conceptual recall with prompt challenges requiring students to answer in their own words.
- On-device evaluation scores responses (0-100%) and provides specific feedback on covered and missed concepts.

### 4. Interactive Study Tutor
- Real-time streaming conversational assistant grounded in the user's active document notes.
- Multi-turn context memory allows students to ask follow-up questions and request deeper explanations.
- Animated on-device thinking indicator and live token streaming cursor.
- Dynamic excerpt prioritization focuses local model reasoning on relevant sections for long documents.

### 5. Document Parser & Local History
- Drag-and-drop ingestion for PDF, DOCX, DOC, TXT, and Markdown files.
- Full client-side session management with persistent study history across browser reloads.
- Inline session renaming and deletion controls.

### 6. Terminal CLI Interface
- Complete headless CLI mode for running quizzes and study drills directly from terminal environments: `node cli.js --notes ./sample_notes.md`.

---

## System Architecture

```
+-------------------------------------------------------------+
|                         Client UI                           |
|      (React 19 + Vite + LocalStorage Session History)       |
+------------------------------+------------------------------+
                               | REST API & SSE Streams (:3000)
+------------------------------v------------------------------+
|                     Node.js Backend                         |
|     (src/server.js & src/engine/qvacService.js)             |
+------------------------------+------------------------------+
                               | Direct SDK Function Calls
+------------------------------v------------------------------+
|                      Tether QVAC SDK                        |
|  - loadModel()      -> Fetches & mounts GGUF in local RAM   |
|  - completion()     -> Token streaming via llama.cpp        |
|  - ragIngest()      -> Ingests text into local vector space |
|  - ragSearch()      -> Executes local semantic similarity   |
|  - unloadModel()    -> Releases memory upon request         |
+------------------------------+------------------------------+
                               | Bare Worker RPC
+------------------------------v------------------------------+
|                 On-Device Hardware Execution                |
|        (Local CPU / GPU Threads - Zero Cloud Egress)        |
+-------------------------------------------------------------+
```

---

## QVAC SDK Integration Details

The project integrates `@qvac/sdk` across its core engine (`src/engine/qvacService.js`):

- **Model Lifecycle (`loadModel`, `unloadModel`)**:
  Initializes on-device models (`QWEN3_600M_INST_Q4`, `LLAMA_3_2_1B_INST_Q4_0`) into memory. Exposes real-time download and allocation progress to the frontend via Server-Sent Events (SSE).
- **Token Generation (`completion`)**:
  Executes streaming inference for tutor conversations and structured JSON generation for active-recall quizzes and flashcard sets. Supports conversation history arrays for multi-turn dialogue.
- **Local RAG (`ragIngest`, `ragSearch`)**:
  Builds local vector embeddings via `GTE_LARGE_FP16` to enable semantic note indexing and retrieval without third-party vector databases.

---

## Installation & Setup

### Requirements
- Node.js 18.0.0 or higher (Node 20, 22, or 24 recommended)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Jadeskss/QvacStudy.git
cd QvacStudy
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build & Run the Web Application
```bash
# Compile frontend production bundle:
npm run build

# Start the local backend server:
npm start
```
The application will be accessible at `http://localhost:3000`.

For frontend development with Hot Module Replacement (HMR):
```bash
npm run dev
```

### 4. Run in Terminal CLI Mode
```bash
# Launch interactive CLI study session:
npm run cli

# Or quiz directly from a local notes file:
node cli.js --notes ./sample_notes.md
```

---

## Verification & Testing

Run the automated verification suite:
```bash
npm test
```

The test suite validates:
1. Dependency declaration: `@qvac/sdk` version `>= 0.19.0`.
2. Required SDK function exports: `loadModel`, `completion`, `unloadModel`, `ragIngest`, `ragSearch`.
3. Model constants and data integrity.
4. JSON extraction and schema validation routines.
5. Service status reporting schema.

---

## Submission Compliance Summary

- **Declared Dependency**: `@qvac/sdk` declared in `package.json` (`^0.19.1`).
- **Required SDK Functions**: Calls `loadModel`, `completion`, `ragIngest`, `ragSearch`, and `unloadModel`.
- **Privacy & Execution**: 100% on-device inference with zero cloud AI API dependencies.
- **Repository**: Public open-source repository licensed under MIT.

---

## License

MIT License. See [LICENSE](LICENSE) for full details.
