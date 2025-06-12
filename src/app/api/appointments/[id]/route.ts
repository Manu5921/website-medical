import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schéma de validation pour la mise à jour
const updateAppointmentSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide (YYYY-MM-DD)').optional(),
  appointment_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Heure invalide (HH:MM)').optional(),
  duration: z.number().min(15).max(480).optional(),
  notes: z.string().max(500).optional(),
  reason: z.string().min(5, 'Motif du rendez-vous requis').optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer le rendez-vous avec les informations des professionnels
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        requester:professionals!requester_id (
          id,
          first_name,
          last_name,
          profession,
          phone,
          email,
          avatar_url
        ),
        provider:professionals!provider_id (
          id,
          first_name,
          last_name,
          profession,
          phone,
          email,
          address,
          city,
          avatar_url
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Rendez-vous non trouvé' },
          { status: 404 }
        )
      }
      throw error
    }

    // Vérifier que l'utilisateur a accès à ce RDV
    if (appointment.requester_id !== user.id && appointment.provider_id !== user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      appointment
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du rendez-vous' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer le rendez-vous actuel
    const { data: currentAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Rendez-vous non trouvé' },
          { status: 404 }
        )
      }
      throw fetchError
    }

    // Vérifier que l'utilisateur a le droit de modifier ce RDV
    if (currentAppointment.requester_id !== user.id && currentAppointment.provider_id !== user.id) {
      return NextResponse.json(
        { error: 'Non autorisé à modifier ce rendez-vous' },
        { status: 403 }
      )
    }

    // Parser et valider les données
    const body = await request.json()
    const validatedData = updateAppointmentSchema.parse(body)

    // Règles métier pour les modifications
    const isProvider = currentAppointment.provider_id === user.id

    // Vérifier les autorisations selon le rôle
    if (validatedData.status) {
      // Seul le provider peut confirmer un RDV
      if (validatedData.status === 'confirmed' && !isProvider) {
        return NextResponse.json(
          { error: 'Seul le professionnel peut confirmer un rendez-vous' },
          { status: 403 }
        )
      }
      
      // Le requester peut annuler, le provider peut confirmer/annuler/compléter
      if (validatedData.status === 'cancelled') {
        // Les deux peuvent annuler
      } else if (validatedData.status === 'completed' && !isProvider) {
        return NextResponse.json(
          { error: 'Seul le professionnel peut marquer un rendez-vous comme terminé' },
          { status: 403 }
        )
      }
    }

    // Si on modifie la date/heure, vérifier la disponibilité (seulement si status pending)
    if ((validatedData.appointment_date || validatedData.appointment_time) && 
        currentAppointment.status === 'pending') {
      
      const newDate = validatedData.appointment_date || currentAppointment.appointment_date
      const newTime = validatedData.appointment_time || currentAppointment.appointment_time
      const newDuration = validatedData.duration || currentAppointment.duration
      
      // Vérifier que la nouvelle date n'est pas dans le passé
      const appointmentDateTime = new Date(`${newDate}T${newTime}`)
      const now = new Date()
      
      if (appointmentDateTime <= now) {
        return NextResponse.json(
          { error: 'Impossible de programmer un rendez-vous dans le passé' },
          { status: 400 }
        )
      }

      // Vérifier les disponibilités (même logique que pour la création)
      const appointmentDate = new Date(newDate)
      const dayOfWeek = appointmentDate.getDay()
      
      const { data: availability } = await supabase
        .from('availabilities')
        .select('*')
        .eq('professional_id', currentAppointment.provider_id)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .gte('end_time', newTime)
        .lte('start_time', newTime)
        .maybeSingle()

      if (!availability) {
        return NextResponse.json(
          { error: 'Le professionnel n\'est pas disponible à cette nouvelle heure' },
          { status: 400 }
        )
      }

      // Vérifier les conflits avec d'autres RDV (exclure le RDV actuel)
      const { data: conflictingAppointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('provider_id', currentAppointment.provider_id)
        .eq('appointment_date', newDate)
        .in('status', ['pending', 'confirmed'])
        .neq('id', id)

      if (conflictingAppointments && conflictingAppointments.length > 0) {
        const newStart = appointmentDateTime
        const newEnd = new Date(newStart.getTime() + newDuration * 60000)
        
        const hasTimeConflict = conflictingAppointments.some(apt => {
          const existingStart = new Date(`${apt.appointment_date}T${apt.appointment_time}`)
          const existingEnd = new Date(existingStart.getTime() + apt.duration * 60000)
          
          return (newStart < existingEnd && newEnd > existingStart)
        })

        if (hasTimeConflict) {
          return NextResponse.json(
            { error: 'Le professionnel a déjà un rendez-vous à cette heure' },
            { status: 400 }
          )
        }
      }
    }

    // Mettre à jour le rendez-vous
    const { data: appointment, error: updateError } = await supabase
      .from('appointments')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        requester:professionals!requester_id (
          id,
          first_name,
          last_name,
          profession,
          phone,
          email
        ),
        provider:professionals!provider_id (
          id,
          first_name,
          last_name,
          profession,
          phone,
          email,
          address,
          city
        )
      `)
      .single()

    if (updateError) {
      throw updateError
    }

    // TODO: Envoyer une notification email selon le changement

    return NextResponse.json({
      appointment,
      message: 'Rendez-vous mis à jour avec succès'
    })
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du rendez-vous' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer le rendez-vous pour vérifier les droits
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Rendez-vous non trouvé' },
          { status: 404 }
        )
      }
      throw fetchError
    }

    // Vérifier que l'utilisateur a le droit de supprimer ce RDV
    if (appointment.requester_id !== user.id && appointment.provider_id !== user.id) {
      return NextResponse.json(
        { error: 'Non autorisé à supprimer ce rendez-vous' },
        { status: 403 }
      )
    }

    // On ne peut supprimer que les RDV en attente ou annulés
    if (!['pending', 'cancelled'].includes(appointment.status)) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un rendez-vous confirmé ou terminé' },
        { status: 400 }
      )
    }

    // Supprimer le rendez-vous
    const { error: deleteError } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({
      message: 'Rendez-vous supprimé avec succès'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du rendez-vous' },
      { status: 500 }
    )
  }
}