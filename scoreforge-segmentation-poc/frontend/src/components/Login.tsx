import { useState } from 'react'
import { login } from '../services/api'
import type { User } from '../types'

interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(username.trim())
      
      console.log
      if (result.success && result.token && result.user) {
        localStorage.setItem('authToken', result.token)
        localStorage.setItem('user', JSON.stringify(result.user))
        localStorage.setItem('token', result.token);

        onLoginSuccess(result.user, result.token)
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError('Failed to connect to server')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🎮 Gaming Leaderboard</h1>
        <p className="login-subtitle">Enter your username to continue</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoFocus
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading || !username.trim()}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="login-note">
          Note: No password required. Just enter your username to access the leaderboard.
        </p>
      </div>

      <style>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .login-box {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 400px;
        }

        .login-box h1 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 28px;
          text-align: center;
        }

        .login-subtitle {
          text-align: center;
          color: #666;
          margin-bottom: 30px;
          font-size: 14px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .form-group input {
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-group input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .error-message {
          background-color: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          border: 1px solid #fcc;
        }

        .login-button {
          padding: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-note {
          margin-top: 20px;
          font-size: 12px;
          color: #999;
          text-align: center;
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}

