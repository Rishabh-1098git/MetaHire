const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

const client = genAI;

const DEFAULT_RETRIES = 3;
const BASE_DELAY_MS = 400;
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildRetryDelay(attempt) {
  const jitter = Math.floor(Math.random() * 200);
  return BASE_DELAY_MS * 2 ** (attempt - 1) + jitter;
}

function isRetryableError(error) {
  const status = error?.status || error?.response?.status;
  if (status && RETRYABLE_STATUS_CODES.has(status)) {
    return true;
  }

  const message = `${error?.message || ''}`.toLowerCase();
  return message.includes('timeout') || message.includes('rate limit') || message.includes('429') || message.includes('network');
}

function normalizeResponseText(text) {
  return (text || '').replace(/```json|```/g, '').trim();
}

function parseQuestionsResponse(rawText) {
  const normalized = normalizeResponseText(rawText);
  if (!normalized) {
    throw new Error('No question content returned by Gemini.');
  }

  return normalized
    .split(/\|\s*|\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseFeedbackResponse(rawText) {
  const normalized = normalizeResponseText(rawText);
  if (!normalized) {
    throw new Error('No feedback content returned by Gemini.');
  }

  let parsed;
  try {
    parsed = JSON.parse(normalized);
  } catch (error) {
    throw new Error('Unable to parse feedback response from Gemini.');
  }

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (typeof parsed === 'string') {
    try {
      const nested = JSON.parse(parsed);
      if (Array.isArray(nested)) {
        return nested;
      }
    } catch (error) {
      // fall through
    }
  }

  throw new Error('Feedback response from Gemini is not a valid array.');
}

async function callGeminiWithRetry(prompt, { retries = DEFAULT_RETRIES } = {}) {
  let lastError;
  const clientToUse = module.exports.__testClient || client;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const model = clientToUse.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      lastError = error;
      const retryable = isRetryableError(error);
      if (!retryable || attempt >= retries) {
        throw error;
      }

      const delayMs = buildRetryDelay(attempt);
      await sleep(delayMs);
    }
  }

  throw lastError;
}

async function generateQuestions(prompt) {
  const responseText = await callGeminiWithRetry(prompt);
  return parseQuestionsResponse(responseText);
}

async function generateFeedback(prompt) {
  const responseText = await callGeminiWithRetry(prompt);
  return parseFeedbackResponse(responseText);
}

module.exports = {
  callGeminiWithRetry,
  generateQuestions,
  generateFeedback,
  parseQuestionsResponse,
  parseFeedbackResponse,
  __testClient: null,
};
