export type GameMode = 'story' | 'multiplayer'

export interface LeaderboardPlayer {
  userId: number
  username: string
  totalScore: number
  rank: number
}

export interface PlayerRank {
  userId: number
  username: string
  totalScore: number
  rank: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  gameMode?: GameMode
  limit?: number
}

export interface User {
  id: number
  username: string
}

export interface LoginResponse {
  success: boolean
  token?: string
  user?: User
  error?: string
}

