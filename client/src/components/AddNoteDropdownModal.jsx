import React, { useState, useRef } from 'react';
import { 
  Plus, 
  X, 
  Download, 
  Sparkles, 
  Loader2,
  FileCheck
} from 'lucide-react';
import api from '../services/api';

export default function AddNoteDropdownModal({ onSummaryGenerated }) {
  const [modalOpen, setModalOpen] = useState(false);
  
  // Modal Form State
  const [noteTitle, setNoteTitle] = useState('');
  const [sourceType, setSourceType] = useState('Course Note');
  const [priority, setPriority] = useState('Medium Priority');
  const [topicTag, setTopicTag] = useState('');
  const [rawContent, setRawContent] = useState('');
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  const openModal = () => {
    setModalOpen(true);
    setError('');
  };

  const closeModal = () => {
    setModalOpen(false);
    setError('');
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setError('File size exceeds the 20MB limit. Please upload a smaller file.');
      return;
    }

    setSelectedFile(file);
    setError('');

    // Pre-fill title if empty
    if (!noteTitle) {
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setNoteTitle(fileNameWithoutExt);
    }

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setUploading(true);
      const formData = new FormData();
      formData.append('pdfFile', file);

      try {
        const res = await api.post('/extract-pdf', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data && res.data.text) {
          setRawContent(res.data.text);
        } else {
          setRawContent(`Study Note File: ${file.name}`);
        }
      } catch (err) {
        console.warn('PDF Upload Extraction Warning:', err);
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setRawContent(`PDF Study Document: ${file.name}\nTopic: ${fileNameWithoutExt}`);
      } finally {
        setUploading(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRawContent(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadFile = () => {
    if (!selectedFile && !rawContent) return;

    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([rawContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${noteTitle || 'note-content'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleProcessSubmit = async (e) => {
    e.preventDefault();
    if (!rawContent.trim()) {
      setError('Please choose a PDF / document file to upload before saving.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const res = await api.post('/summarize', {
        title: noteTitle.trim() || 'New Learning Note',
        subject: topicTag.trim() || 'General Learning',
        priority: priority,
        sourceType: sourceType,
        content: rawContent.trim()
      });

      onSummaryGenerated(res.data.notebook);
      setModalOpen(false);
      // Reset form
      setNoteTitle('');
      setTopicTag('');
      setRawContent('');
      setSelectedFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process note with LearnVault AI.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* 1. Direct Add New Note Button */}
      <button 
        className="btn-add-new-note"
        onClick={openModal}
      >
        <Plus size={18} />
        <span>Add New Note</span>
      </button>

      {/* 2. Popup Modal Window */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-container-card">
            {/* Header */}
            <div className="modal-header">
              <h3 className="modal-title">Save New Learning Note</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleProcessSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Note Title Input */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label-modal">Note Title</label>
                <input
                  type="text"
                  className="form-control-modal"
                  placeholder=""
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                />
              </div>

              {/* Source Type & Priority Controls */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label-modal">Source Type</label>
                  <select
                    className="form-control-modal select-custom"
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value)}
                  >
                    <option value="Workshop Note">Workshop Note</option>
                    <option value="Course Note">Course Note</option>
                    <option value="Web Link">Web Link</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label-modal">Priority</label>
                  <select
                    className="form-control-modal select-custom"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="High Priority">High Priority</option>
                    <option value="Medium Priority">Medium Priority</option>
                    <option value="Low Priority">Low Priority</option>
                  </select>
                </div>
              </div>

              {/* Topic / Tag Input */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label-modal">Topic / Tag</label>
                <input
                  type="text"
                  className="form-control-modal"
                  placeholder="e.g. Artificial Intelligence"
                  value={topicTag}
                  onChange={(e) => setTopicTag(e.target.value)}
                />
              </div>

              {/* PDF Document Drag & Drop Upload Zone */}
              <div className="upload-dropzone-card">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md,.doc,.docx"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                
                <h4 className="upload-dropzone-title">Upload Document</h4>

                <button
                  type="button"
                  className="btn-add-files-dark"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 size={16} className="spin-slow" /> : <Plus size={16} />}
                  <span>{uploading ? 'Extracting File...' : 'Choose File'}</span>
                </button>
              </div>

              {/* Uploaded Document Info & Download Option */}
              {selectedFile && (
                <div className="uploaded-file-banner">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileCheck size={20} style={{ color: 'var(--neon-green)' }} />
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {selectedFile.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Content extracted
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-download-file"
                    onClick={handleDownloadFile}
                    title="Download uploaded document"
                  >
                    <Download size={15} />
                    <span>Download</span>
                  </button>
                </div>
              )}

              {error && (
                <div style={{ color: 'var(--accent-red)', fontSize: '13px', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--accent-red)', padding: '10px 14px', borderRadius: '8px' }}>
                  {error}
                </div>
              )}

              {/* Footer Modal Actions */}
              <div className="modal-footer-actions">
                <button type="button" className="btn-modal-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-process"
                  disabled={processing || uploading}
                >
                  {processing ? (
                    <>
                      <Loader2 size={18} className="spin-slow" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Save Note & Key Points</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
