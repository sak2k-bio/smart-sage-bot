# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Smart Sage Bot** is an AI-powered educational chat assistant built with modern web technologies. It features three distinct interaction modes:
- **Quiz Mode**: Interactive questions with multiple choice answers and explanations
- **Tutor Mode**: Detailed educational content with expandable sections and learning paths
- **Suggestions Mode**: Creative brainstorming with categorized ideas and inspiration

This is a Lovable-generated project (https://lovable.dev/projects/c98bdc10-c648-4470-ae85-9d73ad760c72) that can be edited both locally and through the Lovable web interface.

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5 with SWC
- **UI Library**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React hooks + TanStack Query for server state
- **Routing**: React Router v6
- **Form Handling**: React Hook Form with Zod validation

## Development Commands

### Core Commands
```bash
# Install dependencies
npm i

# Start development server (runs on localhost:8080)
npm run dev

# Build for production
npm run build

# Build for development (with dev mode optimizations)
npm run build:dev

# Preview production build locally
npm run preview

# Run linter
npm run lint
```

### Lovable Integration
Changes made via the Lovable web interface are automatically committed to this repository. Local changes pushed to the repository will be reflected in Lovable.

## Architecture Overview

### Component Structure
The application follows a component-driven architecture with clear separation of concerns:

- **`ChatInterface.tsx`**: Main chat container managing state and message flow
- **Mode-specific Components**:
  - `QuizCard.tsx` - Interactive quiz functionality with scoring
  - `TutorMessage.tsx` - Expandable educational content sections  
  - `SuggestionsPanel.tsx` - Categorized creative ideas display
- **`SettingsPanel.tsx`**: Mode selection and configuration interface
- **UI Components**: Comprehensive shadcn/ui component library in `src/components/ui/`

### Chat Mode System
The application uses a unified `ChatMode` type system that enables dynamic message rendering:
- Messages are typed with optional `mode` property
- Different components render based on message mode
- Consistent theming across all modes using CSS custom properties

### Design System Features
- **Custom Gradient System**: Mode-specific gradients defined in CSS variables
- **Animation Framework**: Custom keyframes for fade-in, slide-up, and glow effects  
- **Responsive Layout**: Mobile-first design with backdrop blur effects
- **Theme-aware Components**: Consistent color tokens across light/dark modes

### State Management Patterns
- **Local State**: React hooks for UI interactions and form handling
- **Message State**: Array-based chat history with unique IDs and timestamps
- **Settings State**: Mode persistence and panel visibility
- **Toast Notifications**: Integrated feedback system using Sonner

## Key Configuration Files

### TypeScript Configuration
- **`tsconfig.json`**: Project references configuration with path mapping
- **`tsconfig.app.json`**: Application-specific TypeScript settings
- **`tsconfig.node.json`**: Node.js environment configuration for build tools

### Build Configuration  
- **`vite.config.ts`**: Vite configuration with React SWC, path aliases, and Lovable component tagger
- **`tailwind.config.ts`**: Extended Tailwind configuration with custom design tokens
- **`components.json`**: shadcn/ui configuration for component generation

### Linting
- **`eslint.config.js`**: Modern ESLint flat configuration with TypeScript support
- Disabled unused vars checking for development flexibility

## Development Patterns

### Component Development
- Use TypeScript interfaces for all prop definitions
- Implement responsive design with Tailwind mobile-first approach
- Leverage shadcn/ui components for consistent UI patterns
- Apply custom animations and transitions using Tailwind classes

### Adding New Chat Modes
1. Extend the `ChatMode` type in `ChatInterface.tsx`
2. Create mode-specific component following existing patterns
3. Add mode configuration to `SettingsPanel.tsx` 
4. Update gradient and color variables in `tailwind.config.ts`
5. Implement message rendering logic in `ChatInterface.renderMessage()`

### Styling Guidelines
- Use CSS custom properties for theming and gradients
- Apply consistent shadow and animation classes
- Maintain mobile-responsive layouts with proper breakpoints
- Leverage backdrop blur effects for modern glassmorphism design

## File Structure Insights

### Asset Management
- Public assets in `public/` directory (favicon, images, robots.txt)
- Component-specific assets imported directly (e.g., chat background images)

### UI Component Library
- Comprehensive shadcn/ui implementation in `src/components/ui/`
- Consistent design tokens and variants across all components
- Full Radix UI integration for accessibility

### Route Structure
- Simple single-page application with catch-all 404 handling
- Main functionality contained in Index page component
- Router setup supports future expansion to multi-page application

## Testing Considerations

Currently no testing framework is configured. When implementing tests, consider:
- Component testing with React Testing Library
- Mode-specific functionality testing
- Chat message flow testing  
- Responsive design testing
- Accessibility testing for Radix UI components

## Performance Optimizations

- Vite with SWC for fast development builds
- Component lazy loading opportunities for large UI library
- TanStack Query for efficient data fetching (when backend is added)
- Optimized bundle splitting for production builds

## Deployment Notes

The project is configured for easy deployment through Lovable's hosting platform, but can also be deployed to any static hosting service using the standard Vite build process.