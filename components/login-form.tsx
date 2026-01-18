"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Mail, Lock, ArrowRight } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caracteres')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Code envoye a votre email')
        sessionStorage.setItem('otp-email', email)
        setTimeout(() => {
          window.location.href = "/otp"
        }, 1000)
      } else {
        toast.error(data.error || 'Erreur lors de la connexion')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex justify-center lg:hidden mb-4">
        <Logo size="md" />
      </div>

      <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">Bon retour parmi nous</CardTitle>
          <CardDescription className="text-base">
            Entrez vos identifiants pour vous connecter
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email" className="text-sm font-medium">Email</FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    required
                    disabled={loading}
                    autoComplete="email"
                    className="pl-10 h-11"
                  />
                </div>
              </Field>
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password" className="text-sm font-medium">Mot de passe</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Mot de passe oublie ?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                    className="pl-10 h-11"
                  />
                </div>
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 text-base glow-sm gap-2"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Envoi du code...
                    </>
                  ) : (
                    <>
                      Recevoir le code
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </Field>
              <p className="text-center text-sm text-muted-foreground pt-2">
                Vous n'avez pas de compte ?{' '}
                <Link href="/signup" className="text-primary font-medium hover:text-primary/80 transition-colors">
                  Creez-en un
                </Link>
              </p>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
