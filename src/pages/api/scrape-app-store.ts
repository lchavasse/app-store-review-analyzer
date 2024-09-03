import type { NextApiRequest, NextApiResponse } from 'next';
import store from 'app-store-scraper';

function sanitizeString(str: string): string {
  return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { appId } = req.body;

    if (!appId) {
      return res.status(400).json({ error: 'App ID is required' });
    }

    console.log(`Attempting to scrape reviews for App ID: ${appId}`);

    try {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      let allReviews: any[] = [];
      const MAX_PAGES = 10;

      for (let page = 1; page <= MAX_PAGES; page++) {
        try {
          console.log(`Fetching page ${page} for App Store reviews`);
          const result = await store.reviews({
            id: appId,
            sort: store.sort.RECENT,
            page: page,
            country: 'us'
          });

          if (result.length === 0) {
            break;
          }

          const newReviews = result.map((review: any) => ({
            id: review.id,
            text: sanitizeString(review.text),
            rating: review.score,
            date: review.date,
          }));

          allReviews = allReviews.concat(newReviews);
          
          const safeJson = JSON.stringify({ progress: allReviews.length, newReviews, currentPage: page }).replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
          res.write(`data: ${safeJson}\n\n`);
        } catch (pageError) {
          console.error(`Error fetching page ${page}:`, pageError);
          res.write(`data: ${JSON.stringify({ error: `Failed to fetch page ${page}: ${(pageError as Error).message}` })}\n\n`);
          break;
        }
      }

      const safeJson = JSON.stringify({ complete: true, totalReviews: allReviews.length }).replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      res.write(`data: ${safeJson}\n\n`);
    } catch (error) {
      console.error('Error scraping App Store reviews:', error);
      res.write(`data: ${JSON.stringify({ error: `Failed to scrape reviews: ${(error as Error).message}` })}\n\n`);
    } finally {
      if (!res.writableEnded) {
        console.log('Ending response...');
        res.end();
        console.log('Response ended. Scraping complete.');
      } else {
        console.log('Response already ended. Skipping.');
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}