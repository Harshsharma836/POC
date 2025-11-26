import type { GameMode, LeaderboardPlayer, PlayerRank, ApiResponse, LoginResponse } from '../types'

const API_BASE_URL = '/api/leaderboard'
const AUTH_BASE_URL = '/api/auth'

const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken') // keep as is
}

export const submitScore = async (
  userId: number,
  score: number,
  gameMode: GameMode
): Promise<ApiResponse<void>> => {
  const token = getAuthToken() 
  const response = await fetch(`${API_BASE_URL}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({
      user_id: userId,
      score: score,
      game_mode: gameMode,
    }),
  })
  return response.json()
}

export const getTopPlayers = async (
  gameMode: GameMode,
  limit: number = 10
): Promise<ApiResponse<LeaderboardPlayer[]>> => {
  const token = getAuthToken() // include token if available
  const response = await fetch(
    `${API_BASE_URL}/top?limit=${limit}&game_mode=${gameMode}`,
    {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    }
  )
  return response.json()
}

export const getPlayerRank = async (
  userId: number,
  gameMode: GameMode
): Promise<ApiResponse<PlayerRank>> => {
  const token = getAuthToken() // include token
  const response = await fetch(
    `${API_BASE_URL}/rank/${userId}?game_mode=${gameMode}`,
    {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    }
  )
  return response.json()
}

export const checkHealth = async (): Promise<{ status: string }> => {
  const response = await fetch('/health')
  return response.json()
}

export const login = async (username: string): Promise<LoginResponse> => {
  const response = await fetch(`${AUTH_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  })
  const data = await response.json()
  // save token to localStorage if login successful
  if (data.success && data.token) {
    localStorage.setItem('authToken', data.token)
  }
  return data
}

export const verifyToken = async (): Promise<{ success: boolean; user?: { id: number; username: string } }> => {
  const token = getAuthToken()
  if (!token) {
    return { success: false }
  }

  const response = await fetch(`${AUTH_BASE_URL}/verify`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  return response.json()
}
