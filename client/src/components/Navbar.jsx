import React from 'react';
import { BookOpen, History, Plus, LayoutDashboard } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, notebookCount }) {
  return (
    <header className="navbar">
      <div className="container navbar-container">
        {/* Brand Logo & Tagline */}
        <div className="brand" onClick={() => setActiveTab('new')}>
          <div className="brand-icon">
            <BookOpen size={24} />
          </div>
          <div>
            <span className="brand-title">
              LearnVault <span className="brand-accent">AI</span>
            </span>
            <div className="brand-subtitle">
              An AI second brain for learners.
            </div>
          </div>
        </div>

        {/* Action Controls with Dark Neon Glow when switched */}
        <div className="navbar-actions">
          <button
            className={`btn ${activeTab === 'new' ? 'btn-neon-active' : 'btn-secondary'}`}
            onClick={() => setActiveTab('new')}
          >
            <Plus size={16} />
            <span>Summarize New</span>
          </button>

          <button
            className={`btn ${activeTab === 'history' ? 'btn-neon-active' : 'btn-secondary'}`}
            onClick={() => setActiveTab('history')}
            style={{ position: 'relative' }}
          >
            <History size={16} />
            <span>Vault History</span>
            {notebookCount > 0 && (
              <span className="vault-count-badge">
                {notebookCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
