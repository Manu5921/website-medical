import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schéma de validation pour les disponibilités
const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isActive: z.boolean()
})

const availabilitiesSchema = z.array(availabilitySchema)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('availabilities')
      .select('*')
      .eq('professional_id', id)
      .order('day_of_week')

    if (error) {
      throw error
    }

    return NextResponse.json({
      availabilities: data || []
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des disponibilités' },
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

    // Vérifier que l'utilisateur modifie bien ses propres disponibilités
    if (user.id !== id) {
      return NextResponse.json(
        { error: 'Non autorisé à modifier ces disponibilités' },
        { status: 403 }
      )
    }

    // Parser et valider les données
    const body = await request.json()
    const validatedData = availabilitiesSchema.parse(body.availabilities)

    // Vérifier les chevauchements et la cohérence des horaires
    for (const availability of validatedData) {
      if (availability.startTime >= availability.endTime) {
        return NextResponse.json(
          { error: `Horaires invalides pour le jour ${availability.dayOfWeek}` },
          { status: 400 }
        )
      }
    }

    // Transaction : supprimer les anciennes et insérer les nouvelles
    // D'abord supprimer toutes les disponibilités existantes
    const { error: deleteError } = await supabase
      .from('availabilities')
      .delete()
      .eq('professional_id', id)

    if (deleteError) {
      throw deleteError
    }

    // Puis insérer les nouvelles si il y en a
    if (validatedData.length > 0) {
      const { data, error: insertError } = await supabase
        .from('availabilities')
        .insert(
          validatedData.map(availability => ({
            professional_id: id,
            day_of_week: availability.dayOfWeek,
            start_time: availability.startTime,
            end_time: availability.endTime,
            is_active: availability.isActive
          }))
        )
        .select()

      if (insertError) {
        throw insertError
      }

      return NextResponse.json({
        availabilities: data,
        message: 'Disponibilités mises à jour avec succès'
      })
    }

    return NextResponse.json({
      availabilities: [],
      message: 'Disponibilités supprimées avec succès'
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
      { error: 'Erreur lors de la mise à jour des disponibilités' },
      { status: 500 }
    )
  }
}