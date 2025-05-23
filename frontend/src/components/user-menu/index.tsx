import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/use-auth'
import { isAuthEnabled } from '../../lib/auth-config'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Avatar, AvatarFallback } from '../ui/avatar'

export function UserMenu() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  // If auth is disabled, don't show any auth UI
  if (!isAuthEnabled()) {
    return null
  }

  if (!isAuthenticated) {
    return (
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => navigate('/login')}>
          Login
        </Button>
        <Button onClick={() => navigate('/signup')}>Sign Up</Button>
      </div>
    )
  }

  // Add null check for user
  if (!user) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
