"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import { Button } from "@/components/ui/button"
import { IconFile, IconFolder, IconPhoto, IconMovie, IconPlus, IconArrowRight, IconTrendingUp } from "@tabler/icons-react"

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
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/80 backdrop-blur-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  CloudStorage
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Tableau de bord</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Welcome header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">
              Bonjour, <span className="gradient-text">{user.firstname}</span>
            </h1>
            <p className="text-muted-foreground">
              Voici un apercu de votre espace de stockage
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <SubscriptionCard userId={user.id_user} />

            {/* Consommation de stockage */}
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-card to-muted/30 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IconFile className="h-4 w-4 text-primary" />
                  </div>
                  Consommation
                </CardTitle>
                <CardDescription>Utilisation de votre espace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <IconPhoto className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Images</p>
                    <p className="text-xs text-muted-foreground">1.2 Go</p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">245</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <IconMovie className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Videos</p>
                    <p className="text-xs text-muted-foreground">2.8 Go</p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">32</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <IconFile className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Documents</p>
                    <p className="text-xs text-muted-foreground">450 Mo</p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">128</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <IconFolder className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Autres</p>
                    <p className="text-xs text-muted-foreground">320 Mo</p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">56</span>
                </div>
              </CardContent>
            </Card>

            {/* Projets recents */}
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-card to-muted/30 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconFolder className="h-4 w-4 text-primary" />
                    </div>
                    Projets recents
                  </CardTitle>
                  <CardDescription>Vos derniers projets</CardDescription>
                </div>
                <Link href="/dashboard/projects">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                    <IconArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Site Web Portfolio", time: "Modifie il y a 2h", color: "bg-indigo-500" },
                  { name: "Application Mobile", time: "Modifie hier", color: "bg-cyan-500" },
                  { name: "Design System", time: "Modifie il y a 3 jours", color: "bg-violet-500" },
                ].map((project, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className={`h-10 w-10 rounded-xl ${project.color}/10 flex items-center justify-center`}>
                      <IconFolder className={`h-5 w-5 ${project.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.time}</p>
                    </div>
                  </div>
                ))}
                <Link href="/dashboard/projects" className="block pt-2">
                  <Button variant="outline" className="w-full gap-2">
                    <IconPlus className="h-4 w-4" />
                    Nouveau projet
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Analytics */}
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-card to-muted/30 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconTrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    Statistiques d'utilisation
                  </CardTitle>
                  <CardDescription>Consommation des 7 derniers jours</CardDescription>
                </div>
                <Link href="/dashboard/analytics">
                  <Button variant="outline" size="sm" className="gap-2">
                    Voir plus
                    <IconArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-3 h-40">
                {[
                  { value: 65, uploads: 12 },
                  { value: 40, uploads: 8 },
                  { value: 85, uploads: 18 },
                  { value: 30, uploads: 5 },
                  { value: 55, uploads: 11 },
                  { value: 70, uploads: 15 },
                  { value: 45, uploads: 9 },
                ].map((day, i) => (
                  <div key={i} className="flex flex-col items-center justify-end gap-2 group">
                    <div className="relative w-full flex flex-col items-center justify-end h-full">
                      <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg">
                        {day.uploads} uploads
                      </div>
                      <div
                        className="w-full max-w-[40px] rounded-lg transition-all duration-300 group-hover:opacity-80"
                        style={{
                          height: `${day.value}%`,
                          background: `linear-gradient(to top, oklch(0.55 0.25 275), oklch(0.7 0.2 200))`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i]}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                {[
                  { label: "Total utilise", value: "4.77 Go", icon: IconFile, color: "text-primary" },
                  { label: "Fichiers", value: "461", icon: IconFile, color: "text-blue-500" },
                  { label: "Dossiers", value: "23", icon: IconFolder, color: "text-emerald-500" },
                  { label: "Partages", value: "12", icon: IconArrowRight, color: "text-violet-500" },
                ].map((stat, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className={`h-10 w-10 rounded-lg bg-background flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
