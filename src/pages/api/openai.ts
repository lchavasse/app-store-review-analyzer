import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { Review } from '@/types/Review';

const defaultApiKey = process.env.OPENAI_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, reviews, llmSettings } = req.body;
    console.log('LLM Settings:', llmSettings);
    const apiKey = llmSettings.apiKey || defaultApiKey;
    if (!apiKey) {
      throw new Error('No API key provided');
    }

    const openai = new OpenAI({apiKey});

    if (!message || !reviews || !llmSettings.model) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const completion = await openai.chat.completions.create({
      model: llmSettings.model,
      messages: [
        { role: "system", content: `You are an AI assistant analyzing app reviews. Here are the reviews:
${reviews.map((review: Review) => `- ${review.text} (Rating: ${review.rating}, Store: ${review.store})`).join('\n')}

Based on these reviews, please answer the following question:`},
        { role: "user", content: message}
      ],
    });

    const aiResponse = completion.choices[0].message.content || "No response from OpenAI";

    res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ error: 'Error processing your request' });
  }
}