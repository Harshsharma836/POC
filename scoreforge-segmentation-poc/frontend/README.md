# Gaming Leaderboard - React Frontend

Modern React frontend for the Gaming Leaderboard system built with TypeScript and Vite.

## Features

- ⚛️ **React 18** with TypeScript
- 🚀 **Vite** for fast development and building
- 🎨 **Modern UI** with real-time updates
- 📱 **Responsive Design**
- 🔄 **Auto-refresh** leaderboard every 5 seconds
- 🎮 **Game Mode Switching** (Story/Multiplayer)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:8000`

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open browser:
   - The app will be available at `http://localhost:3000`
   - Vite proxy is configured to forward `/api` requests to the backend

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   │   ├── Header.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── RankLookup.tsx
│   │   ├── ScoreSubmit.tsx
│   │   └── Footer.tsx
│   ├── services/        # API service functions
│   │   └── api.ts
│   ├── types/           # TypeScript types
│   │   └── types.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── vite.config.ts
└── package.json
```

## Components

### Header
- Game mode selector (Story/Multiplayer)
- Title and branding

### Leaderboard
- Displays top 10 players
- Auto-refreshes every 5 seconds
- Highlights top 3 players

### RankLookup
- Search for player rank by user ID
- Shows player details and rank

### ScoreSubmit
- Submit new scores
- Form validation
- Success/error feedback

### Footer
- Connection status indicator
- Last updated timestamp

## API Integration

The frontend uses a proxy configuration in `vite.config.ts` to forward API requests:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
  },
}
```

All API calls are defined in `src/services/api.ts`:
- `submitScore()` - Submit a score
- `getTopPlayers()` - Get top players
- `getPlayerRank()` - Get player rank
- `checkHealth()` - Check API health

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory. You can serve it with any static file server or deploy it to platforms like Vercel, Netlify, etc.

## Development Notes

- Uses React hooks (useState, useEffect, useCallback)
- TypeScript for type safety
- Component-based architecture
- No external UI libraries (pure CSS)
- Real-time updates via polling (can be upgraded to WebSockets)

## Troubleshooting

**API connection errors?**
- Ensure backend is running on port 8000
- Check CORS settings in backend
- Verify proxy configuration in `vite.config.ts`

**Build errors?**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript version compatibility

**Port already in use?**
- Change port in `vite.config.ts` server.port

