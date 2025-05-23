import React, { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from 'react-router-dom'
import { createRouter } from './router'
import { AuthProvider } from './lib/auth.context'
import { NoAuthProvider } from './lib/no-auth.context'
import { isAuthEnabled } from './lib/auth-config'
import { Toaster } from './components/ui/toaster'

export default function App() {
  const queryClient = useMemo(() => new QueryClient({}), [])
  const AuthContextProvider = isAuthEnabled() ? AuthProvider : NoAuthProvider
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <RouterProvider router={createRouter()} />
        <Toaster />
      </AuthContextProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
