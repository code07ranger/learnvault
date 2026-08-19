import React from 'react';
import { BookOpen, Flame, Zap, Sparkles } from 'lucide-react';

export default function StatCardsRow({ notebooks = [] }) {
  // 1. Total Notes Count (Real)
  const totalNotes = notebooks.length;
  
  // 2. High Priority Notes Count (Real)
  const highPriorityNotes = notebooks.filter(n => 
    n.priority === 'High Priority' || n.priority === 'high'
  ).length;

  // 3. Real AI Study Time Tracked (Sum of actual note reading time from saved notes)
  const totalReadMinutes = notebooks.reduce((sum, n) => {
    const min = typeof n.read_time_minutes === 'number' ? n.read_time_minutes : 1;
    return sum + min;
  }, 0);

  const displayTimeSaved = totalNotes === 0 
    ? '0.0 hrs' 
    : totalReadMinutes < 60 
      ? `${totalReadMinutes} mins` 
      : `${(totalReadMinutes / 60).toFixed(1)} hrs`;

  // 4. Real Active Study Streak (Calculated strictly from note upload dates YYYY-MM-DD)
  const calculateStreak = () => {
    if (notebooks.length === 0) return 0;

    // Collect all unique local YYYY-MM-DD dates from notebooks
    const uploadDates = new Set(
      notebooks.map(n => {
        const d = new Date(n.created_at || Date.now());
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })
    );

    const today = new Date();
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    let checkDate = new Date(today);
    let todayStr = formatDate(checkDate);

    // If no upload today yet, check if yesterday had an upload to preserve ongoing streak
    if (!uploadDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = formatDate(checkDate);
      if (!uploadDates.has(yesterdayStr)) {
        return 0; // Streak reset if no activity today or yesterday
      }
    }

    // Count consecutive active days
    let streakCount = 0;
    while (uploadDates.has(formatDate(checkDate))) {
      streakCount++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streakCount;
  };

  const streakDays = calculateStreak();

  return (
    <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
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

      {/* Card 3: AI Time Saved */}
      <div className="stat-card stat-card-cyan">
        <div className="stat-icon-wrapper stat-icon-cyan">
          <Zap size={22} />
        </div>
        <div className="stat-content">
          <div className="stat-number">{displayTimeSaved}</div>
          <div className="stat-label">AI Study Time Saved</div>
        </div>
      </div>

      {/* Card 4: Study Streak */}
      <div className="stat-card stat-card-purple">
        <div className="stat-icon-wrapper stat-icon-purple">
          <Sparkles size={22} />
        </div>
        <div className="stat-content">
          <div className="stat-number">
            {streakDays > 0 ? `${streakDays}-Day 🔥` : '0-Day'}
          </div>
          <div className="stat-label">Active Study Streak</div>
        </div>
      </div>
    </div>
  );
}
