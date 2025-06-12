import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, MapPin, Navigation, Search } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">HC</span>
              </div>
              <span className="font-bold text-xl text-gray-900">HealthConnect Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Connexion</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Créer un compte</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Simplifiez la coordination
              <span className="text-blue-600 block">entre professionnels de santé</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Trouvez et contactez des professionnels de santé près de chez vous. 
              Géolocalisation intelligente, carte interactive et prise de RDV simplifiée.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">Commencer gratuitement</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/professionals">
                  <MapPin className="mr-2 h-5 w-5" />
                  Explorer la carte
                </Link>
              </Button>
            </div>
            
            {/* Indication de redirection pour la carte */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  💡 <strong>Astuce :</strong> Après inscription, cliquez sur l'icône "carte" dans l'annuaire pour voir tous les professionnels géolocalisés
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi choisir HealthConnect Pro ?
            </h2>
            <p className="text-lg text-gray-600">
              Une solution pensée par et pour les professionnels de santé
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="relative overflow-hidden">
              <CardHeader>
                <MapPin className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Carte interactive</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Visualisez tous les professionnels sur une carte avec géolocalisation en temps réel.
                </CardDescription>
              </CardContent>
              <div className="absolute top-2 right-2">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Google Maps</span>
              </div>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader>
                <Search className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Recherche par distance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Trouvez les professionnels les plus proches de vous avec des filtres de distance intelligents.
                </CardDescription>
              </CardContent>
              <div className="absolute top-2 right-2">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">GPS</span>
              </div>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader>
                <Navigation className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Itinéraires intégrés</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Obtenez des directions vers les cabinets avec Google Maps, Apple Plans ou Waze.
                </CardDescription>
              </CardContent>
              <div className="absolute top-2 right-2">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Multi-apps</span>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Prise de RDV simple</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Réservez directement dans les créneaux disponibles avec validation automatique.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Google Maps Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🗺️ Fonctionnalités Google Maps intégrées
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Découvrez comment accéder aux fonctionnalités de géolocalisation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
                  <CardTitle>Inscription avec géocodage</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Lors de votre inscription, utilisez l'autocomplétion d'adresse intelligente qui géocode automatiquement votre cabinet.
                </CardDescription>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/register">
                    Tester l'inscription
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
                  <CardTitle>Carte interactive</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Dans l'annuaire, cliquez sur l'icône "carte" (3ème bouton) pour voir tous les professionnels géolocalisés.
                </CardDescription>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/professionals">
                    Voir l'annuaire
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span>
                  <CardTitle>Filtres par distance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Activez votre géolocalisation puis filtrez les professionnels par distance (5km à 100km).
                </CardDescription>
                <div className="text-xs text-gray-500 mt-2">
                  💡 Bouton "Activer position" dans les filtres
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg p-6 shadow-md max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
                <Navigation className="h-5 w-5 text-blue-600" />
                Bonus : Itinéraires intégrés
              </h3>
              <p className="text-gray-600 mb-4">
                Sur chaque professionnel, cliquez sur "Itinéraire" pour ouvrir :
              </p>
              <div className="flex justify-center gap-4 text-sm">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">🗺️ Google Maps</span>
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded">📍 Apple Plans</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">🚗 Waze</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à rejoindre le réseau ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Plus de 500 professionnels nous font déjà confiance
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">Créer mon compte professionnel</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">HC</span>
              </div>
              <span className="font-bold text-xl">HealthConnect Pro</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 HealthConnect Pro. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
