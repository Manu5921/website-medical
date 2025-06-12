import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schéma de validation pour les filtres
const searchSchema = z.object({
  profession: z.enum(['medecin', 'infirmier', 'kinesitherapeute', 'pharmacien', 'dentiste', 'sage_femme', 'psychologue', 'orthophoniste', 'ergotherapeute', 'podologue', 'dieteticien', 'osteopathe']).optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  search: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  radius: z.coerce.number().min(1).max(100).optional(), // en km
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
})

// Fonction pour calculer la distance entre deux points GPS (formule de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Parser et valider les paramètres
    const params = searchSchema.parse({
      profession: searchParams.get('profession') || undefined,
      city: searchParams.get('city') || undefined,
      postalCode: searchParams.get('postalCode') || undefined,
      search: searchParams.get('search') || undefined,
      latitude: searchParams.get('latitude') || undefined,
      longitude: searchParams.get('longitude') || undefined,
      radius: searchParams.get('radius') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    })

    // Construire la requête de base
    let query = supabase
      .from('professionals')
      .select('*', { count: 'exact' })

    // Appliquer les filtres
    if (params.profession) {
      query = query.eq('profession', params.profession)
    }

    if (params.city) {
      query = query.ilike('city', `%${params.city}%`)
    }

    if (params.postalCode) {
      query = query.eq('postal_code', params.postalCode)
    }

    if (params.search) {
      query = query.or(`first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,bio.ilike.%${params.search}%`)
    }

    // Pagination
    const from = (params.page - 1) * params.limit
    const to = from + params.limit - 1
    query = query.range(from, to)

    // Exécuter la requête
    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des professionnels' },
        { status: 500 }
      )
    }

    // Filtrer par distance si latitude/longitude fournis
    let filteredData = data || []
    if (params.latitude && params.longitude && params.radius) {
      filteredData = data?.filter(professional => {
        if (professional.latitude && professional.longitude) {
          const distance = calculateDistance(
            params.latitude!,
            params.longitude!,
            professional.latitude,
            professional.longitude
          )
          return distance <= params.radius!
        }
        return false
      }) || []
    }

    // Ajouter la distance si coordonnées fournies
    if (params.latitude && params.longitude) {
      filteredData = filteredData.map(professional => ({
        ...professional,
        distance: professional.latitude && professional.longitude
          ? calculateDistance(
              params.latitude!,
              params.longitude!,
              professional.latitude,
              professional.longitude
            )
          : null
      }))
      // Trier par distance
      filteredData.sort((a, b) => (a.distance || 999) - (b.distance || 999))
    }

    // Calculer la pagination après filtrage par distance
    const totalCount = params.latitude && params.longitude && params.radius 
      ? filteredData.length 
      : count || 0
    
    const totalPages = Math.ceil(totalCount / params.limit)
    const paginatedData = params.latitude && params.longitude && params.radius
      ? filteredData.slice(from, to + 1)
      : filteredData

    return NextResponse.json({
      professionals: paginatedData,
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