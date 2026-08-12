import React, { useState } from 'react';
import { CheckCircle2, Copy, FileText, BookOpen, Clock, ListOrdered, BookMarked, Check, Printer } from 'lucide-react';

export default function SummaryCard({ notebook }) {
  const [copied, setCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  if (!notebook) {
    return null;
  }

  const handleCopyAll = () => {
    const textToCopy = `Notebook: ${notebook.title}\nSubject: ${notebook.subject}\n\nKEY POINTS:\n` +
      notebook.key_points.map((kp, i) => `${i + 1}. ${kp.replace(/\*\*/g, '')}`).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportPDF = () => {
    // Generate clean, printable HTML document formatted specifically for PDF export
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export PDF');
      return;
    }

    const keyPointsHtml = (notebook.key_points || []).map((kp, idx) => {
      const parts = kp.split('**');
      const formatted = parts.length >= 3 
        ? `<strong>${parts[1]}</strong>${parts.slice(2).join('')}`
        : kp;
      return `<li style="margin-bottom: 12px; font-size: 14px; line-height: 1.6;">${formatted}</li>`;
    }).join('');

    const definitionsHtml = (notebook.key_definitions || []).map(def => `
      <div style="background: #f1f5f9; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 6px; margin-bottom: 10px;">
        <strong style="color: #0369a1; font-size: 14px;">${def.term}</strong>
        <p style="margin: 4px 0 0 0; color: #334155; font-size: 13px;">${def.definition}</p>
      </div>
    `).join('');

    const takeawaysHtml = (notebook.action_takeaways || []).map(t => `
      <li style="margin-bottom: 8px; font-size: 13.5px; color: #475569;">${t}</li>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${notebook.title} - LearnVault Note</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #0f172a;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            line-height: 1.6;
          }
          .header {
            border-bottom: 2px solid #00e676;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .badge {
            background: #dcfce7;
            color: #15803d;
            font-weight: 700;
            font-size: 11px;
            padding: 4px 10px;
            border-radius: 4px;
            text-transform: uppercase;
          }
          .title {
            font-size: 24px;
            font-weight: 800;
            margin: 10px 0 4px 0;
            color: #0f172a;
          }
          h3 {
            font-size: 16px;
            color: #0f172a;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-top: 24px;
          }
          ol {
            padding-left: 20px;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <span class="badge">${notebook.subject}</span>
          <h1 class="title">${notebook.title}</h1>
          <div style="font-size: 12px; color: #64748b;">
            LearnVault • ${new Date(notebook.created_at).toLocaleDateString()}
          </div>
        </div>

        <h3>🎯 Key Points Breakdown</h3>
        <ol>
          ${keyPointsHtml}
        </ol>

        ${notebook.key_definitions && notebook.key_definitions.length > 0 ? `
          <h3>📖 Key Definitions</h3>
          <div>${definitionsHtml}</div>
        ` : ''}

        ${notebook.action_takeaways && notebook.action_takeaways.length > 0 ? `
          <h3>📌 Recommended Study Action Items</h3>
          <ul>${takeawaysHtml}</ul>
        ` : ''}

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const toggleCheck = (idx) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="card" style={{ border: '1px solid var(--border-glow)' }}>
      {/* Toast Notification */}
      {copied && (
        <div className="toast-notification">
          <Check size={16} /> Content copied to clipboard!
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--neon-green)', background: 'var(--neon-green-dim)', padding: '4px 12px', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {notebook.subject}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} /> {notebook.read_time_minutes || 1} min read
            </span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', lineHeight: '1.3' }}>{notebook.title}</h2>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '12px' }} onClick={handleCopyAll}>
            {copied ? <Check size={14} style={{ color: 'var(--neon-green)' }} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '12px' }} onClick={handleExportPDF}>
            <Printer size={14} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Key Points List */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ListOrdered size={18} style={{ color: 'var(--neon-green)' }} />
          Key Points Breakdown ({notebook.key_points ? notebook.key_points.length : 0})
        </h3>

        <div className="key-points-list">
          {notebook.key_points && notebook.key_points.map((point, index) => {
            const parts = point.split('**');
            return (
              <div key={index} className="key-point-item">
                <div className="key-point-badge">{index + 1}</div>
                <div style={{ flex: 1 }}>
                  {parts.length >= 3 ? (
                    <span>
                      <strong style={{ color: 'var(--neon-green)', fontWeight: 700 }}>{parts[1]}</strong>
                      {parts.slice(2).join('')}
                    </span>
                  ) : (
                    <span>{point}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Definitions */}
      {notebook.key_definitions && notebook.key_definitions.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '14px', color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookMarked size={16} /> Key Definitions
          </h4>
          <div className="definitions-grid">
            {notebook.key_definitions.map((def, idx) => (
              <div key={idx} className="def-card">
                <div className="def-term">{def.term}</div>
                <div className="def-desc">{def.definition}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Study Action Items */}
      {notebook.action_takeaways && notebook.action_takeaways.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '20px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-main)' }}>
            📌 Interactive Study Action Items
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notebook.action_takeaways.map((item, idx) => (
              <div
                key={idx}
                onClick={() => toggleCheck(idx)}
                style={{
                  fontSize: '13.5px',
                  color: checkedItems[idx] ? 'var(--text-dim)' : 'var(--text-muted)',
                  textDecoration: checkedItems[idx] ? 'line-through' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: checkedItems[idx] ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                  transition: 'var(--transition)'
                }}
              >
                <CheckCircle2 size={16} style={{ color: checkedItems[idx] ? 'var(--neon-green)' : 'var(--text-dim)', flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
