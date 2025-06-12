'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft,
  MapPin, 
  Phone, 
  Mail,
  Calendar, 
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { mockProfessionals, professionLabels } from '@/lib/mockData'
import { Professional } from '@/types'
import BookAppointmentDialog from '@/components/appointments/BookAppointmentDialog'

interface PageProps {
  params: Promise<{ id: string }>
}

// Données fictives pour les disponibilités
const mockAvailabilities = [
  { day: 'Lundi', hours: '09h00 - 18h00', available: true },
  { day: 'Mardi', hours: '09h00 - 18h00', available: true },
  { day: 'Mercredi', hours: '09h00 - 12h00', available: true },
  { day: 'Jeudi', hours: '09h00 - 18h00', available: true },
  { day: 'Vendredi', hours: '09h00 - 17h00', available: true },
  { day: 'Samedi', hours: 'Fermé', available: false },
  { day: 'Dimanche', hours: 'Fermé', available: false },
]

export default function ProfessionalDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfessional = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Récupérer l'ID depuis les params
        const { id } = await params
        
        // Simuler un délai d'API
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Chercher dans les données fictives
        const found = mockProfessionals.find(p => p.id === id)
        
        if (!found) {
          setError('Professionnel non trouvé')
          return
        }
        
        setProfessional(found)
      } catch {
        setError('Erreur lors du chargement du professionnel')
      } finally {
        setLoading(false)
      }
    }

    loadProfessional()
  }, [params])

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }


  const handleSendMessage = () => {
    // TODO: Rediriger vers la messagerie
    alert('Fonctionnalité de messagerie à venir !')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !professional) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Professionnel non trouvé'}
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Bouton retour */}
      <Button 
        variant="outline" 
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à l&apos;annuaire
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profil principal */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex justify-center md:justify-start">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={professional.avatar_url || ''} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(professional.first_name, professional.last_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold">
                      {professional.first_name} {professional.last_name}
                    </h1>
                    <Badge variant="secondary" className="mt-2 text-base px-3 py-1">
                      {professionLabels[professional.profession] || professional.profession}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{professional.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{professional.city} {professional.postal_code}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{professional.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{professional.email}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <BookAppointmentDialog professional={professional}>
                      <Button className="flex-1">
                        <Calendar className="mr-2 h-4 w-4" />
                        Prendre RDV
                      </Button>
                    </BookAppointmentDialog>
                    <Button variant="outline" onClick={handleSendMessage} className="flex-1">
                      <Mail className="mr-2 h-4 w-4" />
                      Envoyer un message
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Présentation */}
          {professional.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Présentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {professional.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Informations professionnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations professionnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Numéro RPPS
                  </label>
                  <p className="font-mono">{professional.rpps_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Profession
                  </label>
                  <p>{professionLabels[professional.profession] || professional.profession}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Inscrit depuis
                  </label>
                  <p>{new Date(professional.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Dernière connexion
                  </label>
                  <p>{new Date(professional.updated_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Disponibilités */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horaires
              </CardTitle>
              <CardDescription>
                Disponibilités habituelles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAvailabilities.map((availability, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {availability.day}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {availability.hours}
                    </span>
                    {availability.available ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => window.open(`tel:${professional.phone}`, '_self')}
              >
                <Phone className="mr-2 h-4 w-4" />
                Appeler maintenant
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => window.open(`mailto:${professional.email}`, '_self')}
              >
                <Mail className="mr-2 h-4 w-4" />
                Envoyer un email
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => alert('Fonctionnalité de géolocalisation à venir !')}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Voir sur la carte
              </Button>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle>En un coup d&apos;œil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Rendez-vous réalisés</span>
                <Badge variant="outline">0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Note moyenne</span>
                <Badge variant="outline">-</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Temps de réponse</span>
                <Badge variant="outline">-</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}