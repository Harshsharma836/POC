import { useState, FormEvent, useEffect } from 'react'
import type { GameMode, PlayerRank } from '../types'
import { getPlayerRank } from '../services/api'

interface RankLookupProps {
  gameMode: GameMode
  currentUserId?: number
}

function RankLookup({ gameMode, currentUserId }: RankLookupProps) {
  const [userId, setUserId] = useState<string>('')
  const [rankData, setRankData] = useState<PlayerRank | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-fill user ID when currentUserId is available
  useEffect(() => {
    if (currentUserId) {
      setUserId(currentUserId.toString())
    }
  }, [currentUserId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    console.log("********8")
    console.log(userId)
    const userIdNum = parseInt(userId)
    if (!userIdNum || userIdNum < 1) {
      setError('Please enter a valid user ID')
      setRankData(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await getPlayerRank(userIdNum, gameMode)
      
      if (response.success && response.data) {
        setRankData(response.data)
        setError(null)
      } else {
        setError(response.error || 'Player not found')
        setRankData(null)
      }
    } catch (err) {
      setError('Error looking up rank')
      setRankData(null)
      console.error('Error looking up rank:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rank-lookup-section">
      <h2>Check Your Rank</h2>
      <form className="lookup-form" onSubmit={handleSubmit}>
        <input
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder={currentUserId ? "Your User ID" : "Enter User ID"}
          min="1"
          disabled={!!currentUserId}
        />
        <button type="submit" disabled={loading || !userId}>
          {loading ? 'Looking up...' : currentUserId ? 'Check My Rank' : 'Lookup'}
        </button>
      </form>
      <div className="rank-result">
        {loading && (
          <div className="loading">Looking up...</div>
        )}
        {error && (
          <div className="error">{error}</div>
        )}
        {rankData && !error && (
          <div className="success">
            <div className="rank-info">
              <span><strong>Player:</strong> {rankData.username}</span>
              <span><strong>Rank:</strong> #{rankData.rank}</span>
            </div>
            <div className="rank-info">
              <span><strong>Total Score:</strong> {rankData?.totalScore?.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default RankLookup

