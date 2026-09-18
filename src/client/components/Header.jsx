import React from 'react';
import { FiLock, FiCpu, FiVolume2, FiVolumeX, FiRefreshCw } from 'react-icons/fi';
import { TbBrain, TbSparkles } from 'react-icons/tb';

export default function Header({
  status,
  isAudioEnabled,
  onToggleAudio,
  selectedModel,
  onSelectModel,
  onLoadModel,
  isLoadingModel
}) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-icon">
          <TbBrain size={26} />
        </div>
        <div className="brand-text">
          <h1>
            QvacStudy <span className="badge-accent"><TbSparkles size={11} style={{ marginRight: 2 }} />AI</span>
          </h1>
          <p className="subtitle">On-Device Note Quizzer • Powered by Tether QVAC</p>
        </div>
      </div>

      <div className="header-actions">
        {/* On-Device Privacy Badge */}
        <div className="privacy-pill" title="Inference runs 100% on your CPU/GPU. No data leaves your machine.">
          <span className="pulse-dot"></span>
          <FiLock size={13} />
          <span>On-Device • Zero Cloud</span>
        </div>

        {/* Model Selector & Status */}
        <div className="model-badge">
          <span className={`model-status-icon ${isLoadingModel ? 'loading' : ''}`}></span>
          <FiCpu size={14} style={{ color: 'var(--text-muted)' }} />
          <select
            value={selectedModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="model-dropdown"
          >
            <option value="QWEN3_600M_INST_Q4">Qwen 3 (600M Q4) - Fast</option>
            <option value="LLAMA_3_2_1B_INST_Q4_0">Llama 3.2 (1B Q4) - Deep</option>
          </select>
          <button
            onClick={onLoadModel}
            disabled={isLoadingModel}
            className="btn-sm btn-ghost"
            title="Load or reload on-device model"
          >
            <FiRefreshCw size={13} className={isLoadingModel ? 'spin-icon' : ''} />
            <span>{isLoadingModel ? 'Loading...' : status?.loaded ? 'Loaded' : 'Load'}</span>
          </button>
        </div>

        {/* Audio Sound Effects Toggle */}
        <button
          onClick={onToggleAudio}
          className="icon-btn"
          title={isAudioEnabled ? 'Mute sound effects' : 'Enable sound effects'}
        >
          {isAudioEnabled ? <FiVolume2 size={18} /> : <FiVolumeX size={18} style={{ opacity: 0.5 }} />}
        </button>
      </div>
    </header>
  );
}
