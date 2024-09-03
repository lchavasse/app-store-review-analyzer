import { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const defaultApiKey = process.env.ANTHROPIC_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, reviews, llmSettings } = req.body;
    console.log('LLM Settings:', llmSettings);
    const apiKey = llmSettings.apiKey || defaultApiKey;
    if (!apiKey) {
      throw new Error('No API key provided');
    }

    const anthropic = new Anthropic({ apiKey });

    // Prepare the context for Claude
    const context = `You are an AI assistant analyzing app reviews. Here are the reviews:
${reviews.map((review: Review) => `- ${review.text} (Rating: ${review.rating}, Store: ${review.store})`).join('\n')}

Based on these reviews, please answer the following question:`;

    console.log('Sending request to Anthropic API...'); // Debugging line

    const response = await anthropic.messages.create({
      model: llmSettings.model,
      max_tokens: 1000,
      system: context,
      messages: [
        { role: 'user', content: message }
      ],
    });

    console.log('Received response from Anthropic API'); // Debugging line

    res.status(200).json({ response: response.content[0].text });
  } catch (error) {
    console.error('Error communicating with Claude AI:', error);
    res.status(500).json({ 
      message: 'Error processing your request', 
      error: error.message,
      stack: error.stack // Include stack trace for debugging
    });
  }
}