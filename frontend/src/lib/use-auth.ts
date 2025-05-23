import { useAuth as useRealAuth } from './auth.context'
import { useNoAuth } from './no-auth.context'
import { isAuthEnabled } from './auth-config'
import { AuthContextType } from './auth.types'

export function useAuth(): AuthContextType {
  if (isAuthEnabled()) {
    return useRealAuth()
  } else {
    return useNoAuth()
  }
}
