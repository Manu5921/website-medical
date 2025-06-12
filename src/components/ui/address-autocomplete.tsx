'use client'

import { useState, useRef, useEffect, forwardRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Loader2 } from 'lucide-react'
import { loadGoogleMaps, parseAddressComponents } from '@/lib/googleMaps'
import { cn } from '@/lib/utils'

export interface AddressData {
  formatted_address: string
  street_number: string
  route: string
  locality: string
  postal_code: string
  country: string
  administrative_area_level_1: string
  administrative_area_level_2: string
  latitude: number
  longitude: number
  place_id: string
}

interface AddressAutocompleteProps {
  label?: string
  placeholder?: string
  value?: string
  onAddressSelect: (address: AddressData) => void
  onInputChange?: (value: string) => void
  error?: string
  className?: string
  required?: boolean
  disabled?: boolean
}

const AddressAutocomplete = forwardRef<HTMLInputElement, AddressAutocompleteProps>(
  ({ 
    label,
    placeholder = "Commencez à saisir votre adresse...",
    value = "",
    onAddressSelect,
    onInputChange,
    error,
    className,
    required = false,
    disabled = false
  }, ref) => {
    const [inputValue, setInputValue] = useState(value)
    const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false)
    
    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
    const placesService = useRef<google.maps.places.PlacesService | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Initialiser Google Maps
    useEffect(() => {
      const initGoogleMaps = async () => {
        try {
          const maps = await loadGoogleMaps()
          autocompleteService.current = new maps.places.AutocompleteService()
          
          // Créer un div temporaire pour PlacesService
          const div = document.createElement('div')
          placesService.current = new maps.places.PlacesService(div)
          
          setIsGoogleMapsReady(true)
        } catch (error) {
          console.error('Erreur lors du chargement de Google Maps:', error)
        }
      }

      initGoogleMaps()
    }, [])

    // Gérer les changements d'input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      onInputChange?.(newValue)

      if (newValue.length > 2 && autocompleteService.current) {
        setIsLoading(true)
        
        autocompleteService.current.getPlacePredictions(
          {
            input: newValue,
            componentRestrictions: { country: 'fr' },
            types: ['address']
          },
          (predictions, status) => {
            setIsLoading(false)
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              setSuggestions(predictions)
              setShowSuggestions(true)
            } else {
              setSuggestions([])
              setShowSuggestions(false)
            }
          }
        )
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }

    // Sélectionner une suggestion
    const handleSuggestionSelect = async (prediction: google.maps.places.AutocompletePrediction) => {
      if (!placesService.current) return

      setInputValue(prediction.description)
      setShowSuggestions(false)
      setIsLoading(true)

      // Obtenir les détails de l'adresse
      placesService.current.getDetails(
        {
          placeId: prediction.place_id,
          fields: ['address_components', 'formatted_address', 'geometry', 'place_id']
        },
        (place, status) => {
          setIsLoading(false)
          
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const addressComponents = parseAddressComponents(
              place.address_components || []
            )
            
            const addressData: AddressData = {
              formatted_address: place.formatted_address || '',
              street_number: addressComponents.street_number,
              route: addressComponents.route,
              locality: addressComponents.locality,
              postal_code: addressComponents.postal_code,
              country: addressComponents.country,
              administrative_area_level_1: addressComponents.administrative_area_level_1,
              administrative_area_level_2: addressComponents.administrative_area_level_2,
              latitude: place.geometry?.location?.lat() || 0,
              longitude: place.geometry?.location?.lng() || 0,
              place_id: place.place_id || ''
            }
            
            onAddressSelect(addressData)
          }
        }
      )
    }

    // Gérer les clics extérieurs
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
          setShowSuggestions(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Synchroniser avec la valeur externe
    useEffect(() => {
      setInputValue(value)
    }, [value])

    return (
      <div className={cn("relative", className)} ref={inputRef}>
        {label && (
          <Label htmlFor="address-autocomplete" className="mb-2">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
          <Input
            ref={ref}
            id="address-autocomplete"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={isGoogleMapsReady ? placeholder : "Chargement..."}
            disabled={disabled || !isGoogleMapsReady}
            className={cn(
              "pr-10",
              error && "border-destructive focus-visible:ring-destructive"
            )}
          />
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <MapPin className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive mt-1">{error}</p>
        )}

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
            <CardContent className="p-0">
              {suggestions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  type="button"
                  onClick={() => handleSuggestionSelect(prediction)}
                  className="w-full p-3 text-left hover:bg-muted transition-colors border-b last:border-b-0 flex items-start gap-2"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm leading-tight">
                      {prediction.structured_formatting.main_text}
                    </div>
                    <div className="text-xs text-muted-foreground leading-tight">
                      {prediction.structured_formatting.secondary_text}
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Message si Google Maps n'est pas disponible */}
        {!isGoogleMapsReady && (
          <p className="text-xs text-muted-foreground mt-1">
            Chargement du service de géolocalisation...
          </p>
        )}
      </div>
    )
  }
)

AddressAutocomplete.displayName = 'AddressAutocomplete'

export { AddressAutocomplete }