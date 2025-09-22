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
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { toast } = useToast();

  // Use all questions or fallback to mock data
  const quizQuestions = questions && questions.length > 0 ? questions : [
    {
      id: 'mock-1',
      question: "What is the primary benefit of using RAG (Retrieval-Augmented Generation) in AI systems?",
      options: [
        "Faster processing speed",
        "Improved accuracy with up-to-date information", 
        "Reduced computational requirements",
        "Better user interface design"
      ],
      correctAnswer: 1,
      explanation: "RAG combines the power of pre-trained language models with real-time information retrieval, allowing AI systems to provide more accurate and current responses by accessing external knowledge bases.",
      difficulty: 'medium' as const,
      category: 'RAG Systems',
      source: 'Mock Data'
    }
  ];

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const totalQuestions = quizQuestions.length;

  const handleAnswerSelect = (questionId: string, index: number) => {
    if (showResults[questionId]) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: index }));
  };

  const handleSubmit = (questionId: string) => {
    const selected = selectedAnswers[questionId];
    if (selected === undefined) return;
    
    setShowResults(prev => ({ ...prev, [questionId]: true }));
    const question = quizQuestions.find(q => q.id === questionId);
    if (!question) return;
    
    const isCorrect = selected === question.correctAnswer;
    
    toast({
      title: isCorrect ? "Correct!" : "Not quite right",
      description: isCorrect ? "Great job! You got it right." : "Don't worry, keep learning!",
      duration: 3000,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults({});
    setCurrentQuestionIndex(0);
  };

  return (
    <Card className="mb-4 p-6 bg-gradient-quiz/5 border-quiz-mode/20 shadow-chat">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-quiz flex items-center justify-center shadow-soft">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <Badge variant="secondary" className="bg-gradient-quiz text-white">
            Quiz Mode
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-foreground">{currentQuestion.question}</h3>
        
        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion.id] === index;
            const isShowingResult = showResults[currentQuestion.id];
            const isCorrect = index === currentQuestion.correctAnswer;
            const isWrong = isSelected && !isCorrect;
            
            let buttonClass = "w-full text-left p-4 rounded-lg border transition-smooth ";
            
            if (isShowingResult) {
              if (isCorrect) {
                buttonClass += "bg-green-50 border-green-200 text-green-800";
              } else if (isWrong) {
                buttonClass += "bg-red-50 border-red-200 text-red-800";
              } else {
                buttonClass += "bg-muted/50 border-border text-muted-foreground";
              }
            } else {
              buttonClass += isSelected
                ? "bg-quiz-mode/10 border-quiz-mode text-quiz-mode" 
                : "bg-background border-border hover:bg-accent hover:border-accent-foreground/20";
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                className={buttonClass}
                disabled={isShowingResult}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{option}</span>
                  {isShowingResult && (
                    <div className="flex-shrink-0 ml-2">
                      {isCorrect ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : isWrong ? (
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