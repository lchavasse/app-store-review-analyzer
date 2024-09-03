import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendIcon } from "lucide-react"
import { LLMSettings } from '@/types/LLMSettings'
import { Review } from '@/types/Review'

interface ChatMessage {
  text: string;
  isUser: boolean;
}

interface OpenAIChatProps {
  reviews: Review[];
  llmSettings: LLMSettings;
}

export default function OpenAIChat({ reviews, llmSettings }: OpenAIChatProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [userMessage, setUserMessage] = useState('')

  const sendMessage = async () => {
    if (!userMessage.trim()) return

    const newUserMessage: ChatMessage = { text: userMessage, isUser: true }
    setChatMessages(prev => [...prev, newUserMessage])
    setUserMessage('')

    // TODO: Implement OpenAI API call here
    // This is a placeholder response
    const aiResponse: ChatMessage = { text: "This is a placeholder response from OpenAI. Implement the actual API call here.", isUser: false }
    setChatMessages(prev => [...prev, aiResponse])
  }

  return (
    <div className="mt-4">
      <div className="bg-white rounded-lg p-4 h-64 overflow-y-auto mb-4">
        {chatMessages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.isUser ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {message.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex">
        <Textarea
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Ask about the reviews..."
          className="flex-grow mr-2"
        />
        <Button onClick={sendMessage} className="bg-blue-500 hover:bg-blue-600">
          <SendIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}