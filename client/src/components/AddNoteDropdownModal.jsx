import React, { useState, useRef } from 'react';
import { 
  Plus, 
  ChevronDown, 
  Video, 
  GraduationCap, 
  Link, 
  Upload, 
  X, 
  FileText, 
  Download, 
  ExternalLink, 
  Sparkles, 
  Loader2,
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';

export default function AddNoteDropdownModal({ onSummaryGenerated }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('Upload Document File'); // 'Workshop Note' | 'Course Note' | 'Web Link Note' | 'Upload Document File'
  
  // Modal Form State
  const [noteTitle, setNoteTitle] = useState('');
  const [sourceType, setSourceType] = useState('Uploaded File');
  const [priority, setPriority] = useState('Medium Priority');
  const [topicTag, setTopicTag] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [pdfLink, setPdfLink] = useState('');
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  const openModalWithType = (type) => {
    setModalType(type);
    setDropdownOpen(false);
    setModalOpen(true);
    setError('');
    
    // Set appropriate source type
    if (type === 'Workshop Note') setSourceType('Workshop Note');
    else if (type === 'Course Note') setSourceType('Course Note');
    else if (type === 'Web Link Note') setSourceType('Web Link');
    else setSourceType('Course Note');
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
        // Seamless fallback so the user can still submit and process their PDF note!
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

  const handleOpenPdfLink = () => {
    if (!pdfLink) return;
    let formattedUrl = pdfLink.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }
    window.open(formattedUrl, '_blank', 'noopener,noreferrer');
  };

  const handleProcessSubmit = async (e) => {
    e.preventDefault();
    if (!rawContent.trim() && !pdfLink.trim()) {
      setError('Please upload a file, enter a PDF link, or provide note content.');
      return;
    }

    setProcessing(true);
    setError('');

    let combinedContent = rawContent.trim();
    if (pdfLink.trim()) {
      combinedContent = `[PDF Document Resource Link]: ${pdfLink.trim()}\n\n` + combinedContent;
    }

    try {
      const res = await api.post('/summarize', {
        title: noteTitle.trim() || 'New Learning Note',
        subject: topicTag.trim() || 'General Learning',
        content: combinedContent
      });

      onSummaryGenerated(res.data.notebook);
      setModalOpen(false);
      // Reset form
      setNoteTitle('');
      setTopicTag('');
      setRawContent('');
      setPdfLink('');
      setSelectedFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process note with LearnVault AI.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* 1. Dedicated Green Button matching Image 1 */}
      <button 
        className="btn-add-new-note"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span>Add New Note</span>
        <ChevronDown size={16} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
      </button>

      {/* 2. Dropdown Menu matching Image 1 */}
      {dropdownOpen && (
        <>
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 490 }} 
            onClick={() => setDropdownOpen(false)} 
          />
          <div className="add-note-dropdown-menu">
            <button className="dropdown-item" onClick={() => openModalWithType('Workshop Note')}>
              <Video size={18} style={{ color: '#00ff87' }} />
              <span>Workshop Note</span>
            </button>
            <button className="dropdown-item" onClick={() => openModalWithType('Course Note')}>
              <GraduationCap size={18} style={{ color: '#06b6d4' }} />
              <span>Course Note</span>
            </button>
            <button className="dropdown-item" onClick={() => openModalWithType('Web Link Note')}>
              <Link size={18} style={{ color: '#f59e0b' }} />
              <span>Web Link Note</span>
            </button>
          </div>
        </>
      )}

      {/* 3. Popup Modal matching Image 2 & 3 */}
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
                
                <div className="folder-illustration-icon">
                  <div className="folder-back" />
                  <div className="folder-paper" />
                  <div className="folder-front" />
                </div>

                <h4 className="upload-dropzone-title">Upload PDF</h4>

                <button
                  type="button"
                  className="btn-add-files-dark"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 size={16} className="spin-slow" /> : <Plus size={16} />}
                  <span>{uploading ? 'Extracting File...' : 'Add files'}</span>
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
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for parsing
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

              {/* Designated PDF Link Section */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label-modal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>PDF / Resource Web Link (Designated Section)</span>
                  {pdfLink && (
                    <button
                      type="button"
                      onClick={handleOpenPdfLink}
                      style={{ background: 'none', border: 'none', color: 'var(--neon-cyan)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <ExternalLink size={12} /> Test Link
                    </button>
                  )}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="url"
                    className="form-control-modal"
                    placeholder="https://example.com/research-paper.pdf"
                    value={pdfLink}
                    onChange={(e) => setPdfLink(e.target.value)}
                    style={{ paddingRight: '40px' }}
                  />
                  <Link size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                </div>
              </div>

              {/* Raw Note Content / Transcript Textarea */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label-modal">Raw Note Content / Raw Transcript</label>
                <textarea
                  className="form-control-modal"
                  rows={4}
                  placeholder="Paste your workshop notes, course key points, or article content here..."
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  style={{ resize: 'vertical', minHeight: '100px' }}
                />
              </div>

              {error && (
                <div style={{ color: 'var(--accent-red)', fontSize: '13px', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--accent-red)', padding: '10px 14px', borderRadius: '8px' }}>
                  {error}
                </div>
              )}

              {/* Footer Modal Actions matching Image 3 */}
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
