'use client'

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface Review {
  id: string;
  text: string;
  rating: number;
  date: string;
}

interface AppStoreScraperProps {
  appId: string;
  onComplete: (reviews: Review[]) => void;
}

export default function AppStoreScraper({ appId, onComplete }: AppStoreScraperProps) {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allReviews, setAllReviews] = useState<Review[]>([]);

  useEffect(() => {
    const scrapeReviews = useCallback(async () => {
      if (!appId || isLoading) return;
      setIsLoading(true);
      setError(null);
      setProgress(0);
      setAllReviews([]);

      try {
        const response = await fetch('/api/scrape-app-store', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ appId }),
        });

        if (!response.ok) {
          throw new Error(`Failed to start scraping: ${response.status} ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.error) {
                  throw new Error(data.error);
                }

                if (data.complete) {
                  onComplete(allReviews);
                  setIsLoading(false);
                  console.log('Data complete. Exiting...');
                  return;
                }

                if (data.progress) {
                  setProgress(data.progress);
                  setAllReviews(prev => [...prev, ...data.newReviews]);
                }
              } catch (jsonError) {
                console.error('Error parsing JSON:', jsonError);
                console.error('Problematic line:', line);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in scrapeReviews:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } 
      finally {
        setIsLoading(false);
      }
    };

    if (appId) {
      scrapeReviews();
    }
  }, [scrapeReviews]);

  return (
    <Card>
      <CardContent>
        <h3>App Store Scraper</h3>
        <p>App ID: {appId}</p>
        {error && <p className="text-red-500">Error: {error}</p>}
        {isLoading && <p>Scraping in progress... {progress} reviews collected</p>}
      </CardContent>
    </Card>
  );
}