'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { StarIcon, SendIcon, ArrowRightIcon, FilterIcon, Settings } from "lucide-react"
import { motion } from "framer-motion"
import StoreScraper from './StoreScraper'
import ReviewCard from './reviewCard'
import AIChat from './AIChat'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SettingsComponent from './SettingsComponent'
import { LLMSettings } from '@/types/LLMSettings'
import { Review } from '@/types/Review'

interface ChatMessage {
  text: string;
  isUser: boolean;
}

export default function ReviewAnalyzer() {
  const [step, setStep] = useState(1)
  const [appStoreId, setAppStoreId] = useState('6449232300')
  const [playStoreId, setPlayStoreId] = useState('ai.szl.mobileapp')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [userMessage, setUserMessage] = useState('')
  const [reviews, setReviews] = useState<Review[]>([])
  const [isScrapingComplete, setIsScrapingComplete] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [appStoreReviews, setAppStoreReviews] = useState<Review[]>([])
  const [playStoreReviews, setPlayStoreReviews] = useState<Review[]>([])
  const [keywordFilter, setKeywordFilter] = useState('')
  const [appFilteredReviews, setAppFilteredReviews] = useState<Review[]>([])
  const [playFilteredReviews, setPlayFilteredReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [minReviewLength, setMinReviewLength] = useState(100)
  const [llmSettings, setLLMSettings] = useState<LLMSettings>({
    provider: 'Anthropic',
    apiKey: '',
    model: 'claude-3-haiku-20240307',
  })
  const [isAppStoreScraped, setIsAppStoreScraped] = useState(false);
  const [isPlayStoreScraped, setIsPlayStoreScraped] = useState(false);

  const handleAppStoreScrapingComplete = (appStoreReviews: Omit<Review, 'store'>[]) => {
    setAppStoreReviews(appStoreReviews.map(review => ({ ...review, store: 'App Store' as const })))
    setIsAppStoreScraped(true)
  }

  const handlePlayStoreScrapingComplete = (playStoreReviews: Omit<Review, 'store'>[]) => {
    setPlayStoreReviews(playStoreReviews.map(review => ({ ...review, store: 'Play Store' as const })))
    setIsPlayStoreScraped(true)
  }

  useEffect(() => {
    if (appStoreReviews.length > 0 && playStoreReviews.length > 0) {
      setIsScrapingComplete(true)
      filterReviews('')
    }
  }, [isAppStoreScraped, isPlayStoreScraped])

  const filterReviews = (keyword: string) => {
    const newKeyword = keyword.toLowerCase();
    const newAppFilteredReviews = appStoreReviews.filter(review => 
      review.text.length > minReviewLength ? review.text.toLowerCase().includes(newKeyword) : false
    );
    const newPlayFilteredReviews = playStoreReviews.filter(review => 
      review.text.length > minReviewLength ? review.text.toLowerCase().includes(newKeyword) : false
    );
    setAppFilteredReviews(newAppFilteredReviews);
    setPlayFilteredReviews(newPlayFilteredReviews);
    setFilteredReviews([...newAppFilteredReviews, ...newPlayFilteredReviews]);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      filterReviews(keywordFilter);
    }, 200);

    return () => clearTimeout(timer);
  }, [keywordFilter]);

  /*
  const selectRandomReview = () => {
    if (reviews.length > 0) {
      const randomIndex = Math.floor(Math.random() * reviews.length)
      setSelectedReview(reviews[randomIndex])
    }
  }
  */

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center p-4 relative">
      <motion.div 
        className="max-w-4xl w-full"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <Card className="w-full overflow-hidden shadow-xl bg-stone-50">
          <CardHeader className="bg-gradient-to-r from-stone-700 to-stone-800 text-stone-100">
            <CardTitle className="text-3xl font-bold text-center">App Review Analyzer</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {step === 1 && (
              <motion.div className="space-y-4" variants={fadeIn}>
                <Input
                  placeholder="App Store ID"
                  value={appStoreId}
                  onChange={(e) => setAppStoreId(e.target.value)}
                  className="text-lg p-6 bg-stone-100 border-stone-300"
                />
                <Input
                  placeholder="Play Store ID"
                  value={playStoreId}
                  onChange={(e) => setPlayStoreId(e.target.value)}
                  className="text-lg p-6 bg-stone-100 border-stone-300"
                />
                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full text-lg p-6 bg-stone-600 hover:bg-stone-700 text-stone-100 transition-all duration-300"
                >
                  Analyze Reviews <ArrowRightIcon className="ml-2" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div className="space-y-4" variants={fadeIn}>
                {!isScrapingComplete ? (
                  <>
                    {appStoreId && !isAppStoreScraped ? (
                      <StoreScraper appId={appStoreId} onComplete={handleAppStoreScrapingComplete} store='app' />
                    ) : (
                      <span>{`${appStoreReviews.length} App Store Reviews Scraped`}</span>
                    )}
                    {playStoreId && !isPlayStoreScraped ? (
                      <StoreScraper appId={playStoreId} onComplete={handlePlayStoreScrapingComplete} store='play' />
                    ) : (
                      <span>{`${playStoreReviews.length} Play Store Reviews Scraped`}</span>
                    )}
                  </>
                ) : (
                  <>
                    <Card className="bg-stone-100 shadow-lg rounded-lg overflow-hidden mb-4">
                      <CardHeader>
                        <CardTitle className="text-2xl font-semibold text-stone-800">Reviews Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Filter by keyword"
                              value={keywordFilter}
                              onChange={(e) => setKeywordFilter(e.target.value)}
                              className="flex-grow"
                            />
                            <Button 
                              onClick={() => {/* Add filter logic here */}} 
                              className="bg-stone-600 hover:bg-stone-700 text-stone-100"
                            >
                              <FilterIcon className="w-4 h-4 mr-2" />
                              Filter
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-2">App Store Reviews ({appFilteredReviews.length})</h3>
                            {appFilteredReviews.slice(0, 5).map(review => (
                              <ReviewCard key={review.id} review={review} />
                            ))}
                            {appFilteredReviews.length > 5 && (
                              <p className="text-sm text-stone-500 mt-2">And {appFilteredReviews.length - 5} more...</p>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Play Store Reviews ({playFilteredReviews.length})</h3>
                            {playFilteredReviews.slice(0, 5).map(review => (
                              <ReviewCard key={review.id} review={review} />
                            ))}
                            {playFilteredReviews.length > 5 && (
                              <p className="text-sm text-stone-500 mt-2">And {playFilteredReviews.length - 5} more...</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {isScrapingComplete && (
                      <AIChat reviews={filteredReviews} llmSettings={llmSettings} />
                    )}
                  </>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button className="absolute bottom-4 right-4 rounded-full p-2">
            <Settings className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <SettingsComponent settings={llmSettings} onSettingsChange={setLLMSettings} />
        </PopoverContent>
      </Popover>
    </div>
  )
}