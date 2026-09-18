# QvacStudy

> **On-device AI study tool & active-recall quizzer powered by Tether's open-source QVAC SDK (`@qvac/sdk`).**  
> 100% private, local inference. Zero cloud APIs, zero subscription fees, zero telemetry.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tether QVAC SDK](https://img.shields.io/badge/Tether%20QVAC%20SDK-v0.19.1-00f0ff.svg)](https://qvac.tether.io)
[![Inference: On-Device](https://img.shields.io/badge/Inference-100%25%20On--Device%20(Offline)-10b981.svg)](#privacy--on-device-inference)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B%20%7C%20v20%2B%20%7C%20v22%2B-green.svg)](https://nodejs.org/)

---

## 📌 Requirements & SDK Compliance Overview

This project is built directly for the **Tether QVAC bounty / verification specifications**:

| Requirement | Status | Verification Details |
| :--- | :---: | :--- |
| **Declared Dependency** | ✅ **Passed** | `@qvac/sdk` declared in `package.json` on version **`^0.19.1`** (>=0.19.0 required). |
| **SDK Functions Called** | ✅ **Passed** | Explicitly calls `loadModel`, `completion` (streaming token generation), `ragIngest`, `ragSearch`, and `unloadModel`. |
| **Valid SDK Functions** | ✅ **Passed** | All called functions (`loadModel`, `completion`, `ragIngest`, `ragSearch`, `unloadModel`) exist natively in `@qvac/sdk`. |
| **100% On-Device Inference** | ✅ **Passed** | Local GGUF models (`QWEN3_600M_INST_Q4`, `LLAMA_3_2_1B_INST_Q4_0`, `GTE_LARGE_FP16`). Zero cloud AI APIs, zero API keys. |
| **Open Source License** | ✅ **Passed** | Open-source under the permissive **MIT License** ([LICENSE](LICENSE)). |
| **Install & Run Steps** | ✅ **Passed** | Clear, step-by-step commands documented below for both Web UI and CLI. |
| **Commit History** | ✅ **Passed** | More than 3 commits in Git history, all authored by the repository creator (`Jadeskss`). |
| **Original Work** | ✅ **Passed** | Original active-recall study tool combining 3D flashcards, quizzes, document ingestion (PDF/DOCX/TXT), and interactive AI tutoring. |

---

## 🚀 SDK Version Used

- **Package**: `@qvac/sdk`
- **Version**: **`0.19.1`** (declared as `^0.19.1` in `package.json`)
- **Runtime**: Node.js v18.0.0+ (Bare / C++ native inference engine via Tether QVAC)

---

## 📥 Installation Steps

### Prerequisites
- **Node.js**: `v18.0.0` or newer (Node 20, 22, or 24 recommended)
- **Git**: Installed and available in your terminal

### Step 1: Clone the Repository
```bash
git clone https://github.com/Jadeskss/QvacStudy.git
cd QvacStudy
```

### Step 2: Install Dependencies
```bash
npm install
```
This installs `@qvac/sdk` (`^0.19.1`) along with Express and React dependencies.

---

## ⚡ Run Steps

You can run QvacStudy in two modes: the **Full Web Application** or the **Terminal CLI**.

### Mode 1: Web Application (Recommended)

#### Option A: Full Production Server (Single command)
```bash
# 1. Build the React frontend
npm run build

# 2. Launch the Express + QVAC engine server
npm start
```
Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

#### Option B: Development Mode (Hot Reloading)
Open two terminal tabs:
```bash
# Terminal 1 - Backend Server (Port 3000):
npm run server

# Terminal 2 - Vite Dev Server (Port 5173):
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

### Mode 2: Terminal CLI Mode

Run quizzes and test your knowledge directly in your terminal:

```bash
# Launch interactive CLI quizzer with built-in university notes:
npm run cli

# Or quiz directly from your own markdown or text notes file:
node cli.js --notes ./sample_notes.md
```

---

## 🧪 Automated Verification Test Suite

Run the automated test suite to verify dependencies, SDK function bindings, and parser integrity:

```bash
npm test
```

Expected output:
```text
🧪 Starting QvacStudy automated test suite...

1️⃣ Checking package.json requirements...
   ✅ @qvac/sdk dependency declared correctly: ^0.19.1
2️⃣ Verifying required QVAC SDK exports exist...
   ✅ All required QVAC SDK functions and constants verified.
3️⃣ Checking sample notes data integrity...
   ✅ Validated 4 educational study note sets.
4️⃣ Testing JSON parsing utilities in QvacService...
   ✅ JSON extraction routines handle raw and markdown-embedded outputs reliably.
5️⃣ Testing qvacService status reporting...
   ✅ Engine status schema is correct.

🎉 ALL TESTS PASSED SUCCESSFULLY! Ready for execution.
```

---

## 🛠️ Code Architecture & QVAC SDK Functions Called

All on-device AI operations are centralized in [`src/engine/qvacService.js`](src/engine/qvacService.js):

1. **`loadModel({ modelSrc, modelConfig, onProgress })`**
   - Loads local models (`QWEN3_600M_INST_Q4` or `LLAMA_3_2_1B_INST_Q4_0`) into memory with real-time download and allocation progress tracking.
2. **`completion({ modelId, history, stream: true, options })`**
   - Streams tokens on-device for the interactive AI tutor and generates structured JSON for flashcards and quizzes.
3. **`ragIngest({ modelId, workspace, documents, chunk: true })`**
   - Ingests and chunks long study notes into local vector embeddings using `GTE_LARGE_FP16`.
4. **`ragSearch({ modelId, workspace, query, topK })`**
   - Performs fast on-device semantic similarity searches to ground the AI tutor strictly in the user's notes.
5. **`unloadModel({ modelId })`**
   - Safely frees system RAM and GPU resources when switching topics or closing the session.

---

## 🔒 Privacy & On-Device Inference

- **Zero Network Egress**: All prompts, study notes, uploaded PDFs, and evaluations are processed locally on your hardware.
- **Zero API Keys**: No OpenAI, Anthropic, Gemini, or third-party cloud AI keys required.
- **Offline Capable**: Once model weights are locally cached, study sessions function completely offline.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free and open-source for personal, educational, and commercial use.
