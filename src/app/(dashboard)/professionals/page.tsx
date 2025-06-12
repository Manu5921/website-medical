'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  MapPin, 
  Phone, 
  Calendar, 
  Users, 
  Filter,
  Grid3x3,
  List,
  Loader2
} from 'lucide-react'
import { filterMockProfessionals, professionLabels } from '@/lib/mockData'
import { Professional } from '@/types'

type ViewMode = 'list' | 'grid'

interface SearchFilters {
  profession: string
  city: string
  search: string
}

export default function ProfessionalsPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    profession: '',
    city: '',
    search: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasMore: false
  })

  const searchProfessionals = async (newFilters?: Partial<SearchFilters>, page = 1) => {
    setLoading(true)
    
    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const searchParams = {
      ...filters,
      ...newFilters,
      page,
      limit: pagination.limit
    }

    const result = filterMockProfessionals({
      profession: searchParams.profession || undefined,
      city: searchParams.city || undefined,
      search: searchParams.search || undefined,
      page: searchParams.page,
      limit: searchParams.limit
    })

    setProfessionals(result.professionals)
    setPagination(result.pagination)
    setLoading(false)
  }

  useEffect(() => {
    searchProfessionals()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  const handleSearch = () => {
    searchProfessionals(filters, 1)
  }

  const clearFilters = () => {
    const emptyFilters = { profession: '', city: '', search: '' }
    setFilters(emptyFilters)
    searchProfessionals(emptyFilters, 1)
  }

  const loadNextPage = () => {
    if (pagination.hasMore) {
      searchProfessionals(filters, pagination.page + 1)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const goToProfile = (professionalId: string) => {
    router.push(`/professionals/${professionalId}`)
  }

  const hasActiveFilters = filters.profession || filters.city || filters.search

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Annuaire des Professionnels</h1>
          <p className="text-muted-foreground">
            Trouvez et contactez des professionnels de santé près de chez vous
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filtres de recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres de recherche
          </CardTitle>
          <CardDescription>
            Affinez votre recherche selon vos critères
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Profession</label>
              <Select 
                value={filters.profession} 
                onValueChange={(value) => handleFilterChange('profession', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les professions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les professions</SelectItem>
                  {Object.entries(professionLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ville</label>
              <Input
                placeholder="Paris, Lyon, Marseille..."
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Recherche</label>
              <Input
                placeholder="Nom, spécialité..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
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
                  <Search className="mr-2 h-4 w-4" />
                  Rechercher
                </>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Effacer les filtres
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Résultats */}
      <div className="space-y-4">
        {/* Statistiques */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {pagination.total} professionnel{pagination.total > 1 ? 's' : ''}
            </span>
            {pagination.totalPages > 1 && (
              <span>
                Page {pagination.page} sur {pagination.totalPages}
              </span>
            )}
          </div>
        </div>

        {/* Liste/Grille des professionnels */}
        {loading && professionals.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : professionals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                Aucun professionnel trouvé avec ces critères
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {professionals.map((professional) => (
              <Card 
                key={professional.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => goToProfile(professional.id)}
              >
                <CardContent className="pt-6">
                  <div className={
                    viewMode === 'grid' 
                      ? 'space-y-4'
                      : 'flex gap-6'
                  }>
                    {/* Avatar */}
                    <div className={viewMode === 'grid' ? 'flex justify-center' : 'flex-shrink-0'}>
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={professional.avatar_url || ''} />
                        <AvatarFallback className="text-lg">
                          {getInitials(professional.first_name, professional.last_name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Informations */}
                    <div className={viewMode === 'grid' ? 'text-center space-y-3' : 'flex-1 space-y-3'}>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {professional.first_name} {professional.last_name}
                        </h3>
                        <Badge variant="secondary" className="mt-1">
                          {professionLabels[professional.profession] || professional.profession}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span>{professional.city} ({professional.postal_code})</span>
                        </div>
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span>{professional.phone}</span>
                        </div>
                      </div>

                      {professional.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {professional.bio}
                        </p>
                      )}

                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          goToProfile(professional.id)
                        }}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Voir le profil
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.hasMore && (
          <div className="flex justify-center pt-6">
            <Button 
              variant="outline" 
              onClick={loadNextPage}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Chargement...
                </>
              ) : (
                'Charger plus de résultats'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}