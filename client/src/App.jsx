import React, { useState, useEffect } from 'react';
import SidebarNav from './components/SidebarNav';
import SummaryCard from './components/SummaryCard';
import AddNoteDropdownModal from './components/AddNoteDropdownModal';
import StatCardsRow from './components/StatCardsRow';
import VaultHistory from './pages/VaultHistory';
import api from './services/api';
import { CheckSquare, BookOpen } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'notes' | 'tasks'
  const [currentSummary, setCurrentSummary] = useState(null);
  const [notebooks, setNotebooks] = useState([]);

  const fetchVault = async () => {
    try {
      const res = await api.get('/notebooks');
      setNotebooks(res.data.notebooks || []);
      if (!currentSummary && res.data.notebooks?.length > 0) {
        setCurrentSummary(res.data.notebooks[0]);
      }
    } catch (err) {
      console.error('Error fetching vault:', err);
    }
  };

  useEffect(() => {
    fetchVault();
  }, []);

  const handleSummaryGenerated = (notebook) => {
    setCurrentSummary(notebook);
    fetchVault();
    setActiveTab('dashboard');
  };

  const handleSelectFromHistory = (notebook) => {
    setCurrentSummary(notebook);
    setActiveTab('dashboard');
  };

  return (
    <div className="app-layout">
      {/* Left Sidebar Navigation */}
      <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace Area */}
      <div className="main-wrapper-sidebar">
        <main className="page-content-area">
          {/* Header Action Bar with Dedicated Add New Note Button */}
          <div className="workspace-header-bar">
            <div>
              <h1 className="workspace-title">LearnVault Dashboard</h1>
              <p className="workspace-subtitle">
                Organize, extract, and review your study notes and key concepts.
              </p>
            </div>
            
            <AddNoteDropdownModal onSummaryGenerated={handleSummaryGenerated} />
          </div>

          {activeTab === 'dashboard' && (
            <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Stat Cards Row (Total Notes, High Priority, Topics, Pending Tasks) */}
              <StatCardsRow notebooks={notebooks} />

              {currentSummary && (
                <SummaryCard notebook={currentSummary} />
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <VaultHistory onSelectNotebook={handleSelectFromHistory} />
          )}

          {activeTab === 'tasks' && (
            <div className="card" style={{ maxWidth: '960px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '8px' }}>Action Tasks & Action Items</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginBottom: '24px' }}>
                All action items extracted from your study notes.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notebooks.flatMap(n => n.action_takeaways || []).length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
                    No action tasks created yet. Click "Add New Note" to create study action items!
                  </p>
                ) : (
                  notebooks.flatMap(n => (n.action_takeaways || []).map((t, idx) => ({ task: t, note: n.title, id: `${n.id}-${idx}` }))).map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', background: 'rgba(255, 255, 255, 0.025)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)' }}>
                      <CheckSquare size={18} style={{ color: 'var(--neon-green)' }} />
                      <div>
                        <div style={{ fontSize: '14.5px', fontWeight: 700 }}>{item.task}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>Note: {item.note}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

