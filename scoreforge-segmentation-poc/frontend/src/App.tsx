import { useState, useEffect, useCallback } from 'react'
import Login from './components/Login'
import Header from './components/Header'
import Leaderboard from './components/Leaderboard'
import RankLookup from './components/RankLookup'
import ScoreSubmit from './components/ScoreSubmit'
import Footer from './components/Footer'
import type { GameMode, User } from './types'
import { checkHealth, verifyToken } from './services/api'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [gameMode, setGameMode] = useState<GameMode>('story')
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [lastUpdated, setLastUpdated] = useState<string>('Never')

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('authToken')
      const storedUser = localStorage.getItem('user')
      
      if (storedToken && storedUser) {
        const result = await verifyToken()
        if (result.success && result.user) {
          setCurrentUser(result.user)
          setIsLoggedIn(true)
        } else {
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
        }
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const health = await checkHealth()
        setIsConnected(health.status === 'ok')
      } catch (error) {
        setIsConnected(false)
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const handleGameModeChange = useCallback((mode: GameMode) => {
    setGameMode(mode)
  }, [])

  const handleLeaderboardUpdate = useCallback(() => {
    setLastUpdated(new Date().toLocaleTimeString())
  }, [])

  const handleLoginSuccess = useCallback((user: User, token: string) => {
    setCurrentUser(user)
    setIsLoggedIn(true)
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setCurrentUser(null)
    setIsLoggedIn(false)
  }, [])

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="container">
      <Header 
        gameMode={gameMode} 
        onGameModeChange={handleGameModeChange}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main>
        <Leaderboard 
          gameMode={gameMode} 
          onUpdate={handleLeaderboardUpdate}
        />
        <RankLookup gameMode={gameMode} currentUserId={currentUser?.id} />
        <ScoreSubmit 
          gameMode={gameMode} 
          onSuccess={handleLeaderboardUpdate}
          currentUserId={currentUser?.id}
        />
      </main>
      <Footer isConnected={isConnected} lastUpdated={lastUpdated} />
    </div>
  )
}

export default App

