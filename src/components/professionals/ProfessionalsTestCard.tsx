'use client'

import { useState } from 'react'
import { useProfessionals } from '@/hooks/useProfessionals'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Search, MapPin } from 'lucide-react'

export function ProfessionalsTestCard() {
  const [filters, setFilters] = useState({
    profession: '',
    city: '',
    search: ''
  })
  
  const { professionals, loading, error, pagination, search } = useProfessionals()

  const handleSearch = () => {
    const searchParams = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== '')
    )
    search(searchParams)
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Test de l&apos;API des Professionnels</CardTitle>
        <CardDescription>
          Interface de test pour tester les fonctionnalités de recherche
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtres de recherche */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Profession</label>
            <Select 
              value={filters.profession} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, profession: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les professions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes</SelectItem>
                <SelectItem value="medecin">Médecin</SelectItem>
                <SelectItem value="infirmier">Infirmier(ère)</SelectItem>
                <SelectItem value="kinesitherapeute">Kinésithérapeute</SelectItem>
                <SelectItem value="pharmacien">Pharmacien(ne)</SelectItem>
                <SelectItem value="dentiste">Dentiste</SelectItem>
                <SelectItem value="sage_femme">Sage-femme</SelectItem>
                <SelectItem value="psychologue">Psychologue</SelectItem>
                <SelectItem value="orthophoniste">Orthophoniste</SelectItem>
                <SelectItem value="ergotherapeute">Ergothérapeute</SelectItem>
                <SelectItem value="podologue">Podologue</SelectItem>
                <SelectItem value="dieteticien">Diététicien(ne)</SelectItem>
                <SelectItem value="osteopathe">Ostéopathe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ville</label>
            <Input
              placeholder="Paris, Lyon..."
              value={filters.city}
              onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Recherche</label>
            <Input
              placeholder="Nom, prénom..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
        </div>

        <Button onClick={handleSearch} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Recherche en cours...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Rechercher
            </>
          )}
        </Button>

        {/* Résultats */}
        {error && (
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && professionals.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucun professionnel trouvé</p>
          </div>
        )}

        {professionals.length > 0 && (
          <>
            <div className="grid gap-4">
              {professionals.map((professional) => (
                <Card key={professional.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">
                          {professional.first_name} {professional.last_name}
                        </h3>
                        <p className="text-primary font-medium capitalize">
                          {professional.profession.replace('_', ' ')}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-1" />
                          {professional.city} ({professional.postal_code})
                        </div>
                        {professional.bio && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {professional.bio}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>RPPS: {professional.rpps_number}</p>
                        <p>{professional.phone}</p>
                        {'distance' in professional && professional.distance && (
                          <p className="text-primary font-medium">
                            {professional.distance.toFixed(1)} km
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && (
              <div className="flex justify-between items-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} sur {pagination.totalPages} 
                  ({pagination.total} résultats)
                </p>
                {pagination.hasMore && (
                  <Button 
                    variant="outline" 
                    onClick={() => search({ ...filters, page: pagination.page + 1 })}
                    disabled={loading}
                  >
                    Page suivante
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}