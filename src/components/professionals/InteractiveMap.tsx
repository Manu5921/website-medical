'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation } from 'lucide-react'
import { loadGoogleMaps } from '@/lib/googleMaps'
import { Professional } from '@/types'
import { professionLabels } from '@/lib/mockData'

interface InteractiveMapProps {
  professionals: Professional[]
  selectedProfessional?: Professional | null
  onProfessionalSelect?: (professional: Professional) => void
  center?: { lat: number; lng: number }
  zoom?: number
  className?: string
}

export default function InteractiveMap({
  professionals,
  selectedProfessional,
  onProfessionalSelect,
  center = { lat: 46.603354, lng: 1.888334 }, // Centre de la France
  zoom = 6,
  className
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  // Initialiser la carte
  useEffect(() => {
    const initMap = async () => {
      try {
        if (!mapRef.current) return

        const maps = await loadGoogleMaps()
        
        const map = new maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        })

        mapInstanceRef.current = map
        infoWindowRef.current = new maps.InfoWindow()
        setIsMapLoaded(true)
      } catch (error) {
        console.error('Erreur lors du chargement de la carte:', error)
        setMapError('Impossible de charger la carte. Vérifiez votre connexion.')
      }
    }

    initMap()
  }, [center, zoom])

  // Créer les marqueurs pour les professionnels
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !window.google) return

    // Supprimer les anciens marqueurs
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    const bounds = new google.maps.LatLngBounds()
    let hasValidCoordinates = false

    // Créer un marqueur pour chaque professionnel
    professionals.forEach(professional => {
      if (!professional.latitude || !professional.longitude) return

      const position = {
        lat: professional.latitude,
        lng: professional.longitude
      }

      const marker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: `${professional.first_name} ${professional.last_name}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
              <circle cx="12" cy="9" r="2.5" fill="#ffffff"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 32)
        }
      })

      // Contenu de l'infobulle
      const infoContent = `
        <div class="p-3 max-w-xs">
          <div class="flex items-start gap-3">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900">${professional.first_name} ${professional.last_name}</h3>
              <p class="text-sm text-gray-600">${professionLabels[professional.profession] || professional.profession}</p>
              <p class="text-xs text-gray-500 mt-1">${professional.city || ''}</p>
              ${professional.phone ? `<p class="text-xs text-gray-500">${professional.phone}</p>` : ''}
            </div>
          </div>
          <div class="mt-3 flex gap-2">
            <button 
              onclick="window.dispatchEvent(new CustomEvent('selectProfessional', { detail: '${professional.id}' }))"
              class="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
            >
              Voir le profil
            </button>
            ${professional.phone ? `
              <button 
                onclick="window.open('tel:${professional.phone}', '_self')"
                class="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors"
              >
                Appeler
              </button>
            ` : ''}
          </div>
        </div>
      `

      // Événement clic sur le marqueur
      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(infoContent)
          infoWindowRef.current.open(mapInstanceRef.current, marker)
        }
      })

      markersRef.current.push(marker)
      bounds.extend(position)
      hasValidCoordinates = true
    })

    // Ajuster la vue pour afficher tous les marqueurs
    if (hasValidCoordinates && markersRef.current.length > 1) {
      mapInstanceRef.current.fitBounds(bounds)
    } else if (hasValidCoordinates && markersRef.current.length === 1) {
      mapInstanceRef.current.setCenter(markersRef.current[0].getPosition()!)
      mapInstanceRef.current.setZoom(14)
    }

  }, [professionals, isMapLoaded])

  // Gérer la sélection depuis les infobulles
  useEffect(() => {
    const handleSelectProfessional = (event: CustomEvent) => {
      const professionalId = event.detail
      const professional = professionals.find(p => p.id === professionalId)
      if (professional && onProfessionalSelect) {
        onProfessionalSelect(professional)
      }
    }

    window.addEventListener('selectProfessional', handleSelectProfessional as EventListener)
    return () => {
      window.removeEventListener('selectProfessional', handleSelectProfessional as EventListener)
    }
  }, [professionals, onProfessionalSelect])

  // Centrer sur le professionnel sélectionné
  useEffect(() => {
    if (!selectedProfessional || !mapInstanceRef.current) return

    if (selectedProfessional.latitude && selectedProfessional.longitude) {
      const position = {
        lat: selectedProfessional.latitude,
        lng: selectedProfessional.longitude
      }
      
      mapInstanceRef.current.setCenter(position)
      mapInstanceRef.current.setZoom(15)

      // Trouver et ouvrir l'infobulle du marqueur sélectionné
      const selectedMarker = markersRef.current.find(marker => {
        const markerPos = marker.getPosition()
        return markerPos && 
               Math.abs(markerPos.lat() - position.lat) < 0.0001 && 
               Math.abs(markerPos.lng() - position.lng) < 0.0001
      })

      if (selectedMarker && infoWindowRef.current) {
        // Simuler un clic sur le marqueur
        google.maps.event.trigger(selectedMarker, 'click')
      }
    }
  }, [selectedProfessional])

  if (mapError) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Carte indisponible</h3>
          <p className="text-sm text-muted-foreground mb-4">{mapError}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            size="sm"
          >
            Réessayer
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-96 bg-gray-100"
          style={{ minHeight: '400px' }}
        />
        
        {!isMapLoaded && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
            </div>
          </div>
        )}

        {/* Informations sur la carte */}
        {isMapLoaded && (
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{professionals.length}</span>
              <span className="text-gray-600">
                professionnel{professionals.length > 1 ? 's' : ''} affiché{professionals.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Contrôles additionnels */}
        {isMapLoaded && (
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                if (navigator.geolocation && mapInstanceRef.current) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                      }
                      mapInstanceRef.current!.setCenter(userLocation)
                      mapInstanceRef.current!.setZoom(12)
                    },
                    (error) => {
                      console.error('Erreur de géolocalisation:', error)
                    }
                  )
                }
              }}
              className="bg-white hover:bg-gray-50 text-gray-700 shadow-md"
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}