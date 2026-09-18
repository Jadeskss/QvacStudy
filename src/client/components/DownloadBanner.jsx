import React from 'react';
import { FiDownloadCloud, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function DownloadBanner({ progress }) {
  if (!progress || (!progress.isDownloading && progress.percentage === 0 && !progress.error)) {
    return null;
  }

  const mb = (n) => (n / 1e6).toFixed(1);

  return (
    <div className="download-banner">
      <div className="banner-content">
        <div className="banner-info">
          {progress.stage === 'error' ? (
            <FiAlertCircle size={24} style={{ color: 'var(--accent-rose)' }} />
          ) : progress.percentage >= 100 ? (
            <FiCheckCircle size={24} style={{ color: 'var(--accent-emerald)' }} />
          ) : (
            <span className="spinner"></span>
          )}
          <div className="banner-text">
            <strong>
              {progress.stage === 'error'
                ? 'Model Load Alert'
                : progress.stage === 'loading_memory'
                ? 'Mounting Model into Memory...'
                : progress.percentage >= 100
                ? 'Model Ready in Local Memory'
                : 'Downloading On-Device Model...'}
            </strong>
            <span>
              {progress.error
                ? progress.error
                : progress.percentage >= 100
                ? 'Inference running locally on your device'
                : progress.downloaded
                ? `Retrieved ${mb(progress.downloaded)} MB / ${mb(progress.total)} MB directly from Tether registry`
                : 'Connecting to peer-to-peer registry...'}
            </span>
          </div>
        </div>

        <div className="progress-wrap">
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(100, Math.max(5, progress.percentage || 0))}%` }}
            ></div>
          </div>
          <span className="progress-pct">{Math.round(progress.percentage || 0)}%</span>
        </div>
      </div>
    </div>
  );
}
