import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Settings, Bot, User, Brain, BookOpen, Lightbulb, Zap, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { SettingsPanel } from './SettingsPanel';
import { QuizCard } from './QuizCard';
import { TutorMessage } from './TutorMessage';
import { SuggestionsPanel } from './SuggestionsPanel';
import { ThinkingSteps } from './ThinkingSteps';
import { DocumentSources } from './DocumentSources';
import { sageBotAPI, isApiError, getErrorMessage, ThinkingStep, DocumentSource, PipelineMode, QuizQuestion, TutorSection } from '@/lib/api';
// Using public asset path in Next.js
const chatBgUrl = '/chat-bg.jpg';

export type ChatMode = 'quiz' | 'tutor' | 'suggestions';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  mode?: ChatMode;
  timestamp: Date;
  // RAG-specific fields
  thinkingSteps?: ThinkingStep[];
  sources?: DocumentSource[];
  pipelineInfo?: string;
  isLoading?: boolean;
  error?: string;
  // Mode-specific payloads
  quizQuestions?: QuizQuestion[];
  tutorialSections?: TutorSection[];
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI learning assistant. I can help you in different modes: Quiz for testing knowledge, Tutor for detailed explanations, or Suggestions for creative ideas. How would you like to start?',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [currentMode, setCurrentMode] = useState<ChatMode>('tutor');
  const [selectedPipeline, setSelectedPipeline] = useState<PipelineMode>('adaptive');
  const [showSettings, setShowSettings] = useState(false);
  // Track which message IDs have expanded panels
  const [expandedThinking, setExpandedThinking] = useState<Set<string>>(new Set());
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleThinking = (id: string) => {
    setExpandedThinking(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSources = (id: string) => {
    setExpandedSources(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      mode: currentMode,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = inputValue;
    setInputValue('');

    // Add loading message
    const loadingMessageId = (Date.now() + 1).toString();
    const loadingMessage: Message = {
      id: loadingMessageId,
      content: 'Thinking...',
      isUser: false,
      mode: currentMode,
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      if (currentMode === 'quiz') {
        const result = await sageBotAPI.generateQuiz(messageContent, {
          topic: messageContent,
        });

        setMessages(prev => prev.map(msg =>
          msg.id === loadingMessageId ? {
            ...msg,
            content: result.success && result.questions && result.questions.length > 0
              ? 'Here are your quiz questions:'
              : (result.error || 'Unable to generate quiz questions.'),
            quizQuestions: result.questions,
            thinkingSteps: result.thinkingSteps,
            sources: result.sources,
            pipelineInfo: result.pipelineInfo,
            isLoading: false,
          } : msg
        ));

        toast({
          title: 'Quiz generated',
          description: result.pipelineInfo || 'RAG pipeline executed',
          duration: 3000,
        });
      } else if (currentMode === 'tutor') {
        const result = await sageBotAPI.getTutorial(messageContent, {
          topic: messageContent,
        });

        setMessages(prev => prev.map(msg =>
          msg.id === loadingMessageId ? {
            ...msg,
            content: result.success && result.tutorialSections && result.tutorialSections.length > 0
              ? 'Here is your tutorial overview:'
              : (result.error || 'Unable to generate tutorial.'),
            tutorialSections: result.tutorialSections,
            thinkingSteps: result.thinkingSteps,
            sources: result.sources,
            pipelineInfo: result.pipelineInfo,
            isLoading: false,
          } : msg
        ));

        toast({
          title: 'Tutorial generated',
          description: result.pipelineInfo || 'RAG pipeline executed',
          duration: 3000,
        });
      } else {
        const response = await sageBotAPI.chat.sendMessage({
          message: messageContent,
          mode: currentMode,
          pipeline: selectedPipeline,
        });

        // Replace loading message with actual response
        setMessages(prev => prev.map(msg => 
          msg.id === loadingMessageId ? {
            ...msg,
            content: response.response,
            thinkingSteps: response.thinkingSteps,
            sources: response.sources,
            pipelineInfo: response.pipelineUsed,
            isLoading: false,
          } : msg
        ));

        toast({
          title: `Response from ${currentMode} mode`,
          description: `Using ${response.pipelineUsed} pipeline`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Replace loading message with error message
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessageId ? {
          ...msg,
          content: 'Sorry, I encountered an error while processing your message. Please try again.',
          error: isApiError(error) ? getErrorMessage(error) : 'Unknown error occurred',
          isLoading: false,
        } : msg
      ));

      toast({
        title: 'Error',
        description: isApiError(error) ? getErrorMessage(error) : 'Failed to send message',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };


  const getModeIcon = (mode: ChatMode) => {
    switch (mode) {
      case 'quiz': return <Brain className="h-4 w-4" />;
      case 'tutor': return <BookOpen className="h-4 w-4" />;
      case 'suggestions': return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getModeColor = (mode: ChatMode) => {
    switch (mode) {
      case 'quiz': return 'bg-gradient-quiz text-white';
      case 'tutor': return 'bg-gradient-tutor text-white';
      case 'suggestions': return 'bg-gradient-suggestions text-white';
    }
  };

  const renderMessage = (message: Message) => {
    // Special handling for mode-specific responses
    if (message.mode === 'quiz' && !message.isUser && !message.isLoading) {
      return (
        <div key={message.id} className="mb-6">
          <QuizCard content={message.content} questions={message.quizQuestions} />
          {message.thinkingSteps && (
            <ThinkingSteps 
              steps={message.thinkingSteps}
              isVisible={expandedThinking.has(message.id)}
              onToggle={() => toggleThinking(message.id)}
            />
          )}
          {message.sources && (
            <DocumentSources 
              sources={message.sources}
              isVisible={expandedSources.has(message.id)}
              onToggle={() => toggleSources(message.id)}
            />
          )}
        </div>
      );
    }
    
    if (message.mode === 'tutor' && !message.isUser && !message.isLoading) {
      return (
        <div key={message.id} className="mb-6">
          <TutorMessage content={message.content} sections={message.tutorialSections} />
          {message.thinkingSteps && (
            <ThinkingSteps 
              steps={message.thinkingSteps}
              isVisible={expandedThinking.has(message.id)}
              onToggle={() => toggleThinking(message.id)}
            />
          )}
          {message.sources && (
            <DocumentSources 
              sources={message.sources}
              isVisible={expandedSources.has(message.id)}
              onToggle={() => toggleSources(message.id)}
            />
          )}
        </div>
      );
    }
    
    if (message.mode === 'suggestions' && !message.isUser && !message.isLoading) {
      return (
        <div key={message.id} className="mb-6">
          <SuggestionsPanel content={message.content} />
          {message.thinkingSteps && <ThinkingSteps steps={message.thinkingSteps} />}
          {message.sources && <DocumentSources sources={message.sources} />}
        </div>
      );
    }

    return (
      <div
        key={message.id}
        className={`flex items-start gap-4 mb-6 animate-fade-in ${
          message.isUser ? 'justify-end' : 'justify-start'
        }`}
      >
        {!message.isUser && (
          <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-elegant">
            {message.isLoading ? (
              <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
            ) : (
              <Bot className="h-5 w-5 text-primary-foreground" />
            )}
          </div>
        )}
        
        <div className="max-w-[80%] space-y-3">
          <Card className={`p-5 shadow-elegant transition-spring hover:shadow-mode rounded-2xl ${
            message.isUser 
              ? 'bg-gradient-primary text-primary-foreground border-0' 
              : 'bg-chat-bubble/80 backdrop-blur-sm border border-border/50'
          } ${message.error ? 'border-destructive/50 bg-destructive/5' : ''}`}>
            <p className="text-sm leading-relaxed font-inter">
              {message.isLoading && (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {message.content}
                </span>
              )}
              {!message.isLoading && message.content}
            </p>
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs opacity-60 font-medium">
                {message.timestamp.toLocaleTimeString()}
              </span>
              {message.pipelineInfo && (
                <Badge variant="secondary" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  {message.pipelineInfo}
                </Badge>
              )}
            </div>
            
            {message.error && (
              <div className="mt-2 text-xs text-destructive opacity-80">
                Error: {message.error}
              </div>
            )}
          </Card>
          
          {/* RAG-specific components for non-mode-specific responses */}
          {!message.isUser && !message.isLoading && (
            <>
              {message.thinkingSteps && (
                <ThinkingSteps 
                  steps={message.thinkingSteps}
                  isVisible={expandedThinking.has(message.id)}
                  onToggle={() => toggleThinking(message.id)}
                />
              )}
              {message.sources && (
                <DocumentSources 
                  sources={message.sources}
                  isVisible={expandedSources.has(message.id)}
                  onToggle={() => toggleSources(message.id)}
                />
              )}
            </>
          )}
        </div>

        {message.isUser && (
          <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-muted/80 backdrop-blur-sm flex items-center justify-center shadow-soft">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-gradient-background relative overflow-hidden"
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      <div className="relative z-10 max-w-4xl mx-auto p-4 h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 p-6 bg-card/60 backdrop-blur-xl rounded-2xl border shadow-elegant animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-mode animate-glow">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold font-inter tracking-tight">RAG Assistant</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={`text-sm font-medium ${getModeColor(currentMode)} shadow-soft`}>
                  {getModeIcon(currentMode)}
                  <span className="ml-2 capitalize">{currentMode} Mode</span>
                </Badge>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            className="hover:bg-accent transition-spring rounded-xl h-12 w-12"
          >
            <Settings className="h-6 w-6" />
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <SettingsPanel
            currentMode={currentMode}
            onModeChange={setCurrentMode}
            selectedPipeline={selectedPipeline}
            onPipelineChange={setSelectedPipeline}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-background">
          <div className="p-4">
            {messages.map(renderMessage)}
          </div>
        </div>

        {/* Settings Panel */}
        <Card className="p-6 bg-card/80 backdrop-blur-xl border shadow-elegant rounded-2xl animate-slide-up">
          <div className="flex gap-4 items-center">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Ask something in ${currentMode} mode...`}
              className="flex-1 bg-background/60 backdrop-blur-sm border-border/50 focus:ring-2 focus:ring-primary/30 transition-spring rounded-xl h-12 px-4 font-inter"
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              className={`${getModeColor(currentMode)} hover:opacity-90 transition-spring shadow-elegant h-12 w-12 rounded-xl`}
              size="icon"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};