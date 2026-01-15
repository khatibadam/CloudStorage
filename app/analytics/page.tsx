"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconFile, IconFolder, IconPhoto, IconMovie, IconCloud, IconUpload, IconDownload, IconShare } from "@tabler/icons-react"

export default function AnalyticsPage() {
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
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <h1 className="text-lg font-semibold">Analytics</h1>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Stats générales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Stockage total</CardTitle>
                <IconCloud className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.77 Go</div>
                <p className="text-xs text-muted-foreground">sur 5 Go (95.4%)</p>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '95.4%' }} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Fichiers uploadés</CardTitle>
                <IconUpload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+34</div>
                <p className="text-xs text-muted-foreground">cette semaine</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Téléchargements</CardTitle>
                <IconDownload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">ce mois</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Partages actifs</CardTitle>
                <IconShare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">liens partagés</p>
              </CardContent>
            </Card>
          </div>

          {/* Graphique d'utilisation */}
          <Card>
            <CardHeader>
              <CardTitle>Utilisation du stockage</CardTitle>
              <CardDescription>Consommation des 30 derniers jours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-15 gap-1 h-40">
                {[45, 52, 48, 65, 70, 55, 60, 72, 68, 75, 80, 78, 82, 85, 88, 75, 70, 82, 90, 85, 88, 92, 89, 93, 91, 94, 92, 95, 94, 95].map((value, i) => (
                  <div key={i} className="flex flex-col items-center justify-end">
                    <div
                      className="w-full bg-primary/80 rounded-t-sm transition-all hover:bg-primary"
                      style={{ height: `${value}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Il y a 30 jours</span>
                <span>Aujourd&apos;hui</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par type</CardTitle>
                <CardDescription>Arabe utilisé par catégorie</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconPhoto className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Images</span>
                    </div>
                    <span className="text-sm font-medium">1.2 Go (25%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconMovie className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Vidéos</span>
                    </div>
                    <span className="text-sm font-medium">2.8 Go (59%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '59%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconFile className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Documents</span>
                    </div>
                    <span className="text-sm font-medium">450 Mo (9%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '9%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconFolder className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Autres</span>
                    </div>
                    <span className="text-sm font-medium">320 Mo (7%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '7%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activité récente */}
            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
                <CardDescription>Dernières 24 heures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <IconUpload className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">3 fichiers uploadés</p>
                      <p className="text-xs text-muted-foreground">Total: 245 Mo</p>
                    </div>
                    <span className="text-xs text-muted-foreground">Il y a 2h</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <IconDownload className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">5 fichiers téléchargés</p>
                      <p className="text-xs text-muted-foreground">Total: 512 Mo</p>
                    </div>
                    <span className="text-xs text-muted-foreground">Il y a 4h</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <IconShare className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nouveau partage créé</p>
                      <p className="text-xs text-muted-foreground">projet_final.zip</p>
                    </div>
                    <span className="text-xs text-muted-foreground">Il y a 6h</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <IconFolder className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Dossier créé</p>
                      <p className="text-xs text-muted-foreground">Vacances 2024</p>
                    </div>
                    <span className="text-xs text-muted-foreground">Il y a 12h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
