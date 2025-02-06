# Release Notes by AI 🤖

Generate beautiful, professional release notes for your projects using AI. This tool helps developers and teams automatically create meaningful release notes from their code changes.

<img width="985" alt="image" src="https://github.com/user-attachments/assets/03f86b49-458c-4698-8a49-376aa37dd73c" />

## Features ✨

- 🎯 AI-powered release notes generation
- 🤖 Multiple AI model support (OpenAI GPT and Anthropic Claude)
- 🔄 Model switching capability
- 💻 Modern React + TypeScript implementation
- 🎨 Beautiful UI with Tailwind CSS and Radix UI components
- 📋 Easy copy-to-clipboard functionality
- 🌓 Dark/Light mode support
- 📱 Responsive design
- 🔍 GitHub integration for repository analysis

## Tech Stack 🛠️

- [React](https://react.dev/) - UI Framework
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Vite](https://vitejs.dev/) - Build Tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - UI Components
- [React Query](https://tanstack.com/query/latest) - Data Fetching
- [React Router](https://reactrouter.com/) - Routing
- [React Hook Form](https://react-hook-form.com/) - Form Management
- [Zod](https://zod.dev/) - Schema Validation
- [OpenAI API](https://openai.com/) - AI Integration
- [Anthropic Claude API](https://anthropic.com/) - AI Integration

## Getting Started 🚀

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key (optional)
- Anthropic API key (optional)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/perryraskin/release-notes-by-ai.git
   cd release-notes-by-ai
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up your API keys in one of two ways:

   a. Using localStorage (current implementation):

   ```javascript
   // Open your browser's developer console and run:
   localStorage.setItem("OPENAI_API_KEY", "your_openai_api_key_here");
   localStorage.setItem("ANTHROPIC_API_KEY", "your_anthropic_api_key_here");
   ```

   b. Using environment variables:
   Create a `.env` file in the root directory and add:

   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

   Note: You only need to set up the API key for the service you plan to use. The application supports both OpenAI and Anthropic models.

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The application will be available at `http://localhost:8080`

## Building for Production 🏗️

To create a production build:

```bash
npm run build

# or

yarn build
```

## Contributing 🤝

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

Please make sure to update tests as appropriate and adhere to the existing coding style.

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support 💪

If you find this project useful, please consider giving it a ⭐️ on GitHub!

For issues, feature requests, or questions, please use the [GitHub Issues](https://github.com/yourusername/release-notes-by-ai/issues) page.
