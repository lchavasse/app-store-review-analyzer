import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendIcon } from "lucide-react"
import { LLMSettings } from '@/types/LLMSettings'
import { Review } from '@/types/Review'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ReactMarkdown from 'react-markdown'

interface ChatMessage {
  text: string;
  isUser: boolean;
}

interface AIChatProps {
  reviews: Review[];
  llmSettings: LLMSettings;
}

export default function AIChat({ reviews, llmSettings }: AIChatProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{ text: "Ask me anything about the reviews!", isUser: false }])
  const [userMessage, setUserMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  const sendMessage = async () => {
    if (!userMessage.trim()) return

    const newUserMessage: ChatMessage = { text: userMessage, isUser: true }
    setChatMessages(prev => [...prev, newUserMessage])
    setUserMessage('')
    setIsLoading(true)

    let aiResponse: ChatMessage;

    const apiUrl = llmSettings.provider === 'Anthropic' ? '/api/claude' : '/api/openai'
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            reviews: reviews,
            llmSettings,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response from OpenAI');
        }

        const data = await response.json();
        aiResponse = { text: data.response, isUser: false };
    } catch (error) {
      console.error('Error sending message:', error);
      aiResponse = { text: "Error: Unable to get a response. Please try again later.", isUser: false };
    }

    setChatMessages(prev => [...prev, aiResponse])
    setIsLoading(false)
  }

  return (
    <Card className="bg-stone-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-stone-800">AI Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-100 overflow-y-auto bg-stone-100 p-4 rounded-md shadow-inner">
          {chatMessages.map((msg, index) => (
            <div key={index} className={`mb-2 ${msg.isUser ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded-lg ${msg.isUser ? 'bg-stone-600 text-stone-100 pr-4' : 'bg-stone-300 text-stone-800 pl-4'}`}>
                {msg.isUser ? (
                  msg.text
                ) : (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Textarea
            placeholder="Ask about the reviews..."
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow bg-stone-100 border-stone-300"
          />
          <Button onClick={sendMessage} className="self-end bg-stone-600 hover:bg-stone-700 text-stone-100">
            <SendIcon className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}