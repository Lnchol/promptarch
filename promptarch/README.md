# Prompt Architect

**Prompt Architect** is a sophisticated tool designed to help developers and designers generate high-quality, structured system prompts for AI coding assistants (like Gemini, ChatGPT, Claude).

It allows you to define a persona, objective, technical stack, and design constraints, and then generates a production-ready system instruction that you can paste into your AI chat.

## Features

-   **Project Templates**: Choose from presets like "Visceral 3D", "Swiss Minimal", "Neo-Brutalist", "Mobile App", and "Indie Game".
-   **Magic Architect (AI Powered)**: Describe your idea in natural language, and Gemini will generate the perfect persona, stack, and rules for you.
-   **AI Enhancement**: Use the "Enhance with AI" button to refine your Role or Task descriptions into professional, high-level language.
-   **Tech Stack Builder**: Toggle popular libraries (Three.js, Tailwind, React, etc.) to enforce specific technologies.
-   **Custom Rules**: Add specific constraints (e.g., "No jQuery", "Dark mode only") to guide the AI's output.
-   **History**: View and restore previously generated prompts.
-   **Export**: Download your generated prompt as a Markdown file.
-   **Persistence**: Your settings and history are saved automatically to your browser's local storage.

## Getting Started

### Prerequisites

-   Node.js installed.
-   A Google Gemini API Key (free tier available).

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory and add your API key:
    ```
    VITE_GEMINI_API_KEY=your_api_key_here
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

## Usage

1.  **Select a Template** or use **Magic Architect** to start.
2.  **Fine-tune** the Role and Task.
3.  **Select your Tech Stack**.
4.  **Add Custom Rules**.
5.  **Copy** the generated System Instruction from the terminal view on the right.
6.  **Paste** it into your AI chat to start building!

## Technologies Used

-   React
-   Tailwind CSS
-   Lucide React (Icons)
-   Google Gemini API

## License

MIT
