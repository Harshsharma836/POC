import type { GameMode, User } from '../types'

interface HeaderProps {
  gameMode: GameMode
  onGameModeChange: (mode: GameMode) => void
  currentUser: User | null
  onLogout: () => void
}

function Header({ gameMode, onGameModeChange, currentUser, onLogout }: HeaderProps) {
  return (
    <header>
      <div className="header-top">
        <h1>🎮 Gaming Leaderboard</h1>
        {currentUser && (
          <div className="user-info">
            <span className="username">👤 {currentUser.username}</span>
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
      <div className="game-mode-selector">
        <button
          className={`mode-btn ${gameMode === 'story' ? 'active' : ''}`}
          onClick={() => onGameModeChange('story')}
        >
          Story Mode
        </button>
        <button
          className={`mode-btn ${gameMode === 'multiplayer' ? 'active' : ''}`}
          onClick={() => onGameModeChange('multiplayer')}
        >
          Multiplayer Mode
        </button>
      </div>
      <style>{`
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .username {
          font-weight: 600;
          color: #333;
        }

        .logout-btn {
          padding: 8px 16px;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s;
        }

        .logout-btn:hover {
          background: #d32f2f;
        }
      `}</style>
    </header>
  )
}

export default Header

