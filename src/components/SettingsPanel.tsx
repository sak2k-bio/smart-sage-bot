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
    <Card className="mb-6 p-8 bg-card/90 backdrop-blur-xl border shadow-elegant rounded-2xl animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold font-inter tracking-tight">Chat Settings</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-accent transition-spring rounded-xl h-10 w-10">
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold mb-4 text-muted-foreground font-inter tracking-wide uppercase">Select Chat Mode</h4>
          <div className="grid gap-6 md:grid-cols-3">
            {modes.map((mode) => (
              <Card
                key={mode.id}
                className={`p-6 cursor-pointer transition-spring hover:shadow-elegant border-2 rounded-2xl animate-fade-in ${
                  currentMode === mode.id 
                    ? 'border-primary shadow-mode bg-card/90' 
                    : 'border-border/50 hover:border-primary/50 bg-card/60'
                }`}
                onClick={() => onModeChange(mode.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${mode.color} flex items-center justify-center shadow-elegant`}>
                    <mode.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h5 className="font-semibold text-base font-inter">{mode.name}</h5>
                      {currentMode === mode.id && (
                        <Badge variant="secondary" className="text-xs bg-primary/20 text-primary font-medium">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 font-inter leading-relaxed">{mode.description}</p>
                    
                    <div className="space-y-2">
                      {mode.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
                          <span className="text-xs text-muted-foreground font-inter">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-border/50">
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground font-inter tracking-wide uppercase">About RAG Assistant</h4>
          <p className="text-sm text-muted-foreground leading-relaxed font-inter">
            This AI assistant uses Retrieval-Augmented Generation (RAG) to provide accurate, contextual responses. 
            Each mode is optimized for different learning styles and interaction preferences.
          </p>
        </div>
      </div>
    </Card>
  );
};