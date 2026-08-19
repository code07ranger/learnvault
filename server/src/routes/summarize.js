import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { summarizeNotebook, generateAISummary } from '../services/openai.js';
import { saveNotebookSummary, getAllNotebooks, getNotebookById, deleteNotebookById, saveAISummaryToNotebook } from '../db.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/generate-ai-summary - Generate structured AI explanation summary for a note
router.post('/generate-ai-summary', async (req, res) => {
  try {
    const { id, title, subject, content } = req.body;

    let targetNotebook = null;
    let noteTitle = title;
    let noteSubject = subject;
    let noteContent = content;

    if (id) {
      targetNotebook = getNotebookById(id);
      if (targetNotebook) {
        noteTitle = targetNotebook.title;
        noteSubject = targetNotebook.subject;
        noteContent = targetNotebook.raw_content || targetNotebook.executive_summary;
      }
    }

    if (!noteContent || noteContent.trim().length === 0) {
      return res.status(400).json({ error: 'Note content is required to generate AI Summary.' });
    }

    const aiSummary = await generateAISummary(noteTitle, noteSubject, noteContent);

    if (id && targetNotebook) {
      saveAISummaryToNotebook(id, aiSummary);
    }

    res.json({
      message: 'AI Summary generated successfully',
      aiSummary
    });
  } catch (error) {
    console.error('Generate AI Summary endpoint error:', error);
    res.status(500).json({ error: 'Failed to generate AI Summary for note. Please try again.' });
  }
});

// POST /api/extract-pdf - Extract text from uploaded PDF file
router.post('/extract-pdf', upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pdfBuffer = req.file.buffer;
    let extractedText = '';
    let numPages = 1;

    try {
      const parseFunc = typeof pdfParse === 'function' ? pdfParse : (pdfParse.default || pdfParse);
      const data = await parseFunc(pdfBuffer);
      extractedText = data.text ? data.text.trim() : '';
      numPages = data.numpages || 1;
    } catch (pdfErr) {
      console.warn('pdf-parse internal warning:', pdfErr.message);
    }

    // Fallback if PDF is scanned image or text extraction returned empty
    if (!extractedText) {
      const cleanName = req.file.originalname.replace(/\.[^/.]+$/, '');
      extractedText = `PDF Document: ${req.file.originalname}\nUploaded File Name: ${cleanName}\n\n[Note: This PDF appears to be a scanned document or image-based PDF. LearnVault AI has registered this study file for key concept analysis.]`;
    }

    res.json({
      title: req.file.originalname.replace(/\.[^/.]+$/, ''),
      text: extractedText,
      pages: numPages
    });
  } catch (error) {
    console.error('PDF extraction error:', error);
    res.status(500).json({ error: 'Failed to process PDF file. You can paste the content directly.' });
  }
});

// POST /api/summarize - Summarize a notebook
router.post('/summarize', async (req, res) => {
  try {
    const { title, subject, content, priority, sourceType } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Notebook content cannot be empty' });
    }

    // Call AI API for structured key points summarization
    const summaryData = await summarizeNotebook(title, subject, content);

    // Save to persistent vault
    const saved = saveNotebookSummary({
      title,
      subject,
      priority,
      sourceType,
      content,
      ...summaryData
    });

    res.status(201).json({
      message: 'Notebook summarized successfully',
      notebook: saved
    });
  } catch (error) {
    console.error('Summarize endpoint error:', error);
    res.status(500).json({ error: 'Failed to generate notebook summary' });
  }
});

// GET /api/notebooks - Retrieve all summarized notebooks
router.get('/notebooks', (req, res) => {
  try {
    const notebooks = getAllNotebooks();
    res.json({ notebooks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve notebooks' });
  }
});

// GET /api/notebooks/:id - Retrieve single notebook summary details
router.get('/notebooks/:id', (req, res) => {
  try {
    const notebook = getNotebookById(req.params.id);
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    res.json({ notebook });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve notebook' });
  }
});

// DELETE /api/notebooks/:id - Delete a notebook summary
router.delete('/notebooks/:id', (req, res) => {
  try {
    const success = deleteNotebookById(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    res.json({ message: 'Notebook summary deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notebook' });
  }
});

export default router;
