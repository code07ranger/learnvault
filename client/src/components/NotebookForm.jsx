import React, { useState } from 'react';
import { Sparkles, FileText, UploadCloud, BookOpen, Wand2, HelpCircle, Loader2, Cpu } from 'lucide-react';
import api from '../services/api';

const SAMPLE_NOTEBOOKS = [
  {
    title: 'Operating Systems - Process Scheduling',
    subject: 'Computer Science',
    content: `Process scheduling is an essential OS mechanism to maximize CPU utilization. 
CPU schedulers decide which process in the ready queue gets the CPU next.
Key algorithms include:
1. First-Come, First-Served (FCFS): Simple FIFO queue, but suffers from the convoy effect.
2. Shortest Job First (SJF): Optimal average waiting time, but difficult to predict next CPU burst time.
3. Round Robin (RR): Time quantum driven preemptive scheduling designed for time-sharing.
4. Multilevel Queue Scheduling: Processes assigned to queues based on priority (e.g., interactive vs batch).`
  },
  {
    title: 'React Hooks & State Architecture',
    subject: 'Web Development',
    content: `React Hooks allow functional components to manage state and side effects.
Core Hooks:
- useState: Declares local component state variables.
- useEffect: Handles side effects like data fetching, subscriptions, and DOM updates.
- useContext: Subscribes to React Context without nesting render props.
Rules of Hooks:
1. Only call Hooks at the top level (do not call inside loops or conditions).
2. Only call Hooks from React function components or custom Hooks.`
  },
  {
    title: 'Machine Learning - Supervised Learning',
    subject: 'Artificial Intelligence',
    content: `Supervised Machine Learning algorithms map input variables (X) to output target variables (Y).
Common Task Types:
- Classification: Predicts discrete categorical labels (e.g. Spam detection).
- Regression: Predicts continuous numerical values (e.g. House price estimation).
Popular Models: Linear Regression, Decision Trees, Random Forests, Support Vector Machines (SVM), and Neural Networks.`
  }
];

export default function NotebookForm({ onSummaryGenerated }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please paste text or upload a PDF notebook before summarizing.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/summarize', {
        title: title.trim() || 'Untitled Notebook',
        subject: subject.trim() || 'General Study',
        content
      });

      onSummaryGenerated(res.data.notebook);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate notebook summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setUploadingPdf(true);
      const formData = new FormData();
      formData.append('pdfFile', file);

      try {
        const res = await api.post('/extract-pdf', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        setContent(res.data.text);
        if (!title) {
          setTitle(res.data.title);
        }
      } catch (err) {
        setError('Could not parse text from this PDF. Make sure the PDF contains readable text.');
      } finally {
        setUploadingPdf(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        setContent(event.target.result);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsText(file);
    }
  };

  const loadSample = (sample) => {
    setTitle(sample.title);
    setSubject(sample.subject);
    setContent(sample.content);
    setError('');
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="card" style={{ border: loading ? '1.5px solid var(--neon-green)' : '1px solid var(--border-muted)' }}>
      {/* Header Title & Preset Chips */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={24} style={{ color: 'var(--neon-green)' }} />
            Input Notebook Content
          </h2>
          
          {/* Upload PDF Button */}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 800, color: 'var(--neon-cyan)', background: 'var(--neon-cyan-dim)', border: '1px solid rgba(6, 182, 212, 0.35)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'var(--transition)' }}>
            {uploadingPdf ? <Loader2 size={16} className="spin-slow" /> : <UploadCloud size={16} />}
            <span>{uploadingPdf ? 'Extracting PDF...' : 'Upload PDF'}</span>
            <input type="file" accept=".pdf,.txt,.md" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>
        
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
          Paste raw study notes or upload a <strong>PDF / text document</strong> for key point extraction:
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '14px' }}>
          {SAMPLE_NOTEBOOKS.map((s, i) => (
            <button
              key={i}
              type="button"
              className="chip"
              onClick={() => loadSample(s)}
            >
              <BookOpen size={13} /> {s.subject}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: '14px 18px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HelpCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        /* Futuristic AI Loading State */
        <div className="ai-loading-container" style={{ flex: 1 }}>
          <div className="ai-pulse-ring">
            <Cpu size={32} className="spin-slow" />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--neon-green)', marginBottom: '6px' }}>
              Engine Processing Notebook...
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
              Synthesizing key points and study definitions.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">
                <FileText size={15} style={{ color: 'var(--neon-green)' }} /> Notebook Title
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Operating Systems - CPU Scheduling"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Subject Tag
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Computer Science"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                <BookOpen size={15} style={{ color: 'var(--neon-green)' }} /> Raw Notes / Extracted Text
              </label>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>
                {wordCount} words
              </span>
            </div>
            <textarea
              className="form-control"
              rows={14}
              placeholder="Paste your raw study notes, lecture transcript, or upload a PDF document. Content will be structured into user-friendly key points!"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              style={{ fontSize: '14px', lineHeight: '1.65', flex: 1, minHeight: '320px', resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '18px', marginTop: '12px' }}
            disabled={loading || uploadingPdf}
          >
            <Wand2 size={22} />
            <span>Process Notebook into Key Points</span>
          </button>
        </form>
      )}
    </div>
  );
}
