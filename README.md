# DynastyLab

AI-powered college football dynasty tracker with dynamic content generation. Track your CFB 25 dynasty progress with intelligent commentary, dynamic news articles, and vibrant fan forums.

\![React](https://img.shields.io/badge/React-18.3-blue)
\![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
\![Vite](https://img.shields.io/badge/Vite-6.0-purple)
\![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-teal)
\![License](https://img.shields.io/badge/License-MIT-green)

## Features

### 🏈 Dynasty Management
- **Season Tracking**: Monitor your progress through multiple seasons
- **Game Management**: Record game results, stats, and milestones
- **Player Tracking**: Manage rosters, depth charts, and player development
- **Recruiting**: Track recruiting classes and commitments
- **Coach Management**: Monitor coaching records and hot seat status

### 🤖 AI-Powered Content
- **Dynamic News Articles**: AI-generated articles based on your dynasty events
- **Smart Forums**: Team-specific fan forums with AI-generated discussions
- **Writer Personalities**: Multiple AI writers with distinct styles and biases
- **Opponent Scouting**: Automated preview content for upcoming games

### 🎨 Immersive Experience
- **Team Theming**: Dynamic UI that adopts your team's colors
- **134 Team Forums**: Unique forum for every FBS team
- **Nested Comments**: Engage with AI fans in realistic discussions
- **News Ticker**: Breaking news updates based on your dynasty

### ⚙️ Smart Features
- **AI Content Settings**: Control which teams get AI-generated content
- **Cost-Efficient**: Only generate content for teams you care about
- **Context-Aware**: Automatically enables content for upcoming opponents
- **Data Persistence**: All data saved locally in browser storage

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dynastylab.git
cd dynastylab
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Add your OpenAI API key to `.env`:
```
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

5. Start the development server:
```bash
npm run dev
```

6. Open http://localhost:5173 in your browser

## Usage

### Initial Setup
1. Select your team from the Teams page
2. Create a new season or load existing data
3. Configure AI settings to control content generation

### Managing Your Dynasty
- **Games**: Add game results with detailed stats
- **Players**: Track player development and manage depth charts
- **Recruiting**: Monitor and sign recruiting classes
- **News**: Read AI-generated articles about your dynasty
- **Forums**: Engage with AI fans in team-specific forums

### AI Content Settings
Control API costs by choosing which teams generate AI content:
- Your team always has full AI features
- Enable rivals for year-round content
- Auto-enable opponents during game week
- Manual overrides for any team

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS v3
- **State Management**: Zustand with persistence
- **AI Integration**: OpenAI GPT-3.5/4
- **Routing**: React Router v6
- **Icons**: Heroicons

## Project Structure

```
src/
├── components/      # React components
├── stores/         # Zustand state stores
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── services/       # External service integrations
├── styles/         # CSS and styling
└── data/           # Static data and constants
```

## Configuration

### Environment Variables
- `VITE_OPENAI_API_KEY`: Your OpenAI API key (required for AI features)
- `VITE_API_ENDPOINT`: Optional API endpoint for key management

### AI Settings
Configure AI content generation in the AI Settings page:
- Core content (always on for your team)
- Extended coverage (rivals, conference, national)
- Smart features (auto-enable based on context)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] OCR integration for screenshot data extraction
- [ ] Mobile responsive design
- [ ] Export dynasty data
- [ ] Historical statistics and trends
- [ ] Playoff bracket tracking
- [ ] Award tracking
- [ ] Multi-dynasty support
- [ ] Cloud backup options

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for the CFB 25 gaming community
- Inspired by dynasty mode in EA Sports College Football
- Forum names inspired by popular CFB community sites
- AI content powered by OpenAI

## Disclaimer

This is an unofficial companion app and is not affiliated with EA Sports or the NCAA. All team names and marks are property of their respective institutions.

---

**Note**: Remember to keep your API keys secure and never commit them to version control\!
