import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Summarizes notebook content into clear, user-friendly key points
 */
/**
 * Generates structured AI summary from uploaded notebook content
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

  if (!openai) {
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

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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
    console.warn('OpenAI API call returned invalid key / error, utilizing local AI text processing engine:', error.message);
    return defaultResult;
  }
}

/**
 * Generates a learner-friendly AI explanation & extra context summary for a note
 */
export async function generateAISummary(title, subject, content) {
  const textSnippet = content ? content.trim() : '';
  const sentences = textSnippet.split(/(?<=[.!?])\s+/).filter(s => s.length > 10);

  // Extract non-overlapping distinct text blocks
  const block1 = sentences[0] || textSnippet.slice(0, 140) || 'Core principles overview.';
  const block2 = sentences.slice(1, 3).join(' ') || 'Key mechanisms and practical frameworks.';
  const block3 = sentences.slice(3, 5).join(' ') || 'Real-world impact, application, and mastery value.';
  const block4 = sentences.slice(5, 7).join(' ') || 'Analogy and simple mental model for beginners.';

  const fallbackSummary = {
    simple_summary: `📌 Executive Snapshot: ${block1}`,
    main_about: `🔍 Core Focus & Framework: ${block2}`,
    why_it_matters: `💡 Practical Impact & Relevance: ${block3}`,
    beginner_explanation: `🧠 Beginner Intuition & Analogy: ${block4}`
  };

  if (!openai) {
    return fallbackSummary;
  }

  try {
    const prompt = `You are LearnVault AI, a master academic tutor.
Analyze the following study note content and generate a non-repetitive, highly informative 4-section AI Summary.

CRITICAL INSTRUCTIONS:
- Do NOT repeat the title or core concept across sections. Each section MUST cover distinct, unique aspects.
- Include a clear, descriptive sub-heading prefix for each section.
- Output MUST be valid JSON with these exact 4 keys:

{
  "simple_summary": "📌 Executive Snapshot: 1-2 sentence high-level summary highlighting the specific unique theme.",
  "main_about": "🔍 Core Mechanics & Framework: 2-3 sentences explaining the specific processes, rules, or components mentioned in the note.",
  "why_it_matters": "💡 Practical Impact & Application: 2-3 sentences on real-world usefulness, exam importance, or problem-solving value.",
  "beginner_explanation": "🧠 Beginner Intuition & Analogy: 2 sentences providing a simple real-world mental model or everyday analogy."
}

Note Title: ${title || 'Study Note'}
Subject: ${subject || 'General'}
Content:
${content}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You create structured, non-repetitive study summaries with clear sub-headings in strict JSON format.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    return {
      simple_summary: parsed.simple_summary || fallbackSummary.simple_summary,
      main_about: parsed.main_about || fallbackSummary.main_about,
      why_it_matters: parsed.why_it_matters || fallbackSummary.why_it_matters,
      beginner_explanation: parsed.beginner_explanation || fallbackSummary.beginner_explanation
    };
  } catch (error) {
    console.warn('OpenAI API call returned error, utilizing non-repetitive text processing engine:', error.message);
    return fallbackSummary;
  }
}
