import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth.context'
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
        <DropdownMenuItem className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || 'Unknown'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email || ''}</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}