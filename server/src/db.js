import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_FILE = path.resolve('notebook_vault.json');

let vaultData = {
  notebooks: []
};

function loadVault() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      vaultData = JSON.parse(content);
    } catch (err) {
      console.error('Error loading notebook vault store:', err.message);
    }
  }
}

function saveVault() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(vaultData, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving notebook vault store:', err.message);
  }
}

loadVault();

export function saveNotebookSummary(notebook) {
  const newNotebook = {
    id: crypto.randomUUID(),
    title: notebook.title || 'Untitled Notebook',
    subject: notebook.subject || 'General Study',
    priority: notebook.priority || notebook.priorityTag || 'Medium Priority',
    source_type: notebook.source_type || notebook.sourceType || 'Course Note',
    raw_content: notebook.content,
    executive_summary: notebook.executive_summary,
    key_points: notebook.key_points || [],
    key_definitions: notebook.key_definitions || [],
    action_takeaways: notebook.action_takeaways || [],
    read_time_minutes: Math.max(1, Math.ceil((notebook.content || '').split(/\s+/).length / 200)),
    created_at: new Date().toISOString()
  };

  vaultData.notebooks.unshift(newNotebook);
  saveVault();
  return newNotebook;
}

export function getAllNotebooks() {
  return vaultData.notebooks;
}

export function getNotebookById(id) {
  return vaultData.notebooks.find(n => n.id === id);
}

export function saveAISummaryToNotebook(id, aiSummary) {
  const nb = vaultData.notebooks.find(n => n.id === id);
  if (nb) {
    nb.ai_summary = aiSummary;
    saveVault();
    return true;
  }
  return false;
}

export function deleteNotebookById(id) {
  const initialCount = vaultData.notebooks.length;
  vaultData.notebooks = vaultData.notebooks.filter(n => n.id !== id);
  saveVault();
  return vaultData.notebooks.length < initialCount;
}
