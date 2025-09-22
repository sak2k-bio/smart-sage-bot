import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Search, 
  FileText, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Zap,
  Bot
} from 'lucide-react';
import { ThinkingStep, getStatusIcon } from '@/lib/api';

interface ThinkingStepsProps {
  steps: ThinkingStep[];
  pipelineInfo?: string;
  isVisible?: boolean;
  onToggle?: () => void;
}

// Agent icon mapping
const agentIcons: Record<string, React.ReactNode> = {
  'QueryAgent': <Search className="w-4 h-4" />,
  'RetrievalAgent': <FileText className="w-4 h-4" />,
  'AnswerAgent': <MessageSquare className="w-4 h-4" />,
  'CriticAgent': <AlertCircle className="w-4 h-4" />,
  'RefineAgent': <CheckCircle className="w-4 h-4" />,
  'QuizAgent': <Brain className="w-4 h-4" />,
  'TutorAgent': <Brain className="w-4 h-4" />,
  'Pipeline': <Zap className="w-4 h-4" />,
  'CreativeAgent': <Brain className="w-4 h-4" />,
};

const getAgentIcon = (agentName: string) => {
  return agentIcons[agentName] || <Bot className="w-4 h-4" />;
};

const getStatusColor = (status: ThinkingStep['status']) => {
  switch (status) {
    case 'processing': 
      return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
    case 'completed': 
      return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800';
    case 'error': 
      return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
    default: 
      return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
  }
};

const getStatusReactIcon = (status: ThinkingStep['status']) => {
  switch (status) {
    case 'processing': return <Clock className="w-3 h-3 animate-spin" />;
    case 'completed': return <CheckCircle className="w-3 h-3" />;
    case 'error': return <AlertCircle className="w-3 h-3" />;
    default: return <Clock className="w-3 h-3" />;
  }
};

export const ThinkingSteps: React.FC<ThinkingStepsProps> = ({ 
  steps, 
  pipelineInfo, 
  isVisible = false,
  onToggle 
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const toggleStepDetails = (index: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSteps(newExpanded);
  };

  if (!steps || steps.length === 0) {
    return null;
  }

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const hasErrors = steps.some(step => step.status === 'error');

  return (
    <Card className="mb-4 bg-gradient-to-r from-purple-50/50 via-blue-50/50 to-indigo-50/50 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-indigo-900/10 border-purple-200/50 dark:border-purple-700/50 shadow-soft animate-fade-in">
      <div className="p-4">
        {/* Header with toggle */}
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-purple-100/30 dark:hover:bg-purple-800/20 rounded-lg p-2 -m-2 transition-spring group"
          onClick={onToggle}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-elegant">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                AI Thinking Process
              </h3>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {completedSteps}/{totalSteps} steps completed
                </span>
                {hasErrors && (
                  <Badge variant="destructive" className="text-xs">
                    Issues detected
                  </Badge>
                )}
                {pipelineInfo && (
                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200">
                    {pipelineInfo}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Progress indicator */}
            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
              />
            </div>
            
            {isVisible ? (
              <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 transition-colors" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 transition-colors" />
            )}
          </div>
        </div>

        {/* Thinking steps content */}
        {isVisible && (
          <div className="mt-4 space-y-3 animate-slide-up">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`rounded-lg border p-3 transition-spring hover:shadow-soft ${getStatusColor(step.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Agent icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getAgentIcon(step.agent)}
                    </div>
                    
                    {/* Step content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">
                          {step.agent}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {step.step}
                        </span>
                      </div>
                      
                      <p className="text-sm leading-relaxed mb-2">
                        {step.message}
                      </p>
                      
                      {/* Details toggle */}
                      {step.details && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStepDetails(index)}
                          className="text-xs p-1 h-auto hover:bg-white/50 dark:hover:bg-gray-800/50"
                        >
                          {expandedSteps.has(index) ? 'Hide' : 'Show'} Details
                          <ChevronDown 
                            className={`w-3 h-3 ml-1 transition-transform ${
                              expandedSteps.has(index) ? 'rotate-180' : ''
                            }`}
                          />
                        </Button>
                      )}
                      
                      {/* Expanded details */}
                      {expandedSteps.has(index) && step.details && (
                        <div className="mt-2 p-2 bg-white/30 dark:bg-gray-800/30 rounded text-xs">
                          <pre className="whitespace-pre-wrap text-xs overflow-x-auto">
                            {typeof step.details === 'string' 
                              ? step.details 
                              : JSON.stringify(step.details, null, 2)
                            }
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status indicator */}
                  <div className="flex-shrink-0 flex items-center space-x-1 ml-2">
                    {getStatusReactIcon(step.status)}
                    <span className="text-xs font-medium capitalize hidden sm:inline">
                      {step.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Summary footer */}
            <div className="mt-4 pt-3 border-t border-purple-200/50 dark:border-purple-700/50">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total processing time: ~{steps.length * 0.5}s
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    <span>{completedSteps}</span>
                  </div>
                  {hasErrors && (
                    <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                      <AlertCircle className="w-3 h-3" />
                      <span>{steps.filter(s => s.status === 'error').length}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};