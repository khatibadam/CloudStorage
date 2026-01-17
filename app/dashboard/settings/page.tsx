"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { User, Lock, Mail, Calendar, CreditCard } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function SettingsPage() {
  const { user, subscription, isLoading, refreshUser } = useAuth()

  // États du formulaire profil
  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [profileLoading, setProfileLoading] = useState(false)

  // États du formulaire mot de passe
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Initialisation des champs avec les données utilisateur
  useEffect(() => {
    if (user) {
      setFirstname(user.firstname || "")
      setLastname(user.lastname || "")
    }
  }, [user])

  // Mise à jour du profil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ firstname, lastname }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Profil mis à jour avec succès')
        refreshUser()
      } else {
        toast.error(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de connexion au serveur')
    } finally {
      setProfileLoading(false)
    }
  }

  // Changement de mot de passe
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setPasswordLoading(true)

    try {
      const response = await fetch('/api/users/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Mot de passe modifié avec succès')
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast.error(data.error || 'Erreur lors du changement de mot de passe')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de connexion au serveur')
    } finally {
      setPasswordLoading(false)
    }
  }

  // Données simulées pour la démo (synchronisé avec subscription-card)
  const MOCK_STORAGE_USED_GO = 4.77

  // Formatage du stockage
  const formatStorageLimit = (planType: string) => {
    switch (planType) {
      case 'FREE': return '5 Go'
      case 'STANDARD': return '500 Go'
      case 'PRO': return '2 To'
      default: return '5 Go'
    }
  }

  const getStorageDisplay = () => {
    if (!subscription) return '0 Go / 5 Go'
    return `${MOCK_STORAGE_USED_GO} Go / ${formatStorageLimit(subscription.planType)}`
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-3xl font-bold">Paramètres</h1>
            <p className="text-muted-foreground">Gérez votre compte et vos préférences</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Informations du profil */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
                <CardDescription>
                  Mettez à jour vos informations de profil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="firstname">Prénom</FieldLabel>
                      <Input
                        id="firstname"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        placeholder="Votre prénom"
                        disabled={profileLoading}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="lastname">Nom</FieldLabel>
                      <Input
                        id="lastname"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        placeholder="Votre nom"
                        disabled={profileLoading}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        L&apos;email ne peut pas être modifié
                      </p>
                    </Field>
                    <Button type="submit" disabled={profileLoading}>
                      {profileLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </Button>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>

            {/* Changement de mot de passe */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Sécurité
                </CardTitle>
                <CardDescription>
                  Modifiez votre mot de passe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="currentPassword">Mot de passe actuel</FieldLabel>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Votre mot de passe actuel"
                        required
                        disabled={passwordLoading}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="newPassword">Nouveau mot de passe</FieldLabel>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 8 caractères"
                        required
                        disabled={passwordLoading}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="confirmPassword">Confirmer le mot de passe</FieldLabel>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmez votre nouveau mot de passe"
                        required
                        disabled={passwordLoading}
                      />
                    </Field>
                    <Button type="submit" disabled={passwordLoading}>
                      {passwordLoading ? 'Modification...' : 'Modifier le mot de passe'}
                    </Button>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Informations du compte */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Détails du compte */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Détails du compte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">ID Utilisateur</span>
                  <span className="font-mono text-sm">{user?.id_user?.slice(0, 12)}...</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Email</span>
                  <span>{user?.email}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Membre depuis
                  </span>
                  <span>
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '-'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Abonnement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Abonnement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Plan actuel</span>
                  <span className="font-semibold">
                    {subscription?.planType || 'FREE'}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Statut</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    subscription?.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    {subscription?.status || 'INACTIVE'}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Stockage</span>
                  <span>{getStorageDisplay()}</span>
                </div>
                {subscription?.stripeCurrentPeriodEnd && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Renouvellement</span>
                      <span>
                        {new Date(subscription.stripeCurrentPeriodEnd).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </>
                )}
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => window.location.href = '/pricing'}
                >
                  {subscription?.planType === 'FREE' ? 'Passer au Premium' : 'Gérer mon abonnement'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
