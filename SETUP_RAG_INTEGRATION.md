# RAG Integration Setup Guide

This guide helps you set up and test the RAG chatbot backend integration with your React frontend.

## 🚀 Quick Start

### 1. Environment Setup

First, copy the environment template and configure your API keys:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your credentials:

```env
# Google AI API (Required)
GOOGLE_API_KEY=your_google_api_key_here

# Qdrant Vector Database (Required)
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key_or_leave_empty_for_local

# Server Configuration
PORT=8000
NODE_ENV=development

# CORS Configuration (Frontend URL)
CORS_ORIGIN=http://localhost:5173
```

### 2. Start the Full Application

Run both frontend and backend together:

```bash
# Install dependencies
npm install

# Start both backend and frontend
npm run dev:full
```

Or run them separately:

```bash
# Terminal 1: Start backend
npm run backend

# Terminal 2: Start frontend
npm run dev
```

### 3. Test the Integration

1. **Open the app**: Navigate to `http://localhost:5173`
2. **Open Settings**: Click the settings icon in the top-right
3. **Select Pipeline**: Choose from Adaptive, Simple, Advanced, or Multi-Modal
4. **Select Mode**: Choose Quiz, Tutor, or Suggestions
5. **Send a message**: Try asking something like "Explain photosynthesis"

## 🧪 Testing Features

### Chat Modes
- **Quiz Mode**: Ask for questions about a topic
- **Tutor Mode**: Ask for explanations and learning guidance  
- **Suggestions Mode**: Ask for creative ideas and brainstorming

### Pipeline Modes
- **Adaptive** (Recommended): Auto-selects best pipeline
- **Simple**: Fast responses for basic questions
- **Advanced**: Deep analysis with reasoning steps
- **Multi-Modal**: Handles complex content types

### Expected Response Features
- ✅ AI-generated responses
- ✅ Thinking steps visualization
- ✅ Document sources (when available)
- ✅ Pipeline information badges
- ✅ Loading states
- ✅ Error handling

## 🔧 Troubleshooting

### Backend Issues

**Q: "Error: Google API Key not found"**
- Ensure `GOOGLE_API_KEY` is set in `backend/.env`
- Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

**Q: "Qdrant connection failed"**
- Check if Qdrant is running (if using local instance)
- Verify `QDRANT_URL` and `QDRANT_API_KEY` in `.env`
- For local development, you can use Docker: `docker run -p 6333:6333 qdrant/qdrant`

**Q: "CORS errors"**
- Ensure `CORS_ORIGIN` matches your frontend URL (usually `http://localhost:5173`)

### Frontend Issues

**Q: "Network error when sending messages"**
- Check if backend is running on port 8000
- Verify the API endpoint in browser dev tools
- Check browser console for detailed error messages

**Q: "Components not rendering properly"**
- Ensure all new components are properly imported
- Check console for TypeScript errors
- Verify TailwindCSS classes are loaded

## 🏗️ Architecture Overview

```
Frontend (React + Vite)     Backend (Express + Node.js)
├── ChatInterface           ├── Express Server
├── SettingsPanel           ├── RAG Pipelines
├── ThinkingSteps           ├── AI Agents
├── DocumentSources         ├── Qdrant Integration
├── QuizCard               ├── Google AI Integration
├── TutorMessage           └── API Routes
├── SuggestionsPanel
└── API Client
```

## 📡 API Endpoints

### Chat
- `POST /api/chat` - Send message and get AI response
- `POST /api/chat/suggest` - Get topic suggestions

### Quiz Mode
- `POST /api/quiz/generate` - Generate quiz questions
- `POST /api/quiz/validate` - Validate quiz answers
- `GET /api/quiz/topics` - Get available quiz topics

### Tutor Mode
- `POST /api/tutor/explain` - Get detailed explanations
- `POST /api/tutor/feedback` - Get learning feedback
- `GET /api/tutor/learning-paths` - Get structured learning paths

## 🎯 Next Steps

1. **Add Knowledge Base**: Upload documents to Qdrant for retrieval
2. **Customize Agents**: Modify agent prompts and behaviors
3. **Add Authentication**: Implement user sessions and history
4. **Performance Monitoring**: Add analytics and usage tracking
5. **Advanced Features**: Add voice input/output, file uploads, etc.

## 🐛 Common Issues & Solutions

### Development Workflow
1. Always start backend before frontend
2. Check environment variables are loaded correctly
3. Monitor both terminal outputs for errors
4. Use browser dev tools to debug API calls

### Production Deployment
- Set `NODE_ENV=production` in backend
- Configure proper CORS origins for your domain
- Ensure API keys are securely managed
- Set up proper SSL/HTTPS