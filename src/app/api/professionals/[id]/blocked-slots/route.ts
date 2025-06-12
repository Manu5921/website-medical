import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schéma de validation pour les créneaux bloqués
const blockedSlotSchema = z.object({
  startDatetime: z.string().datetime(),
  endDatetime: z.string().datetime(),
  reason: z.string().min(1).max(200)
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Paramètres optionnels pour filtrer par date
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    
    let query = supabase
      .from('blocked_slots')
      .select('*')
      .eq('professional_id', id)
      .order('start_datetime', { ascending: true })

    if (from) {
      query = query.gte('end_datetime', from)
    }
    
    if (to) {
      query = query.lte('start_datetime', to)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      blockedSlots: data || []
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des créneaux bloqués' },
      { status: 500 }
    )
  }
}

export async function POST(
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

    // Vérifier que l'utilisateur gère bien ses propres créneaux
    if (user.id !== id) {
      return NextResponse.json(
        { error: 'Non autorisé à gérer ces créneaux' },
        { status: 403 }
      )
    }

    // Parser et valider les données
    const body = await request.json()
    const validatedData = blockedSlotSchema.parse(body)

    // Vérifier la cohérence des dates
    if (validatedData.startDatetime >= validatedData.endDatetime) {
      return NextResponse.json(
        { error: 'La date de fin doit être après la date de début' },
        { status: 400 }
      )
    }

    // Vérifier que les dates sont dans le futur
    const now = new Date().toISOString()
    if (validatedData.startDatetime < now) {
      return NextResponse.json(
        { error: 'Impossible de bloquer un créneau dans le passé' },
        { status: 400 }
      )
    }

    // Vérifier les chevauchements avec d'autres créneaux bloqués
    const { data: existingSlots, error: checkError } = await supabase
      .from('blocked_slots')
      .select('*')
      .eq('professional_id', id)
      .or(`start_datetime.lte.${validatedData.endDatetime},end_datetime.gte.${validatedData.startDatetime}`)

    if (checkError) {
      throw checkError
    }

    if (existingSlots && existingSlots.length > 0) {
      // Vérifier s'il y a vraiment un chevauchement
      const hasOverlap = existingSlots.some(slot => 
        (validatedData.startDatetime < slot.end_datetime && 
         validatedData.endDatetime > slot.start_datetime)
      )
      
      if (hasOverlap) {
        return NextResponse.json(
          { error: 'Ce créneau chevauche avec un autre créneau déjà bloqué' },
          { status: 400 }
        )
      }
    }

    // Créer le créneau bloqué
    const { data, error } = await supabase
      .from('blocked_slots')
      .insert({
        professional_id: id,
        start_datetime: validatedData.startDatetime,
        end_datetime: validatedData.endDatetime,
        reason: validatedData.reason
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      blockedSlot: data,
      message: 'Créneau bloqué avec succès'
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
      { error: 'Erreur lors de la création du créneau bloqué' },
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
    const { searchParams } = new URL(request.url)
    const slotId = searchParams.get('slotId')
    
    if (!slotId) {
      return NextResponse.json(
        { error: 'ID du créneau manquant' },
        { status: 400 }
      )
    }

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur supprime bien son propre créneau
    if (user.id !== id) {
      return NextResponse.json(
        { error: 'Non autorisé à supprimer ce créneau' },
        { status: 403 }
      )
    }

    // Supprimer le créneau
    const { error } = await supabase
      .from('blocked_slots')
      .delete()
      .eq('id', slotId)
      .eq('professional_id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Créneau supprimé avec succès'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du créneau' },
      { status: 500 }
    )
  }
}