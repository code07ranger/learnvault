import React from 'react';
import { BookOpen, Flame, Tag, History } from 'lucide-react';

export default function StatCardsRow({ notebooks = [] }) {
  // Calculate dynamic stats
  const totalNotes = notebooks.length;
  
  // High Priority Notes count (assuming priority stored or notes count)
  const highPriorityNotes = notebooks.filter(n => n.priority === 'High Priority' || n.subject?.toLowerCase().includes('high')).length;

  // Unique topics/subjects this week
  const topicsSet = new Set(notebooks.map(n => n.subject).filter(Boolean));
  const topicsCount = topicsSet.size;

  // Pending learning tasks count
  const pendingTasksCount = notebooks.flatMap(n => n.action_takeaways || []).length;

  return (
    <div className="stat-cards-grid">
      {/* Card 1: Total Notes Saved */}
      <div className="stat-card stat-card-green">
        <div className="stat-icon-wrapper stat-icon-green">
          <BookOpen size={22} />
        </div>
        <div className="stat-content">
          <div className="stat-number">{totalNotes}</div>
          <div className="stat-label">Total Notes Saved</div>
        </div>
      </div>

      {/* Card 2: High-Priority Notes */}
      <div className="stat-card stat-card-amber">
        <div className="stat-icon-wrapper stat-icon-amber">
          <Flame size={22} />
        </div>
        <div className="stat-content">
          <div className="stat-number">{highPriorityNotes}</div>
          <div className="stat-label">High-Priority Notes</div>
        </div>
      </div>

      {/* Card 3: This Week's Topics */}
      <div className="stat-card stat-card-cyan">
        <div className="stat-icon-wrapper stat-icon-cyan">
          <Tag size={22} />
        </div>
        <div className="stat-content">
          <div className="stat-number">{topicsCount}</div>
          <div className="stat-label">This Week's Topics</div>
        </div>
      </div>

      {/* Card 4: Pending Learning Tasks */}
      <div className="stat-card stat-card-purple">
        <div className="stat-icon-wrapper stat-icon-purple">
          <History size={22} />
        </div>
        <div className="stat-content">
          <div className="stat-number">{pendingTasksCount}</div>
          <div className="stat-label">Pending Learning Tasks</div>
        </div>
      </div>
    </div>
  );
}
