"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { toast } from "sonner"

export function OTPForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [email, setEmail] = useState("")
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('otp-email')
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      toast.error('Session expirée, veuillez vous reconnecter')
      setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
    }
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (code.length !== 6) {
      toast.error('Veuillez entrer un code à 6 chiffres')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Code vérifié avec succès')
        sessionStorage.removeItem('otp-email')
        // Les tokens JWT sont maintenant stockés dans des cookies httpOnly
        // Plus besoin de stocker les données utilisateur dans sessionStorage
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 1000)
      } else {
        toast.error(data.error || 'Code invalide')
        setCode("")
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async (e: React.MouseEvent) => {
    e.preventDefault()
    setResending(true)

    try {
      const response = await fetch('/api/otp/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Un nouveau code a été envoyé')
        setCode("")
        setCountdown(60)
      } else {
        toast.error(data.error || 'Erreur lors du renvoi du code')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de connexion au serveur')
    } finally {
      setResending(false)
    }
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Entrez le code de vérification</CardTitle>
        <CardDescription>Nous avons envoyé un code à 6 chiffres à votre email.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="otp">Code de vérification</FieldLabel>
              <InputOTP 
                maxLength={6} 
                id="otp" 
                value={code}
                onChange={setCode}
                disabled={loading}
                required
              >
                <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <FieldDescription>
                Entrez le code à 6 chiffres envoyé à votre email.
              </FieldDescription>
            </Field>
            <FieldGroup>
              <Button 
                type="submit"
                disabled={loading || code.length !== 6}
              >
                {loading ? 'Vérification...' : 'Vérifier'}
              </Button>
              <FieldDescription className="text-center">
                Vous n&apos;avez pas reçu le code ?{' '}
                <button
                  onClick={handleResend}
                  disabled={resending || countdown > 0}
                  className="text-primary hover:underline disabled:opacity-50"
                  type="button"
                >
                  {resending ? 'Envoi...' : countdown > 0 ? `Renvoyer (${countdown}s)` : 'Renvoyer'}
                </button>
              </FieldDescription>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
