import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { LLMSettings } from '@/types/LLMSettings'

interface SettingsComponentProps {
  settings: LLMSettings;
  onSettingsChange: (settings: LLMSettings) => void;
}

export default function SettingsComponent({ settings, onSettingsChange }: SettingsComponentProps) {
  return (
    <div className="space-y-4">
      <Select
        onValueChange={(value: 'Anthropic' | 'OpenAI') => onSettingsChange({ ...settings, provider: value })}
        value={settings.provider}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select LLM Provider" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Anthropic">Anthropic</SelectItem>
          <SelectItem value="OpenAI">OpenAI</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder="API Key"
        value={settings.apiKey}
        onChange={(e) => onSettingsChange({ ...settings, apiKey: e.target.value })}
        type="password"
      />

      <Select
        onValueChange={(value: string) => onSettingsChange({ ...settings, model: value })}
        value={settings.model}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Model" />
        </SelectTrigger>
        <SelectContent>
          {settings.provider === 'Anthropic' ? (
            <>
              <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
              <SelectItem value="claude-3.5-sonnet-20240620">Claude 3.5 Sonnet</SelectItem>
            </>
          ) : (
            <>
              <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}