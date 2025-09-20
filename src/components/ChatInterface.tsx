import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Settings, Bot, User, Brain, BookOpen, Lightbulb } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { SettingsPanel } from './SettingsPanel';
import { QuizCard } from './QuizCard';
import { TutorMessage } from './TutorMessage';
import { SuggestionsPanel } from './SuggestionsPanel';
import chatBg from '@/assets/chat-bg.jpg';

export type ChatMode = 'quiz' | 'tutor' | 'suggestions';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  mode?: ChatMode;
  timestamp: Date;
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
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response based on mode
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateResponse(inputValue, currentMode),
        isUser: false,
        mode: currentMode,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);

    toast({
      title: `Message sent in ${currentMode} mode`,
      description: `Processing your request...`,
      duration: 2000,
    });
  };

  const generateResponse = (input: string, mode: ChatMode): string => {
    const responses = {
      quiz: `Great question! Let me create a quiz about "${input}". Here's a question to test your understanding...`,
      tutor: `Excellent! Let me explain "${input}" in detail. This concept involves several key aspects that I'll break down for you...`,
      suggestions: `Interesting topic! Here are some creative suggestions related to "${input}" that might inspire you...`,
    };
    return responses[mode];
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
    if (message.mode === 'quiz' && !message.isUser) {
      return <QuizCard key={message.id} content={message.content} />;
    }
    
    if (message.mode === 'tutor' && !message.isUser) {
      return <TutorMessage key={message.id} content={message.content} />;
    }
    
    if (message.mode === 'suggestions' && !message.isUser) {
      return <SuggestionsPanel key={message.id} content={message.content} />;
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
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
        
        <Card className={`max-w-[80%] p-5 shadow-elegant transition-spring hover:shadow-mode rounded-2xl ${
          message.isUser 
            ? 'bg-gradient-primary text-primary-foreground border-0' 
            : 'bg-chat-bubble/80 backdrop-blur-sm border border-border/50'
        }`}>
          <p className="text-sm leading-relaxed font-inter">{message.content}</p>
          <span className="text-xs opacity-60 mt-3 block font-medium">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </Card>

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
      style={{
        backgroundImage: `url(${chatBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
      }}
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
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-background">
          <div className="p-4">
            {messages.map(renderMessage)}
          </div>
        </div>

        {/* Input Area */}
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