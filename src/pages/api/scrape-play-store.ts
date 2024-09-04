import type { NextApiRequest, NextApiResponse } from 'next';
import gplay from 'google-play-scraper';

function sanitizeString(str: string): string {
  return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { appId } = req.body;

    if (!appId) {
      return res.status(400).json({ error: 'App ID is required' });
    }

    try {
      let allReviews: any[] = [];
      let nextPaginationToken: string | undefined;

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      do {
        const result = await gplay.reviews({
          appId,
          sort: gplay.sort.NEWEST,
          paginate: true,
          nextPaginationToken: nextPaginationToken,
        }) as any; // Add 'as any' here

        nextPaginationToken = result.nextPaginationToken;

        const newReviews = result.data.map((review: any) => ({
          id: review.id,
          text: sanitizeString(review.text),
          rating: review.score, 
          date: review.date,
        }));

        allReviews = allReviews.concat(newReviews);
        
        const safeJson = JSON.stringify({ progress: allReviews.length, newReviews }).replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        res.write(`data: ${safeJson}\n\n`);

        
      } while (nextPaginationToken);

      const safeJson = JSON.stringify({ complete: true, totalReviews: allReviews.length }).replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      res.write(`data: ${safeJson}\n\n`);
      res.end();
    } catch (error) {
      console.error('Error scraping Play Store reviews:', error);
      res.write(`data: ${JSON.stringify({ error: 'Failed to scrape reviews' })}\n\n`);
      res.end();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}