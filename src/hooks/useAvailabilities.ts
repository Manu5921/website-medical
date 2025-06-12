'use client'

import { useState, useEffect, useCallback } from 'react'

interface Availability {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

interface BlockedSlot {
  id: string
  startDatetime: string
  endDatetime: string
  reason: string
}

interface UseAvailabilitiesResult {
  availabilities: Availability[]
  blockedSlots: BlockedSlot[]
  loading: boolean
  saving: boolean
  error: string | null
  saveAvailabilities: (availabilities: Availability[]) => Promise<boolean>
  addBlockedSlot: (slot: Omit<BlockedSlot, 'id'>) => Promise<boolean>
  removeBlockedSlot: (slotId: string) => Promise<boolean>
  refresh: () => Promise<void>
}

export function useAvailabilities(professionalId: string): UseAvailabilitiesResult {
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAvailabilities = useCallback(async () => {
    if (!professionalId) return

    try {
      setLoading(true)
      setError(null)

      const [availResponse, blockedResponse] = await Promise.all([
        fetch(`/api/professionals/${professionalId}/availabilities`),
        fetch(`/api/professionals/${professionalId}/blocked-slots`)
      ])

      if (!availResponse.ok || !blockedResponse.ok) {
        throw new Error('Erreur lors de la récupération des données')
      }

      const [availData, blockedData] = await Promise.all([
        availResponse.json(),
        blockedResponse.json()
      ])

      setAvailabilities(availData.availabilities.map((item: {
        id: string
        day_of_week: number
        start_time: string
        end_time: string
        is_active: boolean
      }) => ({
        id: item.id,
        dayOfWeek: item.day_of_week,
        startTime: item.start_time,
        endTime: item.end_time,
        isActive: item.is_active
      })))

      setBlockedSlots(blockedData.blockedSlots.map((item: {
        id: string
        start_datetime: string
        end_datetime: string
        reason: string
      }) => ({
        id: item.id,
        startDatetime: item.start_datetime,
        endDatetime: item.end_datetime,
        reason: item.reason
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }, [professionalId])

  const saveAvailabilities = useCallback(async (newAvailabilities: Availability[]): Promise<boolean> => {
    if (!professionalId) return false

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/professionals/${professionalId}/availabilities`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          availabilities: newAvailabilities
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la sauvegarde')
      }

      const data = await response.json()
      setAvailabilities(data.availabilities.map((item: {
        id: string
        day_of_week: number
        start_time: string
        end_time: string
        is_active: boolean
      }) => ({
        id: item.id,
        dayOfWeek: item.day_of_week,
        startTime: item.start_time,
        endTime: item.end_time,
        isActive: item.is_active
      })))

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      return false
    } finally {
      setSaving(false)
    }
  }, [professionalId])

  const addBlockedSlot = useCallback(async (slot: Omit<BlockedSlot, 'id'>): Promise<boolean> => {
    if (!professionalId) return false

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/professionals/${professionalId}/blocked-slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slot),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la création du créneau bloqué')
      }

      await fetchAvailabilities() // Rafraîchir les données
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      return false
    } finally {
      setSaving(false)
    }
  }, [professionalId, fetchAvailabilities])

  const removeBlockedSlot = useCallback(async (slotId: string): Promise<boolean> => {
    if (!professionalId) return false

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/professionals/${professionalId}/blocked-slots?slotId=${slotId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression du créneau')
      }

      setBlockedSlots(prev => prev.filter(slot => slot.id !== slotId))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      return false
    } finally {
      setSaving(false)
    }
  }, [professionalId])

  useEffect(() => {
    fetchAvailabilities()
  }, [fetchAvailabilities])

  return {
    availabilities,
    blockedSlots,
    loading,
    saving,
    error,
    saveAvailabilities,
    addBlockedSlot,
    removeBlockedSlot,
    refresh: fetchAvailabilities
  }
}