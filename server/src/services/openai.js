import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient = null;
let aiModel = 'llama-3.3-70b-versatile';

const groqKey = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '' && !process.env.GROQ_API_KEY.includes('your_groq_api_key') ? process.env.GROQ_API_KEY.trim() : null;
const openaiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '' && !process.env.OPENAI_API_KEY.includes('your_openai_api_key') ? process.env.OPENAI_API_KEY.trim() : null;

if (groqKey) {
  aiClient = new OpenAI({
    apiKey: groqKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });
  aiModel = 'llama-3.3-70b-versatile';
} else if (openaiKey) {
  if (openaiKey.startsWith('gsk_')) {
    aiClient = new OpenAI({
      apiKey: openaiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
    aiModel = 'llama-3.3-70b-versatile';
  } else {
    aiClient = new OpenAI({
      apiKey: openaiKey,
    });
    aiModel = 'gpt-4o-mini';
  }
}

/**
 * Summarizes notebook content into clear, user-friendly key points
 */
export async function summarizeNotebook(title, subject, content) {
  const textSnippet = content ? content.trim() : '';
  const sentences = textSnippet.split(/(?<=[.!?])\s+/).filter(s => s.length > 10);
  
  const autoExecSummary = sentences.length > 0
    ? sentences.slice(0, 3).join(' ')
    : `This note on "${title}" (${subject}) covers core concepts and foundational study material.`;

  const extractedPoints = sentences.length > 3
    ? sentences.slice(3, 8).map((s, idx) => `**Key Point ${idx + 1}**: ${s}`)
    : [
        `**Primary Concept**: "${title}" forms a core building block in ${subject}.`,
        `**Key Insight**: ${textSnippet.slice(0, 120) || 'Review the core note content for complete breakdown.'}`,
        `**Practical Application**: Regular testing on these key points solidifies long-term retention.`
      ];

  const defaultResult = {
    executive_summary: autoExecSummary,
    key_points: extractedPoints,
    key_definitions: [
      { term: `${title} Topic`, definition: `Core subject matter covered in this study note.` },
      { term: `Key Takeaway`, definition: `Primary concept extracted from uploaded material.` }
    ],
    action_takeaways: [
      `Review key concepts extracted from ${title}`,
      `Practice explaining main points in your own words`,
      `Test retention by creating quick flashcards`
    ]
  };

  if (!aiClient) {
    return defaultResult;
  }

  try {
    const prompt = `You are LearnVault AI, an expert academic note summarizer.
Your goal is to parse the user's notebook content and return a JSON object with a highly user-friendly format:

JSON Structure required:
{
  "executive_summary": "A clear, engaging 2-3 sentence overview of the notebook.",
  "key_points": [
    "**Heading/Concept**: Explanation in clear, simple bullet point language."
  ],
  "key_definitions": [
    { "term": "Term Name", "definition": "Clear concise explanation of the term." }
  ],
  "action_takeaways": [
    "Practical study step 1",
    "Practical study step 2"
  ]
}

Notebook Title: ${title || 'Untitled'}
Subject: ${subject || 'General Study'}
Content:
${content}`;

    const response = await aiClient.chat.completions.create({
      model: aiModel,
      messages: [
        { role: 'system', content: 'You extract clear key points and structured summaries from notes in strict JSON format.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    return {
      executive_summary: parsed.executive_summary || defaultResult.executive_summary,
      key_points: parsed.key_points || defaultResult.key_points,
      key_definitions: parsed.key_definitions || defaultResult.key_definitions,
      action_takeaways: parsed.action_takeaways || defaultResult.action_takeaways
    };
  } catch (error) {
    console.warn('AI API call returned error, utilizing local AI text processing engine:', error.message);
    return defaultResult;
  }
}

function cleanMarkdownText(str) {
  if (!str) return '';
  return str
    .replace(/^#+\s+/gm, '') // Remove markdown headers ###
    .replace(/^[\s\-*#]+/gm, '') // Remove list bullets / dashes
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italics
    .replace(/`(.*?)`/g, '$1') // Remove code backticks
    .replace(/📌|🔍|💡|🧠|Executive Snapshot:|Core Focus & Framework:|Practical Impact & Application:|Beginner Intuition & Analogy:|Core Mechanics & Framework:/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates a learner-friendly AI explanation & extra context summary for a note
 */
export async function generateAISummary(title, subject, content) {
  const textSnippet = cleanMarkdownText(content);
  const rawSentences = textSnippet.split(/(?<=[.!?])\s+/).filter(s => s.length > 10);
  const sentences = rawSentences.map(cleanMarkdownText).filter(s => s.length > 15);

  // Dynamic random offset for varied fallback points on regeneration
  const offset = Math.floor(Math.random() * Math.max(1, sentences.length - 3));
  const pool = sentences.slice(offset).concat(sentences.slice(0, offset));

  const block1 = pool[0] || textSnippet.slice(0, 140) || `Core study material covering ${title}.`;
  const block2 = pool.slice(1, 3).join(' ') || `Key mechanisms and practical frameworks regarding ${subject}.`;
  const block3 = pool.slice(3, 5).join(' ') || `Real-world application, exam utility, and mastery value of ${title}.`;
  const block4 = pool.slice(5, 7).join(' ') || `Analogy and beginner mental model for understanding ${title}.`;

  const fallbackSummary = {
    simple_summary: cleanMarkdownText(block1),
    main_about: cleanMarkdownText(block2),
    why_it_matters: cleanMarkdownText(block3),
    beginner_explanation: cleanMarkdownText(block4)
  };

  if (!aiClient) {
    return fallbackSummary;
  }

  try {
    const prompt = `You are LearnVault AI, an expert academic tutor.
Analyze the following study note content and generate a FRESH, non-repetitive, highly informative 4-section AI Summary.

CRITICAL FORMATTING INSTRUCTIONS:
- Do NOT include raw markdown symbols (such as ###, ---, **, * or backticks).
- Do NOT include prefix headers like "📌 Executive Snapshot:" or "🔍 Core Focus:".
- Output MUST be plain, clean, smooth, readable prose for each section.
- Output MUST be valid JSON with these exact 4 keys:

{
  "simple_summary": "1-2 sentence high-level summary highlighting a unique specific theme from the note.",
  "main_about": "2-3 sentences explaining the specific processes, rules, or components mentioned in the note.",
  "why_it_matters": "2-3 sentences on real-world usefulness, exam importance, or practical problem-solving value.",
  "beginner_explanation": "2 sentences providing a simple real-world mental model or everyday analogy for a beginner."
}

Note Title: ${title || 'Study Note'}
Subject: ${subject || 'General'}
Content:
${textSnippet}`;

    const response = await aiClient.chat.completions.create({
      model: aiModel,
      messages: [
        { role: 'system', content: 'You create clean, structured, non-repetitive study summaries without any raw markdown syntax in strict JSON format.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    return {
      simple_summary: cleanMarkdownText(parsed.simple_summary || fallbackSummary.simple_summary),
      main_about: cleanMarkdownText(parsed.main_about || fallbackSummary.main_about),
      why_it_matters: cleanMarkdownText(parsed.why_it_matters || fallbackSummary.why_it_matters),
      beginner_explanation: cleanMarkdownText(parsed.beginner_explanation || fallbackSummary.beginner_explanation)
    };
  } catch (error) {
    console.warn('AI API call returned error, utilizing non-repetitive text processing engine:', error.message);
    return fallbackSummary;
  }
}


