import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SendIcon } from "lucide-react"
import { Review } from '@/types/Review' // Add this import
import { LLMSettings } from '@/types/LLMSettings' // Add this import

interface ChatMessage {
  text: string;
  isUser: boolean;
}

interface ClaudeAIChatProps {
  reviews: Review[];
  llmSettings: LLMSettings; // Add this prop
}

export default function ClaudeAIChat({ reviews, llmSettings }: ClaudeAIChatProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [userMessage, setUserMessage] = useState('')

  const sendMessage = async () => {
    if (userMessage.trim()) {
      const newMessage: ChatMessage = { text: userMessage, isUser: true };
      setChatMessages(prevMessages => [...prevMessages, newMessage]);

      try {
        const response = await fetch('/api/claude', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: userMessage,
            reviews,
            llmSettings,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response from Claude AI');
        }

        const data = await response.json();
        const aiMessage: ChatMessage = { text: data.response, isUser: false };
        setChatMessages(prevMessages => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error('Error communicating with Claude AI:', error);
        const errorMessage: ChatMessage = { text: "Sorry, I couldn't process your request. Please try again.", isUser: false };
        setChatMessages(prevMessages => [...prevMessages, errorMessage]);
      }

      setUserMessage('');
    }
  }

  return (
    <Card className="bg-stone-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-stone-800">AI Analysis Chat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-100 overflow-y-auto bg-stone-100 p-4 rounded-md shadow-inner">
          {chatMessages.map((msg, index) => (
            <div key={index} className={`mb-2 ${msg.isUser ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded-lg ${msg.isUser ? 'bg-stone-600 text-stone-100' : 'bg-stone-300 text-stone-800'}`}>
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Textarea
            placeholder="Ask about the reviews..."
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
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