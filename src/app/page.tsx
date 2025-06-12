import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, Shield, Clock } from 'lucide-react'

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
              Plateforme sécurisée pour la prise de rendez-vous entre professionnels. 
              Optimisez le parcours de soins de vos patients en quelques clics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">Commencer gratuitement</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/professionals">Voir les professionnels</Link>
              </Button>
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
            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Prise de RDV simple</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Réservez directement dans les créneaux disponibles de vos confrères.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Réseau professionnel</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Accédez à un annuaire vérifié de professionnels de santé qualifiés.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Sécurisé & conforme</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Données protégées selon les normes RGPD et validation RPPS obligatoire.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Gain de temps</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Fini les appels téléphoniques, gérez tout depuis votre tableau de bord.
                </CardDescription>
              </CardContent>
            </Card>
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
