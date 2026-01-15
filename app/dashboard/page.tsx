"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { SubscriptionCard } from "@/components/subscription-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconFile, IconFolder, IconPhoto, IconMovie } from "@tabler/icons-react"

export default function Page() {
  const { user, isReady } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isReady && !user) {
      router.push("/login")
    }
  }, [isReady, user, router])

  if (!isReady || !user) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p>Chargement...</p>
      </div>
    )
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Building Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SubscriptionCard userId={user.id_user} />

            {/* Consommation de stockage */}
            <Card>
              <CardHeader>
                <CardTitle>Consommation</CardTitle>
                <CardDescription>Utilisation de votre espace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <IconPhoto className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Images</p>
                    <p className="text-xs text-muted-foreground">1.2 Go</p>
                  </div>
                  <span className="text-sm text-muted-foreground">245 fichiers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <IconMovie className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Vidéos</p>
                    <p className="text-xs text-muted-foreground">2.8 Go</p>
                  </div>
                  <span className="text-sm text-muted-foreground">32 fichiers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <IconFile className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Documents</p>
                    <p className="text-xs text-muted-foreground">450 Mo</p>
                  </div>
                  <span className="text-sm text-muted-foreground">128 fichiers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <IconFolder className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Autres</p>
                    <p className="text-xs text-muted-foreground">320 Mo</p>
                  </div>
                  <span className="text-sm text-muted-foreground">56 fichiers</span>
                </div>
              </CardContent>
            </Card>

            {/* Activité récente */}
            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
                <CardDescription>Dernières actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm">photo_charliekirk.jpg uploadé</p>
                    <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm">Dossier "Projets" créé</p>
                    <p className="text-xs text-muted-foreground">Il y a 5 heures</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-purple-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm">video_demo.mp4 partagé</p>
                    <p className="text-xs text-muted-foreground">Hier</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-orange-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm">rapport.pdf téléchargé</p>
                    <p className="text-xs text-muted-foreground">Il y a 2 jours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques d&apos;utilisation</CardTitle>
              <CardDescription>Consommation des 7 derniers jours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 h-32">
                {[65, 40, 85, 30, 55, 70, 45].map((value, i) => (
                  <div key={i} className="flex flex-col items-center justify-end gap-1">
                    <div
                      className="w-full bg-primary/80 rounded-t-sm transition-all hover:bg-primary"
                      style={{ height: `${value}%` }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t">
                <div>
                  <p className="text-2xl font-bold">4.77 Go</p>
                  <p className="text-sm text-muted-foreground">Total utilisé</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">461</p>
                  <p className="text-sm text-muted-foreground">Fichiers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">23</p>
                  <p className="text-sm text-muted-foreground">Dossiers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Partagés</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
