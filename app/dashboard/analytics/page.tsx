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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconFolder,
  IconFile,
  IconCloudUpload,
  IconActivity,
  IconChartBar,
} from "@tabler/icons-react"

// Données mock pour les analytics
const MOCK_ANALYTICS = {
  totalStorage: 4.77,
  storageChange: 12.5,
  totalFiles: 461,
  filesChange: 8.2,
  totalProjects: 12,
  projectsChange: -2.1,
  bandwidth: 2.3,
  bandwidthChange: 15.8,
  weeklyActivity: [
    { day: "Lun", uploads: 45, downloads: 32 },
    { day: "Mar", uploads: 28, downloads: 41 },
    { day: "Mer", uploads: 67, downloads: 55 },
    { day: "Jeu", uploads: 34, downloads: 28 },
    { day: "Ven", uploads: 52, downloads: 63 },
    { day: "Sam", uploads: 18, downloads: 22 },
    { day: "Dim", uploads: 12, downloads: 15 },
  ],
  storageByType: [
    { type: "Images", size: 1.2, color: "bg-blue-500" },
    { type: "Vidéos", size: 2.8, color: "bg-purple-500" },
    { type: "Documents", size: 0.45, color: "bg-green-500" },
    { type: "Autres", size: 0.32, color: "bg-orange-500" },
  ],
  recentActivity: [
    { action: "Upload", file: "presentation.pdf", time: "Il y a 5 min" },
    { action: "Download", file: "rapport-2024.xlsx", time: "Il y a 15 min" },
    { action: "Partage", file: "photos-vacances.zip", time: "Il y a 1h" },
    { action: "Upload", file: "video-demo.mp4", time: "Il y a 2h" },
    { action: "Suppression", file: "ancien-backup.tar", time: "Il y a 3h" },
  ],
}

function StatCard({
  title,
  value,
  unit,
  change,
  icon: Icon,
}: {
  title: string
  value: number | string
  unit?: string
  change: number
  icon: React.ElementType
}) {
  const isPositive = change >= 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          {unit && <span className="text-lg font-normal text-muted-foreground ml-1">{unit}</span>}
        </div>
        <p className={`text-xs flex items-center gap-1 mt-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {isPositive ? (
            <IconTrendingUp className="h-3 w-3" />
          ) : (
            <IconTrendingDown className="h-3 w-3" />
          )}
          {isPositive ? "+" : ""}{change}% par rapport au mois dernier
        </p>
      </CardContent>
    </Card>
  )
}

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

  const maxUploads = Math.max(...MOCK_ANALYTICS.weeklyActivity.map(d => d.uploads))
  const maxDownloads = Math.max(...MOCK_ANALYTICS.weeklyActivity.map(d => d.downloads))
  const maxActivity = Math.max(maxUploads, maxDownloads)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">CloudStorage</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Analytics</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Stockage utilisé"
              value={MOCK_ANALYTICS.totalStorage}
              unit="Go"
              change={MOCK_ANALYTICS.storageChange}
              icon={IconCloudUpload}
            />
            <StatCard
              title="Total fichiers"
              value={MOCK_ANALYTICS.totalFiles}
              change={MOCK_ANALYTICS.filesChange}
              icon={IconFile}
            />
            <StatCard
              title="Projets actifs"
              value={MOCK_ANALYTICS.totalProjects}
              change={MOCK_ANALYTICS.projectsChange}
              icon={IconFolder}
            />
            <StatCard
              title="Bande passante"
              value={MOCK_ANALYTICS.bandwidth}
              unit="Go"
              change={MOCK_ANALYTICS.bandwidthChange}
              icon={IconActivity}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Graphique d'activité hebdomadaire */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconChartBar className="h-5 w-5" />
                  Activité hebdomadaire
                </CardTitle>
                <CardDescription>Uploads et downloads des 7 derniers jours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MOCK_ANALYTICS.weeklyActivity.map((day, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="w-10 text-muted-foreground">{day.day}</span>
                        <div className="flex-1 mx-4 space-y-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 bg-primary rounded-full transition-all"
                              style={{ width: `${(day.uploads / maxActivity) * 100}%` }}
                            />
                            <span className="text-xs text-muted-foreground w-8">{day.uploads}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 bg-primary/40 rounded-full transition-all"
                              style={{ width: `${(day.downloads / maxActivity) * 100}%` }}
                            />
                            <span className="text-xs text-muted-foreground w-8">{day.downloads}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                    <span className="text-sm text-muted-foreground">Uploads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary/40 rounded-full" />
                    <span className="text-sm text-muted-foreground">Downloads</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Répartition du stockage */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Répartition du stockage</CardTitle>
                <CardDescription>Par type de fichier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MOCK_ANALYTICS.storageByType.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.type}</span>
                        <span className="text-muted-foreground">{item.size} Go</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${item.color}`}
                          style={{ width: `${(item.size / MOCK_ANALYTICS.totalStorage) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total utilisé</span>
                    <span className="text-lg font-bold">{MOCK_ANALYTICS.totalStorage} Go</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activité récente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUsers className="h-5 w-5" />
                Activité récente
              </CardTitle>
              <CardDescription>Dernières actions sur vos fichiers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_ANALYTICS.recentActivity.map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        activity.action === "Upload" ? "bg-green-500/10 text-green-500" :
                        activity.action === "Download" ? "bg-blue-500/10 text-blue-500" :
                        activity.action === "Partage" ? "bg-purple-500/10 text-purple-500" :
                        "bg-red-500/10 text-red-500"
                      }`}>
                        {activity.action === "Upload" && <IconCloudUpload className="h-4 w-4" />}
                        {activity.action === "Download" && <IconFile className="h-4 w-4" />}
                        {activity.action === "Partage" && <IconUsers className="h-4 w-4" />}
                        {activity.action === "Suppression" && <IconFile className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.file}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
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
