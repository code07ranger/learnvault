import React, { useState, useEffect, useRef } from 'react';
import { Brain, PieChart, BookOpen, ListTodo, Sparkles } from 'lucide-react';

export default function SidebarNav({ activeTab, setActiveTab }) {
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  // Sync CSS variable --sidebar-width when sidebarWidth changes
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
  }, [sidebarWidth]);

  // Handle Mouse Down on Right Border Resizer Handle
  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // Handle Mouse Drag Move and Release
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      // Allow continuous drag-resize between 70px (compact icon-only) and 450px
      const newWidth = Math.min(Math.max(e.clientX, 70), 450);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Compact mode triggers when width is narrowed below 220px
  const isCompact = sidebarWidth < 220;

  return (
    <aside
      ref={sidebarRef}
      className={`sidebar-nav ${isResizing ? 'is-dragging' : ''} ${isCompact ? 'is-compact-sidebar' : ''}`}
      style={{ width: `${sidebarWidth}px` }}
    >
      {/* 1. App Logo - Clicking it routes to Dashboard */}
      <div className="sidebar-logo-container" onClick={() => setActiveTab('dashboard')} title="LearnVault AI">
        <div className="sidebar-logo-icon">
          <Brain size={24} />
        </div>
        {!isCompact && (
          <div className="sidebar-logo-text">
            <span>LearnVault</span>
            <span className="sidebar-ai-badge">AI</span>
          </div>
        )}
      </div>

      {/* 2. Menu Items */}
      <nav className="sidebar-menu" style={{ marginTop: '12px' }}>
        <button
          className={`sidebar-menu-item ${activeTab === 'dashboard' ? 'active-neon' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          title="Dashboard"
        >
          <PieChart size={20} style={{ flexShrink: 0 }} />
          {!isCompact && <span>Dashboard</span>}
        </button>

        <button
          className={`sidebar-menu-item ${activeTab === 'notes' ? 'active-neon' : ''}`}
          onClick={() => setActiveTab('notes')}
          title="Notes & Library"
        >
          <BookOpen size={20} style={{ flexShrink: 0 }} />
          {!isCompact && <span>Notes & Library</span>}
        </button>

        <button
          className={`sidebar-menu-item ${activeTab === 'tasks' ? 'active-neon' : ''}`}
          onClick={() => setActiveTab('tasks')}
          title="Action Tasks"
        >
          <ListTodo size={20} style={{ flexShrink: 0 }} />
          {!isCompact && <span>Action Tasks</span>}
        </button>
      </nav>

      {/* 3. Drag-to-Resize Right Border Handle */}
      <div
        className="sidebar-resizer-handle"
        onMouseDown={startResizing}
        title="Click and drag to adjust sidebar width"
      />
    </aside>
  );
}
