"use client"

import { useCallback, useRef, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"

interface User {
  id_user: string
  email: string
  firstname: string
  lastname: string
}

let cachedUser: User | null = null
let cacheInitialized = false

function getUser(): User | null {
  if (!cacheInitialized && typeof window !== "undefined") {
    const storedUser = sessionStorage.getItem("user")
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      try {
        const parsed = JSON.parse(storedUser)
        if (parsed && parsed.email) {
          cachedUser = parsed
        }
      } catch {
        sessionStorage.removeItem("user")
      }
    }
    cacheInitialized = true
  }
  return cachedUser
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

function getServerSnapshot(): User | null {
  return null
}

export function useAuth() {
  const user = useSyncExternalStore(subscribe, getUser, getServerSnapshot)
  const router = useRouter()

  const logout = useCallback(() => {
    sessionStorage.removeItem("user")
    cachedUser = null
    cacheInitialized = false
    window.location.href = "/login"
  }, [])

  return { user, isReady: cacheInitialized || typeof window === "undefined", logout }
}
