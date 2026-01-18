import { SignupForm } from "@/components/signup-form"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { Check } from "lucide-react"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className="h-6 w-6">
                <path
                  d="M36 22c0-4.97-4.03-9-9-9-3.92 0-7.26 2.51-8.48 6.02C16.93 18.37 15.01 17 12.8 17 9.58 17 7 19.58 7 22.8c0 .4.04.79.11 1.17C5.27 24.9 4 26.81 4 29c0 3.31 2.69 6 6 6h27c3.31 0 6-2.69 6-6 0-2.76-1.86-5.08-4.4-5.78C38.85 22.73 39 22.13 39 21.5c0-.17-.01-.34-.02-.5H36z"
                  fill="white"
                />
                <g transform="translate(24, 26)">
                  <path d="M0 -8L-5 -2H-2.5V4H2.5V-2H5L0 -8Z" fill="oklch(0.55 0.25 275)" />
                </g>
              </svg>
            </div>
            <span className="text-xl font-bold">CloudStorage</span>
          </Link>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Commencez gratuitement
              </h2>
              <p className="text-white/80 text-lg">
                Rejoignez des milliers d'utilisateurs qui font confiance a CloudStorage
              </p>
            </div>

            <div className="space-y-4">
              {[
                "5 Go de stockage gratuit",
                "Chiffrement de bout en bout",
                "Synchronisation multi-appareils",
                "Partage securise de fichiers",
                "Support communautaire",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="h-4 w-4" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div>
              <p className="text-3xl font-bold">10k+</p>
              <p className="text-white/70 text-sm">Utilisateurs actifs</p>
            </div>
            <div>
              <p className="text-3xl font-bold">99.9%</p>
              <p className="text-white/70 text-sm">Disponibilite</p>
            </div>
            <div>
              <p className="text-3xl font-bold">50 To</p>
              <p className="text-white/70 text-sm">Donnees stockees</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 md:p-10 bg-background">
        <div className="absolute top-6 right-6 lg:hidden">
          <Logo size="sm" />
        </div>
        <div className="w-full max-w-sm">
          <SignupForm />
        </div>
      </div>
    </div>
  )
}
