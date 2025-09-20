import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface TutorMessageProps {
  content: string;
}

export const TutorMessage = ({ content }: TutorMessageProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const tutorData = {
    overview: {
      title: "Overview",
      content: "RAG (Retrieval-Augmented Generation) is an advanced AI architecture that combines the strengths of large language models with external knowledge retrieval systems."
    },
    keyPoints: {
      title: "Key Concepts",
      points: [
        "Retrieval Component: Searches through external knowledge bases",
        "Generation Component: Uses retrieved information to create responses", 
        "Dynamic Knowledge: Can access up-to-date information beyond training data",
        "Contextual Accuracy: Provides more precise and relevant answers"
      ]
    },
    examples: {
      title: "Real-World Applications",
      content: "RAG is used in customer support chatbots, research assistants, and educational platforms where current, accurate information is crucial for quality responses."
    },
    nextSteps: {
      title: "Learning Path",
      steps: [
        "Understanding vector databases and embeddings",
        "Learning about information retrieval techniques", 
        "Exploring different RAG architectures",
        "Implementing RAG systems with modern frameworks"
      ]
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const renderSection = (key: string, section: any) => {
    const isExpanded = expandedSections.has(key);
    
    return (
      <div key={key} className="border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(key)}
          className="w-full p-4 text-left hover:bg-accent/50 transition-smooth flex items-center justify-between"
        >
          <span className="font-medium text-sm">{section.title}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        
        {isExpanded && (
          <div className="p-4 pt-0 border-t border-border/50">
            {section.content && (
              <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                {section.content}
              </p>
            )}
            {section.points && (
              <ul className="space-y-2">
                {section.points.map((point: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-tutor-mode mt-2 flex-shrink-0" />
                    <span className="text-foreground/80">{point}</span>
                  </li>
                ))}
              </ul>
            )}
            {section.steps && (
              <ol className="space-y-2">
                {section.steps.map((step: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-gradient-tutor flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-foreground/80 mt-1">{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="mb-4 p-6 bg-gradient-tutor/5 border-tutor-mode/20 shadow-chat">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-tutor flex items-center justify-center shadow-soft">
          <BookOpen className="h-4 w-4 text-white" />
        </div>
        <Badge variant="secondary" className="bg-gradient-tutor text-white">
          Tutor Mode
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          {Object.entries(tutorData).map(([key, section]) => 
            renderSection(key, section)
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            className="border-tutor-mode text-tutor-mode hover:bg-tutor-mode/5"
          >
            <ExternalLink className="h-3 w-3 mr-2" />
            Learn More
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-tutor-mode text-tutor-mode hover:bg-tutor-mode/5"
          >
            Related Topics
          </Button>
        </div>
      </div>
    </Card>
  );
};