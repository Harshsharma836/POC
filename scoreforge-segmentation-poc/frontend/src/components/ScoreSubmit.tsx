import { useState, FormEvent, useEffect } from 'react'
import type { GameMode } from '../types'
import { submitScore } from '../services/api'

interface ScoreSubmitProps {
  gameMode: GameMode
  onSuccess?: () => void
  currentUserId?: number
}

function ScoreSubmit({ gameMode, onSuccess, currentUserId }: ScoreSubmitProps) {
  const [userId, setUserId] = useState<string>('')
  const [score, setScore] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (currentUserId) {
      setUserId(currentUserId.toString())
    }
  }, [currentUserId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    const userIdNum = parseInt(userId)
    const scoreNum = parseInt(score)

    if (!userIdNum || userIdNum < 1) {
      setMessage({ type: 'error', text: 'Please enter a valid user ID' })
      return
    }

    if (!scoreNum || scoreNum < 0) {
      setMessage({ type: 'error', text: 'Please enter a valid score' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await submitScore(userIdNum, scoreNum, gameMode)
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Score submitted successfully!' })
        setUserId('')
        setScore('')
        setTimeout(() => {
          onSuccess?.()
        }, 500)
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to submit score' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error submitting score' })
      console.error('Error submitting score:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="submit-score-section">
      <h2>Submit Score</h2>
      <form className="submit-form" onSubmit={handleSubmit}>
        <input
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID"
          min="1"
          disabled={loading || !!currentUserId}
          title={currentUserId ? "Your user ID is automatically set" : "Enter user ID"}
        />
        <input
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="Score"
          min="0"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      <div className="submit-result">
        {message && (
          <div className={message.type}>
            {message.text}
          </div>
        )}
      </div>
    </section>
  )
}

export default ScoreSubmit

