# AI Therapy Simulator


## Quick Start



1. Navigate to the project directory:
```bash
cd node_version
```

2. Install dependencies:
```bash
npm install
cd client
npm install
```

3. Create a `.env` file in the `node_version` directory:
Please add your OPENAI_API_KEY= in .env file
```
OPENAI_API_KEY=your_api_key_here
```

4. Start the development servers:
```bash
# Terminal 1 (Backend)
cd node_version
npm run dev

# Terminal 2 (Frontend)
cd node_version/client
npm start
```

The app will be available at `http://localhost:3000`

## Tech Stack

- **Backend**: Node.js, Express, Socket.IO for real-time communication
- **Frontend**: React with Tailwind CSS for modern UI
- **AI**: OpenAI GPT-3.5-turbo for patient simulation
- **Development**: Vite for fast development and hot reloading

## Development Notes

Initially explored Flask and Chainlit implementations but chose to proceed with Node.js/React stack for:
- Familiarity with the technology
- Faster development time
- Better real-time communication capabilities
- More robust production deployment options

## Patient Prompt Engineering

The patient prompts were enhanced to include explicit instructions for the AI to:
1. Stay in character as a PTSD patient
2. Use natural speech patterns (filler words, pauses)
3. Keep responses brief and conversational
4. Maintain consistent persona traits

This ensures more realistic and therapeutic interactions while preventing the AI from breaking character or providing overly formal responses.


Link to the video proof - https://drive.google.com/file/d/1fw1o7AMICC5Fv4rOiqXlW_LNOxrBEkO4/view?usp=sharing