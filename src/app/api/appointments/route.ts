import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schéma de validation pour les filtres de recherche
const searchSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  requester_id: z.string().uuid().optional(),
  provider_id: z.string().uuid().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
})

// Schéma de validation pour la création d'un RDV
const createAppointmentSchema = z.object({
  provider_id: z.string().uuid('ID du professionnel requis'),
  patient_first_name: z.string().min(2, 'Prénom du patient requis'),
  patient_last_name: z.string().min(2, 'Nom du patient requis'),
  patient_phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),
  reason: z.string().min(5, 'Motif du rendez-vous requis'),
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide (YYYY-MM-DD)'),
  appointment_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Heure invalide (HH:MM)'),
  duration: z.number().min(15).max(480).default(30), // Entre 15 min et 8h
  notes: z.string().max(500).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Parser et valider les paramètres
    const params = searchSchema.parse({
      status: searchParams.get('status') || undefined,
      requester_id: searchParams.get('requester_id') || undefined,
      provider_id: searchParams.get('provider_id') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    })

    // Construire la requête de base avec jointures
    let query = supabase
      .from('appointments')
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
      `, { count: 'exact' })

    // Filtrer par utilisateur connecté (ses demandes OU les demandes qu'il reçoit)
    query = query.or(`requester_id.eq.${user.id},provider_id.eq.${user.id}`)

    // Appliquer les filtres
    if (params.status) {
      query = query.eq('status', params.status)
    }

    if (params.requester_id) {
      query = query.eq('requester_id', params.requester_id)
    }

    if (params.provider_id) {
      query = query.eq('provider_id', params.provider_id)
    }

    if (params.date_from) {
      query = query.gte('appointment_date', params.date_from)
    }

    if (params.date_to) {
      query = query.lte('appointment_date', params.date_to)
    }

    // Trier par date et heure
    query = query.order('appointment_date', { ascending: true })
    query = query.order('appointment_time', { ascending: true })

    // Pagination
    const from = (params.page - 1) * params.limit
    const to = from + params.limit - 1
    query = query.range(from, to)

    // Exécuter la requête
    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des rendez-vous' },
        { status: 500 }
      )
    }

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / params.limit)

    return NextResponse.json({
      appointments: data || [],
      pagination: {
        page: params.page,
        limit: params.limit,
        total: totalCount,
        totalPages,
        hasMore: params.page < totalPages
      }
    })
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Paramètres invalides', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Parser et valider les données
    const body = await request.json()
    const validatedData = createAppointmentSchema.parse(body)

    // Vérifier que l'utilisateur ne prend pas RDV avec lui-même
    if (validatedData.provider_id === user.id) {
      return NextResponse.json(
        { error: 'Impossible de prendre rendez-vous avec vous-même' },
        { status: 400 }
      )
    }

    // Vérifier que le professionnel existe
    const { data: provider, error: providerError } = await supabase
      .from('professionals')
      .select('id, first_name, last_name, profession')
      .eq('id', validatedData.provider_id)
      .single()

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Professionnel non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que la date n'est pas dans le passé
    const appointmentDateTime = new Date(`${validatedData.appointment_date}T${validatedData.appointment_time}`)
    const now = new Date()
    
    if (appointmentDateTime <= now) {
      return NextResponse.json(
        { error: 'Impossible de prendre un rendez-vous dans le passé' },
        { status: 400 }
      )
    }

    // Vérifier les disponibilités du professionnel
    const appointmentDate = new Date(validatedData.appointment_date)
    const dayOfWeek = appointmentDate.getDay() // 0 = dimanche, 1 = lundi, etc.
    
    const { data: availability, error: availabilityError } = await supabase
      .from('availabilities')
      .select('*')
      .eq('professional_id', validatedData.provider_id)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .gte('end_time', validatedData.appointment_time)
      .lte('start_time', validatedData.appointment_time)
      .maybeSingle()

    if (availabilityError) {
      console.error('Availability check error:', availabilityError)
    }

    if (!availability) {
      return NextResponse.json(
        { error: 'Le professionnel n\'est pas disponible à cette heure' },
        { status: 400 }
      )
    }

    // Vérifier les créneaux bloqués
    const startDateTime = appointmentDateTime.toISOString()
    const endDateTime = new Date(appointmentDateTime.getTime() + validatedData.duration * 60000).toISOString()

    const { data: blockedSlots, error: blockedError } = await supabase
      .from('blocked_slots')
      .select('*')
      .eq('professional_id', validatedData.provider_id)
      .or(`start_datetime.lte.${endDateTime},end_datetime.gte.${startDateTime}`)

    if (blockedError) {
      console.error('Blocked slots check error:', blockedError)
    }

    if (blockedSlots && blockedSlots.length > 0) {
      // Vérifier s'il y a vraiment un chevauchement
      const hasConflict = blockedSlots.some(slot => 
        (startDateTime < slot.end_datetime && endDateTime > slot.start_datetime)
      )
      
      if (hasConflict) {
        return NextResponse.json(
          { error: 'Ce créneau est indisponible' },
          { status: 400 }
        )
      }
    }

    // Vérifier les conflits avec d'autres RDV
    const { data: existingAppointments, error: conflictError } = await supabase
      .from('appointments')
      .select('*')
      .eq('provider_id', validatedData.provider_id)
      .eq('appointment_date', validatedData.appointment_date)
      .in('status', ['pending', 'confirmed'])

    if (conflictError) {
      console.error('Conflict check error:', conflictError)
    }

    if (existingAppointments && existingAppointments.length > 0) {
      const hasTimeConflict = existingAppointments.some(apt => {
        const existingStart = new Date(`${apt.appointment_date}T${apt.appointment_time}`)
        const existingEnd = new Date(existingStart.getTime() + apt.duration * 60000)
        const newEnd = new Date(appointmentDateTime.getTime() + validatedData.duration * 60000)
        
        return (appointmentDateTime < existingEnd && newEnd > existingStart)
      })

      if (hasTimeConflict) {
        return NextResponse.json(
          { error: 'Le professionnel a déjà un rendez-vous à cette heure' },
          { status: 400 }
        )
      }
    }

    // Créer le rendez-vous
    const { data: appointment, error: createError } = await supabase
      .from('appointments')
      .insert({
        requester_id: user.id,
        provider_id: validatedData.provider_id,
        patient_first_name: validatedData.patient_first_name,
        patient_last_name: validatedData.patient_last_name,
        patient_phone: validatedData.patient_phone,
        reason: validatedData.reason,
        appointment_date: validatedData.appointment_date,
        appointment_time: validatedData.appointment_time,
        duration: validatedData.duration,
        notes: validatedData.notes || null,
        status: 'pending'
      })
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

    if (createError) {
      console.error('Create appointment error:', createError)
      return NextResponse.json(
        { error: 'Erreur lors de la création du rendez-vous' },
        { status: 500 }
      )
    }

    // TODO: Envoyer une notification email au professionnel

    return NextResponse.json({
      appointment,
      message: 'Rendez-vous créé avec succès'
    }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}