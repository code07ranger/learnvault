import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import summarizeRoutes from './routes/summarize.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'LearnVault AI - Notebook Summarizer API',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api', summarizeRoutes);

app.listen(PORT, () => {
  console.log(`🚀 LearnVault AI Backend running on http://localhost:${PORT}`);
});
