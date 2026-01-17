"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export interface User {
  id_user: string
  email: string
  firstname: string
  lastname: string
  createdAt?: string
}

export interface Subscription {
  id: string
  planType: 'FREE' | 'STANDARD' | 'PRO'
  status: 'ACTIVE' | 'INACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING'
  storageLimit: string
  storageUsed: string
  stripeCurrentPeriodEnd?: string
  cancelAtPeriodEnd: boolean
}

interface AuthState {
  user: User | null
  subscription: Subscription | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    subscription: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Récupération de l'utilisateur au montage
  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setState({
          user: data.user,
          subscription: data.subscription,
          isLoading: false,
          isAuthenticated: true,
        })
      } else if (response.status === 401) {
        // Tentative de refresh du token
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        })

        if (refreshResponse.ok) {
          // Réessayer de récupérer l'utilisateur
          const retryResponse = await fetch('/api/auth/me', {
            credentials: 'include',
          })

          if (retryResponse.ok) {
            const data = await retryResponse.json()
            setState({
              user: data.user,
              subscription: data.subscription,
              isLoading: false,
              isAuthenticated: true,
            })
            return
          }
        }

        // Échec du refresh - utilisateur non connecté
        setState({
          user: null,
          subscription: null,
          isLoading: false,
          isAuthenticated: false,
        })
      } else {
        setState({
          user: null,
          subscription: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    } catch (error) {
      console.error('Erreur de récupération utilisateur:', error)
      setState({
        user: null,
        subscription: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // Fonction de déconnexion
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    } finally {
      setState({
        user: null,
        subscription: null,
        isLoading: false,
        isAuthenticated: false,
      })
      router.push('/login')
    }
  }, [router])

  // Fonction de rafraîchissement des données utilisateur
  const refreshUser = useCallback(async () => {
    await fetchUser()
  }, [fetchUser])

  return {
    user: state.user,
    subscription: state.subscription,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    isReady: !state.isLoading,
    logout,
    refreshUser,
  }
}
