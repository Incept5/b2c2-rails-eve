import { env } from './env'

interface LoginCredentials {
  email: string
  password: string
  grant_type?: 'password'  // Optional in interface since we add it in the login method
}

interface SignupCredentials extends LoginCredentials {
  name: string
}

interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
  }
}

export class AuthService {
  private static TOKEN_KEY = 'auth_token'
  private static USER_KEY = 'auth_user'

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${env.VITE_API_URL}/api/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...credentials,
        grant_type: 'password'
      }),
    })

    if (!response.ok) {
      throw new Error('Login failed')
    }

    const data = await response.json()
    // Store the token and user data immediately
    this.setToken(data.token)
    this.setUser(data.user)
    return data
  }

  static async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await fetch(`${env.VITE_API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      throw new Error('Signup failed')
    }

    const data = await response.json()
    // Store the token and user data immediately
    this.setToken(data.token)
    this.setUser(data.user)
    return data
  }

  static getToken(): string | null {
    return localStorage.getItem(AuthService.TOKEN_KEY)
  }

  static setToken(token: string): void {
    localStorage.setItem(AuthService.TOKEN_KEY, token)
  }

  static getUser(): any | null {
    const user = localStorage.getItem(AuthService.USER_KEY)
    if (!user) return null
    try {
      return JSON.parse(user)
    } catch (error) {
      console.error('Failed to parse user data from localStorage:', error)
      return null
    }
  }

  static setUser(user: any): void {
    localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user))
  }

  static logout(): void {
    localStorage.removeItem(AuthService.TOKEN_KEY)
    localStorage.removeItem(AuthService.USER_KEY)
  }

  static isAuthenticated(): boolean {
    return !!this.getToken()
  }
}