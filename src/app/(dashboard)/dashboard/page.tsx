import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, TrendingUp } from 'lucide-react'
import { formatDate, formatTime, getAppointmentStatusLabel } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get professional profile
  const { data: professional } = await supabase
    .from('professionals')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get recent appointments
  const { data: recentAppointments } = await supabase
    .from('appointments')
    .select(`
      *,
      requester:professionals!appointments_requester_id_fkey(first_name, last_name, profession),
      provider:professionals!appointments_provider_id_fkey(first_name, last_name, profession)
    `)
    .or(`requester_id.eq.${user.id},provider_id.eq.${user.id}`)
    .order('appointment_date', { ascending: true })
    .limit(5)

  // Get stats
  const { count: pendingCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('provider_id', user.id)
    .eq('status', 'pending')

  const { count: confirmedCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .or(`requester_id.eq.${user.id},provider_id.eq.${user.id}`)
    .eq('status', 'confirmed')

  const { count: totalAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .or(`requester_id.eq.${user.id},provider_id.eq.${user.id}`)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bonjour, {professional?.first_name} !
        </h1>
        <p className="text-gray-600 mt-2">
          Voici un aperçu de votre activité
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Demandes en attente
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent votre attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              RDV confirmés
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              À venir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total RDV
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Depuis votre inscription
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Réseau
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">500+</div>
            <p className="text-xs text-muted-foreground">
              Professionnels connectés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Rendez-vous récents</CardTitle>
          <CardDescription>
            Vos derniers rendez-vous et demandes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentAppointments && recentAppointments.length > 0 ? (
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {appointment.patient_first_name} {appointment.patient_last_name}
                      </span>
                      <Badge variant={appointment.status === 'pending' ? 'secondary' : 'default'}>
                        {getAppointmentStatusLabel(appointment.status)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {appointment.requester_id === user.id ? (
                        <span>
                          Avec {appointment.provider?.first_name} {appointment.provider?.last_name}
                        </span>
                      ) : (
                        <span>
                          Demandé par {appointment.requester?.first_name} {appointment.requester?.last_name}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Motif: {appointment.reason}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatDate(appointment.appointment_date)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTime(appointment.appointment_time)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucun rendez-vous pour le moment
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}