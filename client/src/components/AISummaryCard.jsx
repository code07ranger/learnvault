import React, { useState } from 'react';
import { Sparkles, HelpCircle, Lightbulb, Compass, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

const cleanText = (txt) => {
  if (!txt) return '';
  return txt
    .replace(/^(📌|🔍|💡|🧠)?\s*(Executive Snapshot:|Core Focus & Framework:|Practical Impact & Application:|Practical Impact & Relevance:|Beginner Intuition & Analogy:|Core Mechanics & Framework:)?\s*/gi, '')
    .replace(/^#+\s+/gm, '')
    .replace(/^[\s\-*#]+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/---/g, '')
    .trim();
};

export default function AISummaryCard({ notebook, onSummaryUpdated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiSummary, setAiSummary] = useState(notebook?.ai_summary || null);

  if (!notebook) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
        <Sparkles size={36} style={{ color: 'var(--neon-green)', margin: '0 auto 12px auto' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>No Note Selected</h3>
        <p style={{ fontSize: '13.5px' }}>Please select or open a note to generate its AI Summary.</p>
      </div>
    );
  }

  const handleGenerateSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/generate-ai-summary', {
        id: notebook.id,
        title: notebook.title,
        subject: notebook.subject,
        content: notebook.raw_content || notebook.executive_summary
      });

      if (res.data && res.data.aiSummary) {
        setAiSummary(res.data.aiSummary);
        if (onSummaryUpdated) {
          onSummaryUpdated(notebook.id, res.data.aiSummary);
        }
      } else {
        throw new Error('Invalid response structure received');
      }
    } catch (err) {
      console.error('AI Summary Error:', err);
      setError(err.response?.data?.error || 'Unable to generate AI Summary at this moment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displaySummary = aiSummary || notebook.ai_summary;

  return (
    <div className="card" style={{ border: '1.5px solid rgba(0, 255, 135, 0.35)', position: 'relative' }}>
      {/* Card Header & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--neon-green)', background: 'var(--neon-green-dim)', padding: '3px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>
            {notebook.subject}
          </span>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginTop: '6px' }}>{notebook.title}</h2>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleGenerateSummary}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
        >
          {loading ? (
            <>
              <RefreshCw size={16} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Analyzing Note...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>{displaySummary ? 'Regenerate AI Summary' : 'Generate AI Summary'}</span>
            </>
          )}
        </button>
      </div>

      {/* Friendly Error Banner */}
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fca5a5', fontSize: '13.5px' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}
      {/* Structured AI Summary Output */}
      {displaySummary ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. Simple Summary */}
          <div style={{ background: 'rgba(0, 255, 135, 0.06)', borderLeft: '4px solid #00ff87', borderRadius: '8px', padding: '16px 20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#00ff87', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <BookOpen size={16} /> 1. Simple Summary
            </h4>
            <p style={{ fontSize: '14.5px', lineHeight: '1.65', color: 'var(--text-main)' }}>
              {cleanText(displaySummary.simple_summary)}
            </p>
          </div>

          {/* 2. What this note is mainly about */}
          <div style={{ background: 'rgba(6, 182, 212, 0.06)', borderLeft: '4px solid #06b6d4', borderRadius: '8px', padding: '16px 20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Compass size={16} /> 2. What This Note is Mainly About
            </h4>
            <p style={{ fontSize: '14.5px', lineHeight: '1.65', color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
              {cleanText(displaySummary.main_about)}
            </p>
          </div>

          {/* 3. Why this matters */}
          <div style={{ background: 'rgba(245, 158, 11, 0.06)', borderLeft: '4px solid #f59e0b', borderRadius: '8px', padding: '16px 20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Lightbulb size={16} /> 3. Why This Matters
            </h4>
            <p style={{ fontSize: '14.5px', lineHeight: '1.65', color: 'var(--text-main)' }}>
              {cleanText(displaySummary.why_it_matters)}
            </p>
          </div>

          {/* 4. Simple explanation for a beginner */}
          <div style={{ background: 'rgba(168, 85, 247, 0.06)', borderLeft: '4px solid #a855f7', borderRadius: '8px', padding: '16px 20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#a855f7', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <HelpCircle size={16} /> 4. Simple Explanation for a Beginner
            </h4>
            <p style={{ fontSize: '14.5px', lineHeight: '1.65', color: 'var(--text-main)', fontStyle: 'italic' }}>
              "{cleanText(displaySummary.beginner_explanation)}"
            </p>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255, 255, 255, 0.02)', border: '1px stroke var(--border-muted)', borderRadius: 'var(--radius-lg)' }}>
          <Sparkles size={32} style={{ color: 'var(--text-dim)', marginBottom: '12px' }} />
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Ready to generate AI Summary</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 16px auto' }}>
            Click the "Generate AI Summary" button above to generate a simple learner-friendly 4-point breakdown with extra context.
          </p>
        </div>
      )}
    </div>
  );
}
