import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schéma de validation pour la mise à jour
const updateSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/).optional(),
  address: z.string().min(5).optional(),
  city: z.string().min(2).optional(),
  postalCode: z.string().regex(/^\d{5}$/).optional(),
  bio: z.string().max(500).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    
    // Récupérer le professionnel d'abord
    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', id)
      .single()

    if (professionalError) {
      console.error('Professional fetch error:', professionalError)
      if (professionalError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Professionnel non trouvé' },
          { status: 404 }
        )
      }
      throw professionalError
    }

    // Récupérer les disponibilités séparément
    const { data: availabilities, error: availabilitiesError } = await supabase
      .from('availabilities')
      .select('id, day_of_week, start_time, end_time, is_active')
      .eq('professional_id', id)

    if (availabilitiesError) {
      console.error('Availabilities fetch error:', availabilitiesError)
    }

    // Combiner les données
    const professionalWithAvailabilities = {
      ...professional,
      availabilities: availabilities || []
    }

    // Récupérer les prochains créneaux bloqués
    const today = new Date().toISOString()
    const { data: blockedSlots, error: blockedError } = await supabase
      .from('blocked_slots')
      .select('*')
      .eq('professional_id', id)
      .gte('end_datetime', today)
      .order('start_datetime', { ascending: true })

    if (blockedError) {
      console.error('Error fetching blocked slots:', blockedError)
    }

    // Récupérer les statistiques (nombre de RDV)
    const { count: appointmentCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', id)
      .eq('status', 'completed')

    return NextResponse.json({
      professional: {
        ...professionalWithAvailabilities,
        blockedSlots: blockedSlots || [],
        stats: {
          completedAppointments: appointmentCount || 0
        }
      }
    })
  } catch (error) {
    console.error('API error:', error)
    
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
    
    // Check if it's a Supabase error with specific code
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Supabase error code:', error.code)
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du professionnel' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    // Vérifier que l'utilisateur modifie bien son propre profil
    if (user.id !== id) {
      return NextResponse.json(
        { error: 'Non autorisé à modifier ce profil' },
        { status: 403 }
      )
    }

    // Parser et valider les données
    const body = await request.json()
    const validatedData = updateSchema.parse(body)

    // Mettre à jour le profil
    const { data, error } = await supabase
      .from('professionals')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      professional: data,
      message: 'Profil mis à jour avec succès'
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
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    // Vérifier que l'utilisateur supprime bien son propre profil
    if (user.id !== id) {
      return NextResponse.json(
        { error: 'Non autorisé à supprimer ce profil' },
        { status: 403 }
      )
    }

    // Supprimer le profil (et cascade vers les autres tables grâce aux FK)
    const { error } = await supabase
      .from('professionals')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    // Supprimer aussi le compte auth
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(id)
    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError)
    }

    return NextResponse.json({
      message: 'Profil supprimé avec succès'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du profil' },
      { status: 500 }
    )
  }
}