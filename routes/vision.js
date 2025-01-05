// routes/vision.js

require('dotenv').config();
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// 1) Configure Multer for temporary file storage
const upload = multer({ dest: 'uploads/' });

// 2) Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: 'org-cJaMvkP2IMfnl9PiknIJChhm',
  project: 'proj_bfE4JISAcFyEDc5Vr883tFwd',
});

// Helper to convert a local file to base64
function fileToBase64(filePath) {
  const fileData = fs.readFileSync(filePath);
  return fileData.toString('base64');
}

/**
 * POST /api/vision
 * Body formData:
 *   - imageFile (file) [optional]
 *   - imageUrl (string) [optional, if no file]
 *   - detail (string: 'low'|'high'|'auto')
 */
router.post('/', upload.single('imageFile'), async (req, res) => {
  try {
    // For detail level: 'low', 'high', or 'auto'
    const detailLevel = 'low';

    // GPT prompt
    const userPrompt = `
You are a tool that extracts data from a receipt or expense image.
Respond ONLY with valid JSON in this format:
{
  "date": "YYYY-MM-DD",
  "vendor": "string",
  "amount": 0.0
}
If any field is unknown, set it to null.
`;

    // Build the messages content array
    const contentArray = [
      {
        type: 'text',
        text: userPrompt,
      },
    ];

    // If user uploaded a file, convert to base64
    if (req.file) {
      const base64Image = fileToBase64(req.file.path);
      contentArray.push({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${base64Image}`,
          detail: detailLevel,
        },
      });
      // Clean up local file
      fs.unlinkSync(req.file.path);
    } else if (req.body.imageUrl) {
      // Otherwise, use the user-provided URL
      contentArray.push({
        type: 'image_url',
        image_url: {
          url: req.body.imageUrl,
          detail: detailLevel,
        },
      });
    } else {
      return res
        .status(400)
        .json({ error: 'No imageFile or imageUrl provided' });
    }

    // 3) Call GPT-4o-mini chat completion
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: contentArray,
        },
      ],
      max_tokens: 300,
    });

    // 4) Extract text from GPT response
    // For Chat Completions, the content is in .message.content
    let rawText = response.choices[0].message.content || '';

    // Remove triple backticks to avoid parse failures
    rawText = rawText.replace(/```(\w+)?/g, '').replace(/```/g, '').trim();

    let structured;
    try {
      // Attempt to parse as JSON
      structured = JSON.parse(rawText);
    } catch (e) {
      // If it fails, store the raw text
      structured = { raw: rawText };
    }

    // Return both parsed data and raw text
    return res.json({
      success: true,
      structured,
      rawText,
    });
  } catch (error) {
    console.error('Error processing vision request:', error);
    return res.status(500).json({ error: 'Failed to analyze image' });
  }
});

module.exports = router;
