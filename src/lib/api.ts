// API Client for Smart Sage Bot RAG Backend
import { ChatMode } from '@/components/ChatInterface';

// API Configuration
// Use same-origin Next.js API routes
const API_BASE_URL = '';

// Types matching backend responses
export interface ThinkingStep {
  agent: string;
  step: string;
  status: 'processing' | 'completed' | 'error';
  message: string;
  details?: any;
}

export interface DocumentSource {
  content: string;
  metadata: any;
  distance: number;
  preview?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  source: string;
}

export interface TutorSection {
  id: string;
  title: string;
  content: string;
  type: 'explanation' | 'example' | 'exercise' | 'summary';
  sources: DocumentSource[];
}

export interface ChatResponse {
  success: boolean;
  answer?: string;
  thinkingSteps?: ThinkingStep[];
  pipelineInfo?: string;
  sources?: DocumentSource[];
  mode?: string;
  timestamp?: string;
  error?: string;
}

export interface QuizResponse {
  success: boolean;
  questions?: QuizQuestion[];
  thinkingSteps?: ThinkingStep[];
  pipelineInfo?: string;
  sources?: DocumentSource[];
  metadata?: {
    topic: string;
    difficulty: string;
    questionCount: number;
  };
  error?: string;
}

export interface TutorResponse {
  success: boolean;
  tutorialSections?: TutorSection[];
  thinkingSteps?: ThinkingStep[];
  pipelineInfo?: string;
  sources?: DocumentSource[];
  metadata?: {
    topic: string;
    userLevel: string;
    sectionCount: number;
  };
  error?: string;
}

export interface SystemStatus {
  success: boolean;
  status?: {
    overall: string;
    vectorStore: {
      status: string;
      documentCount: number;
      collectionName: string;
    };
    environment: {
      googleApiKey: string;
      qdrantConfig: string;
    };
    issues: string[];
  };
}

export type PipelineMode = 'adaptive' | 'simple' | 'advanced' | 'multi-modal';

class SmartSageBotAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Helper method for making HTTP requests
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Map UI pipeline to server pipelineMode
  private mapPipeline(pipeline: PipelineMode): 'meta' | 'auto' | 'phase1' | 'phase2' | 'phase3' {
    switch (pipeline) {
      case 'simple':
        return 'phase1';
      case 'advanced':
        return 'phase3';
      case 'multi-modal':
        return 'auto';
      case 'adaptive':
      default:
        return 'meta';
    }
  }

  // Health check
  async healthCheck(): Promise<{ success: boolean; status: string; environment: string }> {
    return this.makeRequest('/health');
  }

  // Chat object with sendMessage method
  chat = {
    sendMessage: async (params: {
      message: string;
      mode: ChatMode;
      pipeline: PipelineMode;
    }): Promise<{
      response: string;
      thinkingSteps?: ThinkingStep[];
      sources?: DocumentSource[];
      pipelineUsed?: string;
    }> => {
      const result = await this.makeRequest<ChatResponse>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: params.message,
          mode: params.mode,
          pipelineMode: this.mapPipeline(params.pipeline),
        }),
      });

      // Transform backend response to match expected interface
      return {
        response: result.answer || 'No response received',
        thinkingSteps: result.thinkingSteps,
        sources: result.sources,
        pipelineUsed: result.pipelineInfo,
      };
    }
  };

  // Suggestions endpoint
  async getSuggestions(
    message: string,
    creativity: 'conservative' | 'balanced' | 'innovative' = 'balanced',
    domain?: string
  ): Promise<ChatResponse> {
    return this.makeRequest('/api/chat/suggest', {
      method: 'POST',
      body: JSON.stringify({
        message,
        creativity,
        domain,
      }),
    });
  }

  // Quiz endpoints
  async generateQuiz(
    message: string,
    options: {
      topic?: string;
      difficulty?: 'easy' | 'medium' | 'hard';
      questionCount?: number;
    } = {}
  ): Promise<QuizResponse> {
    return this.makeRequest('/api/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({
        message,
        topic: options.topic,
        difficulty: options.difficulty || 'medium',
        questionCount: options.questionCount || 5,
      }),
    });
  }

  async validateQuizAnswer(
    questionId: string,
    selectedAnswer: number,
    correctAnswer: number,
    explanation: string
  ): Promise<{
    success: boolean;
    isCorrect: boolean;
    feedback: string;
    explanation: string;
  }> {
    return this.makeRequest('/api/quiz/validate', {
      method: 'POST',
      body: JSON.stringify({
        questionId,
        selectedAnswer,
        correctAnswer,
        explanation,
      }),
    });
  }

  async getQuizTopics(): Promise<{
    success: boolean;
    topics: Array<{
      name: string;
      description: string;
      difficulty: string;
      estimatedQuestions: number;
    }>;
  }> {
    return this.makeRequest('/api/quiz/topics');
  }

  // Tutor endpoints
  async getTutorial(
    message: string,
    options: {
      topic?: string;
      userLevel?: 'beginner' | 'intermediate' | 'advanced';
      learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    } = {}
  ): Promise<TutorResponse> {
    return this.makeRequest('/api/tutor/explain', {
      method: 'POST',
      body: JSON.stringify({
        message,
        topic: options.topic,
        userLevel: options.userLevel || 'intermediate',
        learningStyle: options.learningStyle || 'reading',
      }),
    });
  }

  async getFeedback(
    topic: string,
    completedSections: string[],
    strugglingAreas?: string[]
  ): Promise<{
    success: boolean;
    feedback: {
      level: string;
      encouragement: string;
      completionRate: string;
      nextSteps: string[];
      recommendations: string[];
    };
  }> {
    return this.makeRequest('/api/tutor/feedback', {
      method: 'POST',
      body: JSON.stringify({
        topic,
        completedSections,
        strugglingAreas,
      }),
    });
  }

  async getLearningPaths(level?: string, interest?: string): Promise<{
    success: boolean;
    learningPaths: Array<{
      id: string;
      name: string;
      description: string;
      level: string;
      duration: string;
      modules: string[];
      prerequisites: string[];
    }>;
  }> {
    const params = new URLSearchParams();
    if (level) params.append('level', level);
    if (interest) params.append('interest', interest);
    
    const queryString = params.toString();
    const endpoint = `/api/tutor/learning-paths${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest(endpoint);
  }

  // Document management endpoints
  async uploadDocuments(documents: Array<{
    content: string;
    metadata?: any;
  }>): Promise<{
    success: boolean;
    message: string;
    documentCount: number;
  }> {
    return this.makeRequest('/api/documents/upload', {
      method: 'POST',
      body: JSON.stringify({
        documents,
      }),
    });
  }

  async loadSampleDocuments(): Promise<{
    success: boolean;
    message: string;
    documentCount: number;
  }> {
    return this.makeRequest('/api/documents/load-samples', {
      method: 'POST',
    });
  }

  async getKnowledgeBaseInfo(): Promise<{
    success: boolean;
    info: {
      documentCount: number;
      collectionName: string;
      vectorSize: string;
      distance: string;
      status: string;
    };
  }> {
    return this.makeRequest('/api/documents/info');
  }

  async searchDocuments(
    query: string,
    limit: number = 5
  ): Promise<{
    success: boolean;
    query: string;
    results: Array<{
      id: number;
      content: string;
      metadata: any;
      similarity: number;
      preview: string;
    }>;
    resultCount: number;
  }> {
    return this.makeRequest('/api/documents/search', {
      method: 'POST',
      body: JSON.stringify({
        query,
        limit,
      }),
    });
  }

  async getSystemStatus(): Promise<SystemStatus> {
    return this.makeRequest('/api/documents/status');
  }

  async clearKnowledgeBase(): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.makeRequest('/api/documents/clear', {
      method: 'DELETE',
    });
  }

  // New: ingest one or more URLs and split into chunks
  async ingestUrls(urls: string[] | string): Promise<{
    success: boolean;
    addedCount: number;
    errors: Array<{ url: string; error: string }>;
  }> {
    const arr = Array.isArray(urls) ? urls : [urls]
    return this.makeRequest('/api/documents/ingest-url', {
      method: 'POST',
      body: JSON.stringify({ urls: arr }),
    })
  }
}

// Create and export singleton instance
export const sageBotAPI = new SmartSageBotAPI();

// Export for direct usage
export default sageBotAPI;

// Utility functions for handling API responses
export const isApiError = (response: any): response is { success: false; error: string } => {
  return response && !response.success && response.error;
};

export const getErrorMessage = (error: any): string => {
  if (error?.message) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
};

// Helper for displaying thinking steps
export const formatThinkingStep = (step: ThinkingStep): string => {
  return `${step.agent}: ${step.message}`;
};

// Helper for status icons
export const getStatusIcon = (status: ThinkingStep['status']): string => {
  switch (status) {
    case 'processing': return '🔄';
    case 'completed': return '✅';
    case 'error': return '❌';
    default: return '⏳';
  }
};