import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Brain, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { QuizQuestion } from '@/lib/api';

interface QuizCardProps {
  content: string;
  questions?: QuizQuestion[];
}

export const QuizCard = ({ content, questions }: QuizCardProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { toast } = useToast();

  // Prefer server-provided question when available; otherwise fallback to mock
  const first = questions && questions.length > 0 ? questions[0] : null;
  const quizData = first ? {
    question: first.question,
    options: first.options,
    correctAnswer: first.correctAnswer,
    explanation: first.explanation,
  } : {
    question: "What is the primary benefit of using RAG (Retrieval-Augmented Generation) in AI systems?",
    options: [
      "Faster processing speed",
      "Improved accuracy with up-to-date information", 
      "Reduced computational requirements",
      "Better user interface design"
    ],
    correctAnswer: 1,
    explanation: "RAG combines the power of pre-trained language models with real-time information retrieval, allowing AI systems to provide more accurate and current responses by accessing external knowledge bases."
  };

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    setShowResult(true);
    const isCorrect = selectedAnswer === quizData.correctAnswer;
    
    toast({
      title: isCorrect ? "Correct!" : "Not quite right",
      description: isCorrect ? "Great job! You got it right." : "Don't worry, keep learning!",
      duration: 3000,
    });
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setShowResult(false);
  };

  return (
    <Card className="mb-4 p-6 bg-gradient-quiz/5 border-quiz-mode/20 shadow-chat">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-quiz flex items-center justify-center shadow-soft">
          <Brain className="h-4 w-4 text-white" />
        </div>
        <Badge variant="secondary" className="bg-gradient-quiz text-white">
          Quiz Mode
        </Badge>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-foreground">{quizData.question}</h3>
        
        <div className="space-y-2">
          {quizData.options.map((option, index) => {
            let buttonClass = "w-full text-left p-4 rounded-lg border transition-smooth ";
            
            if (showResult) {
              if (index === quizData.correctAnswer) {
                buttonClass += "bg-green-50 border-green-200 text-green-800";
              } else if (index === selectedAnswer && index !== quizData.correctAnswer) {
                buttonClass += "bg-red-50 border-red-200 text-red-800";
              } else {
                buttonClass += "bg-muted/50 border-border text-muted-foreground";
              }
            } else {
              buttonClass += selectedAnswer === index 
                ? "bg-quiz-mode/10 border-quiz-mode text-quiz-mode" 
                : "bg-background border-border hover:bg-accent hover:border-accent-foreground/20";
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={buttonClass}
                disabled={showResult}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{option}</span>
                  {showResult && (
                    <div className="flex-shrink-0 ml-2">
                      {index === quizData.correctAnswer ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : index === selectedAnswer ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : null}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {showResult && (
          <Card className="p-4 bg-accent/50 border-accent">
            <h4 className="font-medium text-sm mb-2 text-accent-foreground">Explanation:</h4>
            <p className="text-sm text-accent-foreground/80 leading-relaxed">
              {quizData.explanation}
            </p>
          </Card>
        )}

        <div className="flex gap-2 pt-2">
          {!showResult ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="bg-gradient-quiz hover:opacity-90 transition-smooth"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-quiz-mode text-quiz-mode hover:bg-quiz-mode/5"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};