# CHATBOT AI Hooks Explanation

This document explains the purpose and functionality of all hooks in the CHATBOT AI directory.

## Core Logic Hooks

### `useChatbotLogic.ts`
**Purpose**: Main orchestrator hook that manages the entire chatbot state and logic
- Manages chat history, current question, loading states
- Handles tool configurations (image generation, agent mode, thinking mode)
- Controls animation states and timing
- Provides submission handlers for questions
- Manages the overall flow of the chatbot interaction

### `useAnswerGeneration.ts`
**Purpose**: Handles the generation of AI responses
- Manages API calls to the Together AI service
- Handles request cancellation and abort controllers
- Updates chat history with generated answers
- Manages loading states and error handling
- Validates response format using Zod schemas

### `useApiCall.ts`
**Purpose**: Manages API communication with external services
- Handles calls to Together AI API (DeepSeek-V3 model)
- Manages authentication and request formatting
- Handles response parsing and error management
- Supports abort signals for request cancellation
- Formats system instructions for different modes

## Animation and Control Hooks

### `useAnimationControl.ts`
**Purpose**: Manages animation states and timing
- Controls thinking animation visibility
- Manages agent animation states
- Handles timeout clearing for animations
- Provides animation state setters

### `useAbortController.ts`
**Purpose**: Manages request cancellation across the application
- Creates and tracks AbortController instances
- Provides methods to abort specific requests by index
- Allows aborting all active requests
- Tracks controller existence for cleanup

## Rendering and Display Hooks

### `useSequentialRenderer.tsx`
**Purpose**: Manages the sequential rendering of content items
- Controls which item is currently being displayed
- Tracks completed items
- Manages transitions between items
- Provides completion callbacks

### `useItemRenderer.tsx`
**Purpose**: Renders different types of content (text, code, image, audio)
- Maps content types to appropriate components
- Handles animation states for each item
- Provides completion callbacks for each item type
- Manages styling and transitions

### `useItemCompletion.tsx`
**Purpose**: Manages the completion state of individual items
- Tracks completion and animation states
- Provides safety timers for completion
- Handles completion callbacks
- Manages reset functionality

### `useItemVisibility.ts`
**Purpose**: Manages visibility-based behavior for items
- Handles visibility state changes
- Manages animation start/stop based on visibility
- Provides cleanup for timers and state

### `useProgressiveText.tsx`
**Purpose**: Provides progressive text display animation
- Displays text character by character
- Manages writing animation states
- Controls animation speed and completion
- Handles text changes and resets

## Control and Utility Hooks

### `useAnswerControls.tsx`
**Purpose**: Manages user interaction controls for answers
- Handles copy functionality for answer content
- Manages like/dislike states
- Provides regenerate functionality
- Extracts plain text from complex content

### `useSystemInstruction.ts`
**Purpose**: Builds system instructions for AI API calls
- Creates formatted instructions for different modes
- Ensures proper JSON response format
- Handles image, agent, and thinking mode instructions
- Provides validation rules for AI responses

### `useTimeUtils.ts`
**Purpose**: Provides time-related utility functions
- Formats current time for timestamps
- Provides consistent time formatting across the app

## Hook Dependencies and Flow

### Primary Flow:
1. `useChatbotLogic` orchestrates the main flow
2. `useAnswerGeneration` handles AI response generation
3. `useApiCall` makes the actual API requests
4. `useSystemInstruction` provides formatted instructions
5. `useSequentialRenderer` manages content display
6. `useItemRenderer` renders individual content pieces
7. `useItemCompletion` tracks completion states
8. `useProgressiveText` animates text display

### Animation Flow:
1. `useAnimationControl` manages global animation states
2. `useAbortController` handles request cancellation
3. `useItemVisibility` controls visibility-based animations
4. `useItemCompletion` manages individual item completion

### User Interaction Flow:
1. `useAnswerControls` handles user feedback
2. `useTimeUtils` provides timestamps
3. `useAbortController` allows stopping operations

## Key Features

- **Request Management**: Proper cancellation and cleanup
- **Progressive Display**: Sequential rendering with animations
- **Error Handling**: Comprehensive error management
- **State Management**: Centralized state with proper updates
- **Animation Control**: Smooth transitions and timing
- **User Feedback**: Like/dislike/copy functionality
- **API Integration**: Robust external service communication

## Usage Patterns

All hooks follow React best practices:
- Use `useCallback` for stable function references
- Use `useRef` for mutable values that don't trigger re-renders
- Use `useEffect` for side effects and cleanup
- Use `useMemo` for expensive computations
- Proper dependency arrays for all hooks 