'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Navigation, Car, MapPin, ExternalLink } from 'lucide-react'
import { Professional } from '@/types'

interface DirectionsButtonProps {
  professional: Professional
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export default function DirectionsButton({ 
  professional, 
  variant = 'outline', 
  size = 'sm',
  className 
}: DirectionsButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Construire l'adresse complète
  const getFullAddress = () => {
    const parts = []
    if (professional.address) parts.push(professional.address)
    if (professional.city) parts.push(professional.city)
    if (professional.postal_code) parts.push(professional.postal_code)
    return parts.join(', ')
  }

  const fullAddress = getFullAddress()
  
  // URLs pour différents services de navigation
  const getDirectionsUrl = (service: 'google' | 'apple' | 'waze') => {
    const encodedAddress = encodeURIComponent(fullAddress)
    
    switch (service) {
      case 'google':
        return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`
      case 'apple':
        return `http://maps.apple.com/?daddr=${encodedAddress}`
      case 'waze':
        return `https://waze.com/ul?q=${encodedAddress}`
      default:
        return ''
    }
  }

  // Détection mobile pour choisir l'app appropriée
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  const handleDirections = (service: 'google' | 'apple' | 'waze') => {
    const url = getDirectionsUrl(service)
    window.open(url, '_blank')
    setIsOpen(false)
  }

  // Si pas d'adresse, ne pas afficher le bouton
  if (!fullAddress) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Navigation className="h-4 w-4 mr-2" />
          Itinéraire
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="p-2 border-b">
          <p className="text-xs font-medium text-gray-900">Naviguer vers :</p>
          <p className="text-xs text-gray-500 truncate">{fullAddress}</p>
        </div>
        
        <DropdownMenuItem onClick={() => handleDirections('google')}>
          <div className="flex items-center w-full">
            <div className="w-4 h-4 mr-2 flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
            <span>Google Maps</span>
            <ExternalLink className="h-3 w-3 ml-auto" />
          </div>
        </DropdownMenuItem>

        {isMobile() && (
          <DropdownMenuItem onClick={() => handleDirections('apple')}>
            <div className="flex items-center w-full">
              <MapPin className="h-4 w-4 mr-2" />
              <span>Apple Plans</span>
              <ExternalLink className="h-3 w-3 ml-auto" />
            </div>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => handleDirections('waze')}>
          <div className="flex items-center w-full">
            <Car className="h-4 w-4 mr-2" />
            <span>Waze</span>
            <ExternalLink className="h-3 w-3 ml-auto" />
          </div>
        </DropdownMenuItem>

        <div className="border-t pt-1">
          <DropdownMenuItem 
            onClick={() => {
              navigator.clipboard.writeText(fullAddress)
              setIsOpen(false)
            }}
          >
            <div className="flex items-center w-full">
              <MapPin className="h-4 w-4 mr-2" />
              <span>Copier l&apos;adresse</span>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}