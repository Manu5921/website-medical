import { Loader } from '@googlemaps/js-api-loader'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

let googleMapsLoader: Loader | null = null
let isLoaded = false

export function getGoogleMapsLoader(): Loader {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured')
  }

  if (!googleMapsLoader) {
    googleMapsLoader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry']
    })
  }

  return googleMapsLoader
}

export async function loadGoogleMaps(): Promise<typeof google.maps> {
  if (isLoaded && window.google?.maps) {
    return window.google.maps
  }

  const loader = getGoogleMapsLoader()
  await loader.load()
  isLoaded = true
  
  return window.google.maps
}

export function isGoogleMapsLoaded(): boolean {
  return isLoaded && !!window.google?.maps
}

// Types utilitaires
export interface AddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

export interface GeocodeResult {
  address_components: AddressComponent[]
  formatted_address: string
  geometry: {
    location: google.maps.LatLng
    location_type: string
    viewport: google.maps.LatLngBounds
  }
  place_id: string
  types: string[]
}

// Fonction pour extraire les composants d'adresse
export function parseAddressComponents(components: AddressComponent[]) {
  const result = {
    street_number: '',
    route: '',
    locality: '',
    postal_code: '',
    country: '',
    administrative_area_level_1: '', // Région
    administrative_area_level_2: ''  // Département
  }

  components.forEach(component => {
    const types = component.types
    
    if (types.includes('street_number')) {
      result.street_number = component.long_name
    } else if (types.includes('route')) {
      result.route = component.long_name
    } else if (types.includes('locality') || types.includes('postal_town')) {
      result.locality = component.long_name
    } else if (types.includes('postal_code')) {
      result.postal_code = component.long_name
    } else if (types.includes('country')) {
      result.country = component.long_name
    } else if (types.includes('administrative_area_level_1')) {
      result.administrative_area_level_1 = component.long_name
    } else if (types.includes('administrative_area_level_2')) {
      result.administrative_area_level_2 = component.long_name
    }
  })

  return result
}

// Fonction pour calculer la distance entre deux points
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  if (!isGoogleMapsLoaded()) {
    // Fallback avec formule de Haversine
    const R = 6371 // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Utiliser Google Maps pour plus de précision
  const from = new google.maps.LatLng(lat1, lng1)
  const to = new google.maps.LatLng(lat2, lng2)
  return google.maps.geometry.spherical.computeDistanceBetween(from, to) / 1000 // en km
}

// Géocodage d'une adresse
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  try {
    const maps = await loadGoogleMaps()
    const geocoder = new maps.Geocoder()
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0] as GeocodeResult)
        } else if (status === 'ZERO_RESULTS') {
          resolve(null)
        } else {
          reject(new Error(`Geocoding failed: ${status}`))
        }
      })
    })
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

// Géocodage inverse (coordonnées → adresse)
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  try {
    const maps = await loadGoogleMaps()
    const geocoder = new maps.Geocoder()
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0] as GeocodeResult)
        } else if (status === 'ZERO_RESULTS') {
          resolve(null)
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`))
        }
      })
    })
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}