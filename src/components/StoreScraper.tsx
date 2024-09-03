'use client'

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Review } from '@/types/Review';

interface StoreScraperProps {
  appId: string;
  onComplete: (reviews: Review[]) => void;
  store: 'play' | 'app';
}

export default function StoreScraper({ appId, onComplete, store }: StoreScraperProps) {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const scrapeReviews = useCallback(async () => {
    if (!appId || isLoading) return;

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      const api = store === 'play' ? 'scrape-play-store' : 'scrape-app-store';
      const response = await fetch(`/api/${api}`, {
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
      let allReviews: Review[] = [];
      let isComplete = false;

      while (!isComplete) {
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
                isComplete = true;
                return;
              }

              if (data.progress) {
                setProgress(data.progress);
                allReviews = [...allReviews, ...data.newReviews];
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
    } finally {
      setIsLoading(false);
    }
  }, [appId, onComplete]);

  useEffect(() => {
    scrapeReviews();
  }, [scrapeReviews]);

  return (
    <Card>
      <CardContent>
        <h3>Play Store Scraper</h3>
        {error && <p className="text-red-500">{error}</p>}
        {isLoading && <p>Scraping in progress... {progress} reviews collected</p>}
      </CardContent>
    </Card>
  );
}