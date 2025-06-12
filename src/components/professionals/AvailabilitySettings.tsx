'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Clock, Plus, Trash2 } from 'lucide-react'

interface Availability {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 0, label: 'Dimanche' },
]

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = i % 2 === 0 ? '00' : '30'
  return `${hour.toString().padStart(2, '0')}:${minute}`
})

export default function AvailabilitySettings() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchAvailabilities()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAvailabilities = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('availabilities')
        .select('*')
        .eq('professional_id', user.id)
        .order('day_of_week')

      if (error) throw error

      if (data && data.length > 0) {
        setAvailabilities(data.map(item => ({
          id: item.id,
          dayOfWeek: item.day_of_week,
          startTime: item.start_time,
          endTime: item.end_time,
          isActive: item.is_active
        })))
      } else {
        // Initialiser avec des disponibilités par défaut
        setAvailabilities([
          { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true },
          { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isActive: true },
          { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isActive: true },
          { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isActive: true },
          { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isActive: true },
        ])
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const addAvailability = () => {
    const usedDays = availabilities.map(a => a.dayOfWeek)
    const availableDay = DAYS_OF_WEEK.find(day => !usedDays.includes(day.value))
    
    if (availableDay) {
      setAvailabilities([...availabilities, {
        dayOfWeek: availableDay.value,
        startTime: '09:00',
        endTime: '18:00',
        isActive: true
      }])
    }
  }

  const removeAvailability = (index: number) => {
    setAvailabilities(availabilities.filter((_, i) => i !== index))
  }

  const updateAvailability = (index: number, updates: Partial<Availability>) => {
    setAvailabilities(availabilities.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    ))
  }

  const saveAvailabilities = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Supprimer toutes les disponibilités existantes
      await supabase
        .from('availabilities')
        .delete()
        .eq('professional_id', user.id)

      // Insérer les nouvelles disponibilités
      if (availabilities.length > 0) {
        const { error } = await supabase
          .from('availabilities')
          .insert(
            availabilities.map(availability => ({
              professional_id: user.id,
              day_of_week: availability.dayOfWeek,
              start_time: availability.startTime,
              end_time: availability.endTime,
              is_active: availability.isActive
            }))
          )

        if (error) throw error
      }

      setSuccess('Disponibilités mises à jour avec succès')
      fetchAvailabilities()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horaires de disponibilité</CardTitle>
        <CardDescription>
          Définissez vos horaires de disponibilité pour les prises de rendez-vous
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {availabilities.map((availability, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <Select
                  value={availability.dayOfWeek.toString()}
                  onValueChange={(value) => updateAvailability(index, { dayOfWeek: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(day => (
                      <SelectItem 
                        key={day.value} 
                        value={day.value.toString()}
                        disabled={availabilities.some((a, i) => i !== index && a.dayOfWeek === day.value)}
                      >
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Select
                    value={availability.startTime}
                    onValueChange={(value) => updateAvailability(index, { startTime: value })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map(time => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">à</span>
                  <Select
                    value={availability.endTime}
                    onValueChange={(value) => updateAvailability(index, { endTime: value })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map(time => (
                        <SelectItem 
                          key={time} 
                          value={time}
                          disabled={time <= availability.startTime}
                        >
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`active-${index}`}
                      checked={availability.isActive}
                      onCheckedChange={(checked) => updateAvailability(index, { isActive: checked })}
                    />
                    <Label 
                      htmlFor={`active-${index}`} 
                      className="text-sm cursor-pointer"
                    >
                      Actif
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAvailability(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {availabilities.length < 7 && (
          <Button
            type="button"
            variant="outline"
            onClick={addAvailability}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un créneau
          </Button>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={saveAvailabilities} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer les disponibilités'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}