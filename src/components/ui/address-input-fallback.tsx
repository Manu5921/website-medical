'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AddressInputFallbackProps {
  onAddressChange: (address: string) => void
  onCityChange: (city: string) => void
  onPostalCodeChange: (postalCode: string) => void
  error?: string
  disabled?: boolean
}

export function AddressInputFallback({
  onAddressChange,
  onCityChange,
  onPostalCodeChange,
  error,
  disabled = false
}: AddressInputFallbackProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address">Adresse du cabinet</Label>
        <Input
          id="address"
          placeholder="123 Rue de la Santé"
          onChange={(e) => onAddressChange(e.target.value)}
          disabled={disabled}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input
            id="city"
            placeholder="Paris"
            onChange={(e) => onCityChange(e.target.value)}
            disabled={disabled}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="postalCode">Code postal</Label>
          <Input
            id="postalCode"
            placeholder="75001"
            onChange={(e) => onPostalCodeChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}