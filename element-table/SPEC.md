# AI Periodic Table - Specification

## 1. Project Overview
- **Name**: AI Chemistry Mentor
- **Type**: Interactive Educational Web App
- **Summary**: A dynamic periodic table that allows students to interact with elements and receive AI-powered explanations about chemical properties, uses, and history using the Qwen3-Max model.
- **Target Users**: High school students (Chemistry).

## 2. UI/UX Specification

### Layout Structure
- **Container**: Full-screen flex/grid layout.
- **Header**: Simple title and "Clear Chat" button.
- **Main Content**:
  - **Left/Top**: Interactive Periodic Table (Scrollable on mobile).
  - **Right/Bottom**: AI Chat Interface (Message history + Input).
- **Responsive**:
  - Desktop: Split screen (Table 60% | Chat 40%).
  - Mobile: Stacked (Table top | Chat bottom).

### Visual Design
- **Color Palette**:
  - Background: Dark Slate (Tailwind `bg-slate-900`).
  - Text: White/Gray (Tailwind `text-slate-200`).
  - Accents: Cyan/Teal for AI responses (`bg-teal-600`), Indigo for user messages.
  - Element Categories: Distinct colors for Metals, Non-metals, Noble gases, etc.
- **Typography**: `Inter` or system sans-serif.
- **Interactions**:
  - Elements: Hover scale effect, click to select.
  - Chat: Typing indicator, smooth scroll.

### Components
1.  **PeriodicTable**: Grid of element tiles.
2.  **ElementTile**: Small card showing atomic number and symbol.
3.  **ChatWindow**: Message list area.
4.  **InputArea**: Text input + Send button.
5.  **TypingIndicator**: Three bouncing dots animation.

## 3. Functionality Specification

### Core Features
1.  **Periodic Table Rendering**: Display all 118 elements.
2.  **Element Selection**: Clicking an element automatically prompts the AI with context about that element.
3.  **AI Chat**:
    - User can type custom questions.
    - System role: "Expert High School Chemistry Teacher".
    - Streaming response (if possible, otherwise standard wait).
4.  **Markdown Support**: Render basic formatting in AI answers.

### Data Handling
- **Elements Data**: Stored in a local constant array (Symbol, Name, AtomicNumber, Category).
- **API Config**:
  - Endpoint: `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`
  - Model: `qwen3-max`
  - Key: `sk-xxx`

### Edge Cases
- **API Error**: Show friendly error message in chat.
- **Loading State**: Disable input while waiting for AI.
- **Long Responses**: Ensure chat window scrolls to bottom.

## 4. Acceptance Criteria
- [ ] Periodic table displays all 118 elements correctly.
- [ ] Clicking an element sends a specific query to the AI.
- [ ] AI responds with relevant chemistry information.
- [ ] UI is responsive and usable on different screen sizes.
- [ ] Dark mode aesthetic is consistent.

