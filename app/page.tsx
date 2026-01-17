'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Cloud, Lock, Zap, Shield, ArrowRight, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function HomePage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  // Générer les initiales pour l'avatar
  const initials = user
    ? `${user.firstname?.[0] || ''}${user.lastname?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Cloud className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">CloudStorage</span>
          </Link>
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="h-10 w-24 bg-muted animate-pulse rounded-md"></div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Button>Tableau de bord</Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{initials}</AvatarFallback>
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
                        Paramètres du compte
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                      Déconnexion
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
                  <Button>Commencer</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          Stockez vos fichiers en toute sécurité
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Une solution de stockage cloud simple, sécurisée et abordable.
          Commencez gratuitement avec 5 Go et évoluez selon vos besoins.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/pricing">
            <Button size="lg" className="gap-2">
              Voir les plans
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          {!isLoading && (
            isAuthenticated && user ? (
              <Link href="/dashboard">
                <Button size="lg" variant="outline">
                  Accéder à mon espace
                </Button>
              </Link>
            ) : (
              <Link href="/signup">
                <Button size="lg" variant="outline">
                  Essayer gratuitement
                </Button>
              </Link>
            )
          )}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cloud className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Stockage flexible</h3>
            <p className="text-muted-foreground">
              De 5 Go à 2 To selon vos besoins
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sécurisé</h3>
            <p className="text-muted-foreground">
              Chiffrement de bout en bout pour vos fichiers
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Rapide</h3>
            <p className="text-muted-foreground">
              Upload et download ultra-rapides
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fiable</h3>
            <p className="text-muted-foreground">
              Disponibilité de 99.9% garantie
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-primary/5 rounded-3xl p-12 text-center border border-primary/10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isAuthenticated && user ? `Bienvenue ${user.firstname} !` : 'Prêt à commencer ?'}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {isAuthenticated && user
              ? 'Accédez à votre espace de stockage et gérez vos fichiers.'
              : 'Créez votre compte gratuitement et profitez de 5 Go de stockage dès maintenant.'
            }
          </p>
          {!isLoading && (
            isAuthenticated && user ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Aller au tableau de bord
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Créer un compte gratuit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 CloudStorage. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
