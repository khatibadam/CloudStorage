"use client"

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
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Logo } from "@/components/logo"
import { User, Mail, Lock, ArrowRight } from "lucide-react"
import Link from "next/link"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const fullName = formData.get("name") as string
    const [firstname, ...lastnameArr] = fullName.split(" ")
    const lastname = lastnameArr.join(" ")
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm-password") as string

    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caracteres")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname,
          lastname,
          email,
          password,
          confirmPassword,
        }),
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.message || "Erreur lors de la creation du compte")
      } else {
        toast.success("Compte cree avec succes")
        router.push("/login")
      }
    } catch (error) {
      toast.error("Erreur lors de la creation du compte")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center lg:hidden mb-4">
        <Logo size="md" />
      </div>

      <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm" {...props}>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">Creer votre compte</CardTitle>
          <CardDescription className="text-base">
            Commencez avec 5 Go de stockage gratuit
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name" className="text-sm font-medium">Nom complet</FieldLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Prenom Nom"
                    required
                    disabled={isLoading}
                    className="pl-10 h-11"
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="email" className="text-sm font-medium">Email</FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    required
                    disabled={isLoading}
                    className="pl-10 h-11"
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="password" className="text-sm font-medium">Mot de passe</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
                    className="pl-10 h-11"
                    placeholder="Minimum 8 caracteres"
                  />
                </div>
                <FieldDescription>
                  Minimum 8 caracteres
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password" className="text-sm font-medium">
                  Confirmer le mot de passe
                </FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    required
                    disabled={isLoading}
                    className="pl-10 h-11"
                    placeholder="Confirmez votre mot de passe"
                  />
                </div>
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 text-base glow-sm gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Creation en cours...
                    </>
                  ) : (
                    <>
                      Creer mon compte
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground pt-4">
                  Deja un compte ?{' '}
                  <Link href="/login" className="text-primary font-medium hover:text-primary/80 transition-colors">
                    Connectez-vous
                  </Link>
                </p>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
