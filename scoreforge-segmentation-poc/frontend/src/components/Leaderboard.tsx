import { useState, useEffect, useCallback } from 'react'
import type { GameMode, LeaderboardPlayer } from '../types'
import { getTopPlayers } from '../services/api'

interface LeaderboardProps {
  gameMode: GameMode
  onUpdate?: () => void
}

function Leaderboard({ gameMode, onUpdate }: LeaderboardProps) {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getTopPlayers(gameMode, 10)
      
      if (response.success && response.data) {
        const validPlayers = response.data
          .filter((player) => player && player.userId && player.totalScore !== undefined)
          .map((player) => ({
            userId: player.userId,
            username: player.username || `user_${player.userId}`,
            totalScore: player.totalScore ?? 0,
            rank: player.rank ?? 0,
          }))
        setPlayers(validPlayers)
        onUpdate?.()
      } else {
        setError(response.error || 'Failed to load leaderboard')
        setPlayers([])
      }
    } catch (err) {
      setError('Error loading leaderboard')
      console.error('Error loading leaderboard:', err)
      setPlayers([])
    } finally {
      setLoading(false)
    }
  }, [gameMode, onUpdate])

  useEffect(() => {
    loadLeaderboard()
    
    const interval = setInterval(loadLeaderboard, 5000)
    return () => clearInterval(interval)
  }, [loadLeaderboard])

  const getRankClass = (rank: number): string => {
    if (rank === 1) return 'top-1'
    if (rank === 2) return 'top-2'
    if (rank === 3) return 'top-3'
    return ''
  }

  return (
    <section className="leaderboard-section">
      <h2>Top Players</h2>
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <span>Rank</span>
          <span>Player</span>
          <span>Score</span>
        </div>
        <div className="leaderboard-list">
          {loading && (
            <div className="loading">Loading...</div>
          )}
          {error && (
            <div className="error">{error}</div>
          )}
          {!loading && !error && players.length === 0 && (
            <div className="loading">No players yet</div>
          )}
          {!loading && !error && players.map((player) => {
            const rank = player.rank ?? 0
            const totalScore = typeof player.totalScore === 'number' ? player.totalScore : 0
            const username = player.username || `user_${player.userId}`
            
            return (
              <div
                key={player.userId}
                className={`leaderboard-item ${rank <= 3 && rank > 0 ? 'top-3' : ''}`}
              >
                <span className={`rank ${getRankClass(rank)}`}>
                  #{rank}
                </span>
                {/* React automatically escapes content, preventing XSS */}
                <span className="username">{username}</span>
                <span className="score">
                  {totalScore.toLocaleString()}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Leaderboard

