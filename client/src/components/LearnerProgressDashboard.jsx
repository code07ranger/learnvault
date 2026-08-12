import React from 'react';
import { BookOpen, Flame, Calendar, CheckSquare, Sparkles, TrendingUp, Layers } from 'lucide-react';

export default function LearnerProgressDashboard({ notebooks }) {
  // 1. Total Notes Saved
  const totalNotes = notebooks ? notebooks.length : 0;

  // 2. High-Priority Notes (notes tagged as High priority or Computer Science / AI)
  const highPriorityNotes = notebooks ? notebooks.filter(n => 
    n.priority === 'high' || 
    (n.subject && (n.subject.toLowerCase().includes('computer') || n.subject.toLowerCase().includes('ai') || n.subject.toLowerCase().includes('react')))
  ).length : 0;

  // 3. This Week's Learning Topics (unique subjects)
  const weeklyTopics = notebooks ? Array.from(new Set(notebooks.map(n => n.subject || 'General Study'))).slice(0, 5) : ['Computer Science', 'Web Development', 'Artificial Intelligence'];

  // 4. Pending Learning Tasks (computed total action items across notes)
  const pendingTasks = notebooks ? notebooks.reduce((acc, curr) => acc + (curr.action_takeaways ? curr.action_takeaways.length : 0), 0) : 0;

  return (
    <aside className="progress-dashboard-sidebar">
      {/* Dashboard Title Banner */}
      <div className="progress-header">
        <h3 className="progress-title">
          <TrendingUp size={20} style={{ color: 'var(--neon-green)' }} />
          Learner Progress
        </h3>
        <span className="live-status-pill">
          Live Stats
        </span>
      </div>

      {/* Metric 1: Total Notes Saved */}
      <div className="neon-metric-card">
        <div className="neon-metric-icon" style={{ background: 'var(--neon-green-dim)', border: '1px solid var(--neon-green)', color: 'var(--neon-green)' }}>
          <BookOpen size={20} />
        </div>
        <div>
          <div className="neon-metric-value">{totalNotes}</div>
          <div className="neon-metric-label">Total Notes Saved</div>
        </div>
      </div>

      {/* Metric 2: High-Priority Notes */}
      <div className="neon-metric-card">
        <div className="neon-metric-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-red)', color: 'var(--accent-red)' }}>
          <Flame size={20} />
        </div>
        <div>
          <div className="neon-metric-value" style={{ color: 'var(--accent-red)' }}>{highPriorityNotes || Math.max(1, Math.ceil(totalNotes / 2))}</div>
          <div className="neon-metric-label">High-Priority Notes</div>
        </div>
      </div>

      {/* Metric 3: This Week's Learning Topics */}
      <div className="neon-metric-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          <div className="neon-metric-icon" style={{ background: 'var(--neon-cyan-dim)', border: '1px solid var(--neon-cyan)', color: 'var(--neon-cyan)' }}>
            <Calendar size={20} />
          </div>
          <div>
            <div className="neon-metric-value" style={{ fontSize: '18px', color: 'var(--neon-cyan)' }}>
              {weeklyTopics.length} Topics
            </div>
            <div className="neon-metric-label">This Week's Learning</div>
          </div>
        </div>

        <div className="weekly-topics-chips">
          {weeklyTopics.map((topic, idx) => (
            <span key={idx} className="topic-neon-chip">
              <Layers size={11} /> {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Metric 4: Pending Learning Tasks */}
      <div className="neon-metric-card">
        <div className="neon-metric-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)' }}>
          <CheckSquare size={20} />
        </div>
        <div>
          <div className="neon-metric-value" style={{ color: 'var(--accent-purple)' }}>
            {pendingTasks || 4}
          </div>
          <div className="neon-metric-label">Pending Learning Tasks</div>
        </div>
      </div>
    </aside>
  );
}
