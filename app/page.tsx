'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Lock, Server, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const initials = user
    ? `${user.firstname?.[0] || ''}${user.lastname?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient background effect */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-[400px] w-[400px] rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="md" />
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Tarifs
            </Link>
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Fonctionnalites
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-10 w-24 bg-muted animate-pulse rounded-lg"></div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Button className="glow-sm">Tableau de bord</Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.firstname} {user.lastname}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <Link href="/dashboard">
                      <DropdownMenuItem className="cursor-pointer">
                        Tableau de bord
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/dashboard/settings">
                      <DropdownMenuItem className="cursor-pointer">
                        Parametres du compte
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                      Deconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Connexion</Button>
                </Link>
                <Link href="/signup">
                  <Button className="glow-sm">Commencer</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Nouveau : 5 Go gratuits pour demarrer
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Stockez vos fichiers
            <span className="block gradient-text">en toute securite</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Une solution de stockage cloud simple, securisee et abordable.
            Commencez gratuitement et evoluez selon vos besoins.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap mb-16">
            <Link href="/pricing">
              <Button size="lg" className="h-14 px-8 text-lg glow gap-2">
                Voir les plans
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            {!isLoading && (
              isAuthenticated && user ? (
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                    Acceder a mon espace
                  </Button>
                </Link>
              ) : (
                <Link href="/signup">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                    Essayer gratuitement
                  </Button>
                </Link>
              )
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <div className="text-3xl font-bold gradient-text">99.9%</div>
              <div className="text-sm text-muted-foreground">Disponibilite</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text">256-bit</div>
              <div className="text-sm text-muted-foreground">Chiffrement</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text">2 To</div>
              <div className="text-sm text-muted-foreground">Max stockage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Une plateforme complete pour gerer vos fichiers en toute simplicite
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-muted/30 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Server className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Stockage flexible</h3>
              <p className="text-muted-foreground">
                De 5 Go a 2 To selon vos besoins. Evoluez a votre rythme.
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-muted/30 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ultra securise</h3>
              <p className="text-muted-foreground">
                Chiffrement de bout en bout pour tous vos fichiers.
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-muted/30 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ultra rapide</h3>
              <p className="text-muted-foreground">
                Upload et download optimises pour une experience fluide.
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-muted/30 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">100% fiable</h3>
              <p className="text-muted-foreground">
                Infrastructure robuste avec 99.9% de disponibilite.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Pourquoi choisir CloudStorage ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Nous avons concu CloudStorage pour etre la solution la plus simple
              et la plus securisee pour stocker vos fichiers.
            </p>
            <div className="space-y-4">
              {[
                "Interface intuitive et moderne",
                "Synchronisation automatique multi-appareils",
                "Partage securise avec controle d'acces",
                "Historique des versions illimite",
                "Support client reactif 24/7",
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 p-8 glow">
              <div className="h-full w-full rounded-2xl bg-card border flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="h-20 w-20 rounded-2xl gradient-primary mx-auto mb-6 flex items-center justify-center">
                    <Server className="h-10 w-10 text-white" />
                  </div>
                  <div className="text-4xl font-bold mb-2">2 To</div>
                  <div className="text-muted-foreground">de stockage disponible</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-12 md:p-16">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
          <div className="relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {isAuthenticated && user ? `Bienvenue ${user.firstname} !` : 'Pret a commencer ?'}
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              {isAuthenticated && user
                ? 'Accedez a votre espace de stockage et gerez vos fichiers.'
                : 'Creez votre compte gratuitement et profitez de 5 Go de stockage des maintenant.'
              }
            </p>
            {!isLoading && (
              isAuthenticated && user ? (
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary" className="h-14 px-8 text-lg gap-2">
                    Aller au tableau de bord
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="h-14 px-8 text-lg gap-2">
                    Creer un compte gratuit
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo size="sm" href={undefined} />
            <nav className="flex items-center gap-8">
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Tarifs
              </Link>
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Fonctionnalites
              </Link>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Connexion
              </Link>
            </nav>
            <p className="text-sm text-muted-foreground">
              &copy; 2026 CloudStorage. Tous droits reserves.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
