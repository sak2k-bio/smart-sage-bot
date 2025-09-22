# Smart Sage Bot - AI-Powered Learning Assistant

🤖 An advanced RAG (Retrieval-Augmented Generation) system that provides intelligent tutoring, quiz generation, and creative suggestions based on your knowledge base.

## 🌟 Features

### Three Intelligent Modes

#### 🧠 **Quiz Mode**
- Generates 5 unique, diverse multiple-choice questions from your documents
- Smart document shuffling ensures variety in each quiz session
- Interactive navigation between questions
- Instant feedback with detailed explanations
- Progress tracking with visual indicators
- Questions generated from different document sections for comprehensive coverage

#### 📚 **Tutor Mode**
- Creates structured tutorials with multiple sections
- Content types: explanations, examples, exercises, and summaries
- Strictly uses retrieved documents for accuracy
- Adaptive to user's learning level
- Shows source documents for each section

#### 💡 **Suggestions Mode**
- Generates creative ideas in three categories:
  - Creative Applications
  - Learning & Education
  - Business Solutions
- Context-aware suggestions based on your query
- Includes pro tips for combining ideas
- Dynamic content generation, not static placeholders

### Core RAG Features

- **Vector Search**: Powered by Qdrant Cloud with 3072-dimensional embeddings
- **Multi-Agent Pipeline**: Query analysis → Document retrieval → Response generation
- **Transparent AI Thinking**: Expandable panels showing AI reasoning steps
- **Source Attribution**: Every response includes document sources
- **Google Gemini Integration**: Uses gemini-1.5-flash for generation and gemini-embedding-001 for embeddings

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Cloud API key (for Gemini)
- Qdrant Cloud account with a collection

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/smart-sage-bot.git
cd smart-sage-bot

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Configuration

Edit `.env` with your credentials:

```env
# Google Gemini Configuration
GOOGLE_API_KEY=your-google-api-key
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=2048

# Qdrant Cloud Configuration
QDRANT_CLOUD_URL=https://your-cluster-url.qdrant.io:6333
QDRANT_CLOUD_API_KEY=your-qdrant-api-key

# Vector Store Configuration
VECTOR_STORE=qdrant
COLLECTION_NAME=your-collection-name
EMBEDDING_MODEL=gemini-embedding-001
EMBEDDING_DIM=3072
```

### Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run preview
```

The application will be available at `http://localhost:3000`

## 🏗️ Architecture

### Frontend (Next.js + React)
- `/src/components/` - React components
  - `ChatInterface.tsx` - Main chat UI
  - `QuizCard.tsx` - Quiz display with navigation
  - `TutorMessage.tsx` - Tutorial content display
  - `SuggestionsPanel.tsx` - Ideas and suggestions display
  - `ThinkingSteps.tsx` - AI reasoning visualization
  - `DocumentSources.tsx` - Source attribution display

### Backend (Next.js API Routes)
- `/app/api/` - API endpoints
  - `chat/` - General chat endpoint
  - `quiz/generate` - Quiz generation
  - `tutor/explain` - Tutorial generation
  - `chat/suggest` - Suggestions generation
  - `documents/` - Document management

### AI Pipeline System
- `/src/server/agents.ts` - Individual AI agents:
  - `QueryAgent` - Analyzes user queries
  - `RetrievalAgent` - Searches vector database
  - `AnswerAgent` - Generates responses
  - `QuizAgent` - Creates quiz questions
  - `TutorAgent` - Builds tutorials
  - `SuggestionsAgent` - Generates creative ideas

- `/src/server/pipelines.ts` - Pipeline orchestration:
  - `QuizPipeline` - Retrieves 15 docs, shuffles, generates 5 questions
  - `TutorPipeline` - Retrieves 8 docs, creates structured tutorial
  - `SuggestionsPipeline` - Retrieves 5 docs, generates categorized ideas

### Vector Store Integration
- `/src/server/vectorstore.ts` - Qdrant integration
  - 3072-dimensional embeddings via Gemini
  - Semantic search with similarity scoring
  - Automatic collection management

## 📝 Key Improvements Made

1. **Fixed Qdrant Collection Access**
   - Handles collection names with special characters (spaces)
   - Proper authentication with Qdrant Cloud
   - Robust error handling for vector searches

2. **Enhanced Quiz Generation**
   - Increased document retrieval from 10 to 15
   - Random shuffling for question variety
   - Higher temperature (0.8) for creative questions
   - All 5 questions displayed with navigation

3. **Implemented Real Suggestions**
   - Dynamic content generation based on context
   - Three actionable categories
   - Pro tips for idea combination

4. **Improved UI/UX**
   - Collapsible panels for AI thinking and sources
   - Progress indicators for quizzes
   - Smooth animations and transitions
   - Responsive design with Tailwind CSS

## 🛠️ Technologies Used

- **Frontend**: Next.js 14, React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **AI/LLM**: Google Gemini (gemini-1.5-flash)
- **Embeddings**: Google Gemini (gemini-embedding-001)
- **Vector Database**: Qdrant Cloud
- **Icons**: Lucide React
- **Animations**: Custom Tailwind animations

## 🔧 Troubleshooting

### Common Issues

1. **"NO SOURCES" error**
   - Verify collection name matches exactly (including spaces)
   - Check Qdrant Cloud connection credentials
   - Ensure collection has documents with proper embeddings

2. **Embedding dimension mismatch**
   - Confirm EMBEDDING_DIM matches your Qdrant collection
   - Verify gemini-embedding-001 outputDimensionality parameter

3. **Quiz showing only 1 question**
   - Update to latest code version
   - Clear browser cache and restart dev server

## 📄 License

MIT License - feel free to use this project for your own learning applications!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open a GitHub issue.
