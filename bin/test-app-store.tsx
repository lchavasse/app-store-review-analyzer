'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
//import AppStoreScraper from '../components/AppStoreScraper';

interface Review {
  id: string;
  text: string;
  rating: number;
  date: string;
}

export default function TestAppStore() {
  const [appId, setAppId] = useState('553834731'); // Use an actual App Store ID
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isScrapingStarted, setIsScrapingStarted] = useState(false);

  const handleComplete = (scrapedReviews: Review[]) => {
    setReviews(scrapedReviews);
    setIsScrapingStarted(false);
  };

  const startScraping = () => {
    setReviews([]);
    setIsScrapingStarted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-200 to-stone-300 p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Test App Store Scraper</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Enter App Store App ID"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
            />
            <Button onClick={startScraping} disabled={isScrapingStarted || !appId}>
              {isScrapingStarted ? 'Scraping...' : 'Start Scraping'}
            </Button>
            {isScrapingStarted && (
              <AppStoreScraper appId={appId} onComplete={handleComplete} />
            )}
            <div className="mt-4 space-y-2">
              <h3>Scraped Reviews:</h3>
              {reviews.slice(0, 5).map((review, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <p>{review.text}</p>
                    <p className="text-sm text-gray-500">Rating: {review.rating}, Date: {review.date}</p>
                  </CardContent>
                </Card>
              ))}
              {reviews.length > 5 && <p>... and {reviews.length - 5} more reviews</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}