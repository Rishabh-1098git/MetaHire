const tap = require('tap');
const { parseQuestionsResponse, parseFeedbackResponse, callGeminiWithRetry } = require('../services/geminiService');

tap.test('parseQuestionsResponse splits pipe-delimited question output', (t) => {
  const result = parseQuestionsResponse('Question one|Question two|Question three');
  t.same(result, ['Question one', 'Question two', 'Question three']);
  t.end();
});

tap.test('parseQuestionsResponse trims and filters empty entries', (t) => {
  const result = parseQuestionsResponse('  First question  |   | Second question\nThird question');
  t.same(result, ['First question', 'Second question', 'Third question']);
  t.end();
});

tap.test('parseFeedbackResponse parses JSON feedback payloads', (t) => {
  const result = parseFeedbackResponse('[{"question":"Q1","answer":"A1","score":8,"feedback":"Good"}]');
  t.equal(result.length, 1);
  t.equal(result[0].score, 8);
  t.equal(result[0].feedback, 'Good');
  t.end();
});

tap.test('parseFeedbackResponse throws for malformed JSON', (t) => {
  t.throws(() => parseFeedbackResponse('not valid json'), { message: 'Unable to parse feedback response from Gemini.' });
  t.end();
});

tap.test('callGeminiWithRetry retries transient failures and succeeds', async (t) => {
  let attempts = 0;
  const fakeModel = {
    generateContent: async () => {
      attempts += 1;
      if (attempts < 3) {
        const error = new Error('timeout');
        error.status = 408;
        throw error;
      }

      return {
        response: {
          text: () => 'retry worked',
        },
      };
    },
  };

  const fakeGenerator = {
    getGenerativeModel: () => fakeModel,
  };

  const originalClient = require('../services/geminiService').__testClient;
  require('../services/geminiService').__testClient = fakeGenerator;

  try {
    const result = await callGeminiWithRetry('prompt', { retries: 3 });
    t.equal(result, 'retry worked');
    t.equal(attempts, 3);
  } finally {
    require('../services/geminiService').__testClient = originalClient;
  }

  t.end();
});
