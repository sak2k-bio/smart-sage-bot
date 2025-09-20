import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, BookOpen, Lightbulb, X } from 'lucide-react';
import type { ChatMode } from './ChatInterface';

interface SettingsPanelProps {
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  onClose: () => void;
}

export const SettingsPanel = ({ currentMode, onModeChange, onClose }: SettingsPanelProps) => {
  const modes = [
    {
      id: 'quiz' as ChatMode,
      name: 'Quiz Mode',
      description: 'Interactive questions and knowledge testing',
      icon: Brain,
      color: 'bg-gradient-quiz',
      features: ['Multiple choice questions', 'Instant feedback', 'Progress tracking', 'Adaptive difficulty']
    },
    {
      id: 'tutor' as ChatMode,
      name: 'Tutor Mode', 
      description: 'Detailed explanations and learning guidance',
      icon: BookOpen,
      color: 'bg-gradient-tutor',
      features: ['Step-by-step explanations', 'Examples and analogies', 'Concept breakdowns', 'Learning paths']
    },
    {
      id: 'suggestions' as ChatMode,
      name: 'Suggestions Mode',
      description: 'Creative ideas and brainstorming assistance',
      icon: Lightbulb,
      color: 'bg-gradient-suggestions',
      features: ['Creative brainstorming', 'Alternative approaches', 'Inspiration prompts', 'Idea generation']
    }
  ];

  return (
    <Card className="mb-4 p-6 bg-card/95 backdrop-blur-md border shadow-mode">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Chat Settings</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-accent">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">Select Chat Mode</h4>
          <div className="grid gap-4 md:grid-cols-3">
            {modes.map((mode) => (
              <Card
                key={mode.id}
                className={`p-4 cursor-pointer transition-smooth hover:shadow-soft border-2 ${
                  currentMode === mode.id 
                    ? 'border-primary shadow-mode' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onModeChange(mode.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${mode.color} flex items-center justify-center shadow-soft`}>
                    <mode.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-sm">{mode.name}</h5>
                      {currentMode === mode.id && (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{mode.description}</p>
                    
                    <div className="space-y-1">
                      {mode.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">About RAG Assistant</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This AI assistant uses Retrieval-Augmented Generation (RAG) to provide accurate, contextual responses. 
            Each mode is optimized for different learning styles and interaction preferences.
          </p>
        </div>
      </div>
    </Card>
  );
};