import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { BookOpen, Search, Trash2, Clock, Eye, Sparkles } from 'lucide-react';

export default function VaultHistory({ onSelectNotebook }) {
  const [notebooks, setNotebooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchNotebooks = async () => {
    try {
      const res = await api.get('/notebooks');
      setNotebooks(res.data.notebooks || []);
    } catch (err) {
      console.error('Error fetching vault notebooks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this notebook from your vault?')) return;

    try {
      await api.delete(`/notebooks/${id}`);
      fetchNotebooks();
    } catch (err) {
      alert('Failed to delete notebook');
    }
  };

  const filtered = notebooks.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Notebook Vault</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Access all your past study notes and key points breakdown.
          </p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Filter by title or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
          <p>No notebooks found in your vault.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((nb) => (
            <div
              key={nb.id}
              className="card"
              onClick={() => onSelectNotebook(nb)}
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px' }}
            >
              <div style={{ flex: 1, paddingRight: '20px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--neon-green)', background: 'var(--neon-green-dim)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                    {nb.subject}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {new Date(nb.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>{nb.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '600px' }}>
                  {nb.raw_content || 'No description provided.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectNotebook(nb);
                  }}
                >
                  <Eye size={14} /> View
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--accent-red)' }}
                  onClick={(e) => handleDelete(nb.id, e)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
