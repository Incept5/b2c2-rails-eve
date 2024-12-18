import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth.context'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card } from '../../components/ui/card'
import { useToast } from '../../hooks/use-toast'
import { getThemeClass } from '../../lib/theme'

export function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signup } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signup(name, email, password)
      navigate('/')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create account',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className={`flex min-h-screen items-center justify-center ${getThemeClass('gradients.primary')}`}>
      <Card className={`w-full max-w-md p-6 ${getThemeClass('components.card.base')}`}>
        <h1 className={`mb-6 text-2xl font-bold ${getThemeClass('components.text.heading')}`}>Sign Up</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={getThemeClass('components.input.base')}
            />
          </div>
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={getThemeClass('components.input.base')}
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={getThemeClass('components.input.base')}
            />
          </div>
          <Button type="submit" className={`w-full ${getThemeClass('components.button.primary')}`}>
            Sign Up
          </Button>
        </form>
        <p className={`mt-4 text-center ${getThemeClass('components.text.body')}`}>
          Already have an account?{' '}
          <Button variant="link" onClick={() => navigate('/login')} className={getThemeClass('components.button.link')}>
            Login
          </Button>
        </p>
      </Card>
    </div>
  )
}