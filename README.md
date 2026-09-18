# QvacStudy

On-device AI study tool and active-recall engine powered by Tether's open-source QVAC SDK (`@qvac/sdk`).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Tether QVAC SDK](https://img.shields.io/badge/Powered%20By-Tether%20QVAC%20SDK%20(%3E=0.19.0)-00f0ff.svg)](https://qvac.tether.io)
[![100% Local](https://img.shields.io/badge/Inference-100%25%20On--Device%20(Offline)-10b981.svg)](#technical-overview)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B%20%7C%20v20%2B%20%7C%20v22%2B%20%7C%20v24%2B-green.svg)](https://nodejs.org/)

QvacStudy is an on-device AI study tool that turns personal lecture notes and documents into interactive flashcards, practice quizzes, and an intelligent tutor without cloud inference. It calls the QVAC SDK's `loadModel`, `completion` (streaming token generation), `ragIngest` / `ragSearch` (local vector search), and `unloadModel` functions.

All processing occurs entirely on local hardware (CPU/GPU). No user data is sent over the network, no external API keys are required, and no subscription fees or cloud inference costs are incurred.

---



- **Declared Dependency**: `@qvac/sdk` declared in `package.json` (`^0.19.1`).
- **Required SDK Functions**: Calls `loadModel`, `completion`, `ragIngest`, `ragSearch`, and `unloadModel`.
- **Privacy & Execution**: 100% on-device inference with zero cloud AI API dependencies.
- **Repository**: Public open-source repository licensed under MIT.

---

## License

MIT License. See [LICENSE](LICENSE) for full details.
