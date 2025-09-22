import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { SuggestionsData } from '@/lib/api';

interface SuggestionsPanelProps {
  content: string;
  suggestions?: SuggestionsData;
}

export const SuggestionsPanel = ({ content, suggestions }: SuggestionsPanelProps) => {
  const [refreshCount, setRefreshCount] = useState(0);

  // Use real suggestions or fall back to defaults
  const suggestionCategories = suggestions ? [
    {
      title: "Creative Applications",
      color: "bg-gradient-suggestions",
      suggestions: suggestions.creativeApplications || []
    },
    {
      title: "Learning & Education",
      color: "bg-purple-500",
      suggestions: suggestions.learningEducation || []
    },
    {
      title: "Business Solutions", 
      color: "bg-blue-500",
      suggestions: suggestions.businessSolutions || []
    }
  ] : [
    // Fallback suggestions if no data provided
    {
      title: "Creative Applications",
      color: "bg-gradient-suggestions",
      suggestions: [
        "Analyzing creative applications...",
        "Generating innovative ideas...",
        "Processing context for suggestions..."
      ]
    },
    {
      title: "Learning & Education",
      color: "bg-purple-500",
      suggestions: [
        "Exploring educational applications...",
        "Generating learning strategies...",
        "Creating educational content ideas..."
      ]
    },
    {
      title: "Business Solutions", 
      color: "bg-blue-500",
      suggestions: [
        "Analyzing business applications...",
        "Generating professional use cases...",
        "Creating business solutions..."
      ]
    }
  ];

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
    // In a real app, this would fetch new suggestions from the AI
  };

  return (
    <Card className="mb-4 p-6 bg-gradient-suggestions/5 border-suggestions-mode/20 shadow-chat">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-suggestions flex items-center justify-center shadow-soft">
            <Lightbulb className="h-4 w-4 text-white" />
          </div>
          <Badge variant="secondary" className="bg-gradient-suggestions text-white">
            Suggestions Mode
          </Badge>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="border-suggestions-mode text-suggestions-mode hover:bg-suggestions-mode/5"
        >
          <RefreshCw className="h-3 w-3 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-suggestions-mode" />
          <h3 className="font-medium text-foreground">Creative Ideas & Suggestions</h3>
        </div>

        {suggestionCategories.map((category, categoryIndex) => (
          <div key={`${category.title}-${refreshCount}`} className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${category.color}`} />
              {category.title}
            </h4>
            
            <div className="grid gap-2">
              {category.suggestions.map((suggestion, index) => (
                <Card
                  key={`${categoryIndex}-${index}-${refreshCount}`}
                  className="p-3 hover:bg-accent/50 transition-smooth cursor-pointer border border-border/50 hover:border-suggestions-mode/30 group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-foreground/80 leading-relaxed flex-1">
                      {suggestion}
                    </p>
                    <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-suggestions-mode transition-smooth ml-3 flex-shrink-0" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}

        <Card className="p-4 bg-accent/30 border-accent">
          <div className="flex items-start gap-3">
            <Sparkles className="h-4 w-4 text-suggestions-mode mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-sm mb-1 text-accent-foreground">Pro Tip</h4>
              <p className="text-xs text-accent-foreground/80 leading-relaxed">
                {suggestions?.proTip || 
                  'Combine different suggestion categories to create unique, innovative solutions. The best ideas often come from unexpected connections between different domains.'}
              </p>
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            size="sm"
            className="bg-gradient-suggestions hover:opacity-90 transition-smooth"
          >
            <Lightbulb className="h-3 w-3 mr-2" />
            Explore Idea
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-suggestions-mode text-suggestions-mode hover:bg-suggestions-mode/5"
          >
            Save Suggestions
          </Button>
        </div>
      </div>
    </Card>
  );
};