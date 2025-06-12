'use client'

import { useState } from 'react'
import { useAppointments, AppointmentStatus } from '@/hooks/useAppointments'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  Clock, 
  Phone, 
  User, 
  Filter,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  MapPin
} from 'lucide-react'
import { professionLabels } from '@/lib/mockData'

interface SearchFilters {
  status: AppointmentStatus | ''
  date_from: string
  date_to: string
  type: 'all' | 'sent' | 'received'
}

export default function AppointmentsPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    status: '',
    date_from: '',
    date_to: '',
    type: 'all'
  })

  const { appointments, loading, error, pagination, search, updateAppointment } = useAppointments()

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  const handleSearch = () => {
    const searchParams: Parameters<typeof search>[0] = {}
    
    if (filters.status) searchParams.status = filters.status
    if (filters.date_from) searchParams.date_from = filters.date_from
    if (filters.date_to) searchParams.date_to = filters.date_to
    
    // TODO: Filtrer par type (envoyés/reçus) côté client pour le moment
    search(searchParams)
  }

  const clearFilters = () => {
    const emptyFilters: SearchFilters = { status: '', date_from: '', date_to: '', type: 'all' }
    setFilters(emptyFilters)
    search({})
  }

  const getStatusBadge = (status: AppointmentStatus) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'outline' as const, icon: AlertCircle },
      confirmed: { label: 'Confirmé', variant: 'default' as const, icon: CheckCircle },
      cancelled: { label: 'Annulé', variant: 'destructive' as const, icon: XCircle },
      completed: { label: 'Terminé', variant: 'secondary' as const, icon: CheckCircle }
    }
    
    const config = statusConfig[status]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5) // HH:MM
  }

  const handleStatusUpdate = async (appointmentId: string, newStatus: AppointmentStatus) => {
    await updateAppointment(appointmentId, { status: newStatus })
  }

  // Filtrer côté client par type
  const filteredAppointments = appointments.filter(apt => {
    if (filters.type === 'sent') return apt.requester?.id // TODO: Comparer avec l'ID utilisateur actuel
    if (filters.type === 'received') return apt.provider?.id // TODO: Comparer avec l'ID utilisateur actuel
    return true
  })

  const hasActiveFilters = filters.status || filters.date_from || filters.date_to || filters.type !== 'all'

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mes Rendez-vous</h1>
          <p className="text-muted-foreground">
            Gérez vos demandes de rendez-vous et consultations
          </p>
        </div>
        
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau RDV
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
          <CardDescription>
            Filtrez vos rendez-vous selon vos critères
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select 
                value={filters.type} 
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="sent">Mes demandes</SelectItem>
                  <SelectItem value="received">Demandes reçues</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="confirmed">Confirmé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Du</label>
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Au</label>
              <Input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleSearch} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recherche...
                </>
              ) : (
                <>
                  <Filter className="mr-2 h-4 w-4" />
                  Appliquer les filtres
                </>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message d'erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Liste des rendez-vous */}
      <div className="space-y-4">
        {loading && filteredAppointments.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun rendez-vous trouvé</h3>
              <p className="text-muted-foreground">
                {hasActiveFilters 
                  ? "Aucun rendez-vous ne correspond à vos critères"
                  : "Vous n'avez pas encore de rendez-vous"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Informations patient */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {appointment.patient_first_name} {appointment.patient_last_name}
                          </h3>
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {appointment.patient_phone}
                          </p>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{formatDate(appointment.appointment_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{formatTime(appointment.appointment_time)} ({appointment.duration} min)</span>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Motif :</p>
                        <p className="text-sm">{appointment.reason}</p>
                        {appointment.notes && (
                          <>
                            <p className="text-sm font-medium text-muted-foreground mb-1 mt-2">Notes :</p>
                            <p className="text-sm">{appointment.notes}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Informations professionnel */}
                    <div className="lg:w-80 space-y-4">
                      {appointment.provider && (
                        <div className="border rounded-lg p-4">
                          <p className="text-sm font-medium text-muted-foreground mb-3">Professionnel :</p>
                          <div className="flex items-start gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={appointment.provider.avatar_url || ''} />
                              <AvatarFallback>
                                {getInitials(appointment.provider.first_name, appointment.provider.last_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">
                                {appointment.provider.first_name} {appointment.provider.last_name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {professionLabels[appointment.provider.profession] || appointment.provider.profession}
                              </p>
                              {appointment.provider.address && (
                                <p className="text-sm text-muted-foreground flex items-start gap-1 mt-1">
                                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  <span className="truncate">{appointment.provider.city}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="space-y-2">
                        {appointment.status === 'pending' && (
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Confirmer
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Annuler
                            </Button>
                          </div>
                        )}
                        
                        {appointment.status === 'confirmed' && (
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              size="sm"
                              onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Terminer
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Annuler
                            </Button>
                          </div>
                        )}

                        {appointment.provider && (
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(`tel:${appointment.provider!.phone}`, '_self')}
                            >
                              <Phone className="w-4 h-4 mr-1" />
                              Appeler
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(`mailto:${appointment.provider!.email}`, '_self')}
                            >
                              <User className="w-4 h-4 mr-1" />
                              Email
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {pagination && pagination.hasMore && (
              <div className="flex justify-center pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const searchParams: Parameters<typeof search>[0] = {}
                    if (filters.status) searchParams.status = filters.status
                    if (filters.date_from) searchParams.date_from = filters.date_from
                    if (filters.date_to) searchParams.date_to = filters.date_to
                    search(searchParams, pagination.page + 1)
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    'Charger plus de rendez-vous'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}