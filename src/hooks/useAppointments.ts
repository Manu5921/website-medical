'use client'

import { useState, useEffect, useCallback } from 'react'
import { Appointment } from '@/types'

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

interface SearchFilters {
  status?: AppointmentStatus
  requester_id?: string
  provider_id?: string
  date_from?: string
  date_to?: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

interface UseAppointmentsResult {
  appointments: Appointment[]
  loading: boolean
  error: string | null
  pagination: PaginationInfo | null
  search: (filters: SearchFilters, page?: number) => Promise<void>
  refresh: () => Promise<void>
  createAppointment: (data: CreateAppointmentData) => Promise<Appointment | null>
  updateAppointment: (id: string, data: UpdateAppointmentData) => Promise<Appointment | null>
  deleteAppointment: (id: string) => Promise<boolean>
}

interface CreateAppointmentData {
  provider_id: string
  patient_first_name: string
  patient_last_name: string
  patient_phone: string
  reason: string
  appointment_date: string
  appointment_time: string
  duration?: number
  notes?: string
}

interface UpdateAppointmentData {
  status?: AppointmentStatus
  appointment_date?: string
  appointment_time?: string
  duration?: number
  notes?: string
  reason?: string
}

export function useAppointments(initialFilters?: SearchFilters): UseAppointmentsResult {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>(initialFilters || {})

  const fetchAppointments = useCallback(async (filters: SearchFilters, page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      Object.entries({ ...filters, page: page.toString() }).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/appointments?${queryParams}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération des rendez-vous')
      }

      setAppointments(data.appointments)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setAppointments([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const search = useCallback(async (filters: SearchFilters, page = 1) => {
    setCurrentFilters(filters)
    await fetchAppointments(filters, page)
  }, [fetchAppointments])

  const refresh = useCallback(async () => {
    await fetchAppointments(currentFilters)
  }, [fetchAppointments, currentFilters])

  const createAppointment = useCallback(async (data: CreateAppointmentData): Promise<Appointment | null> => {
    try {
      setError(null)

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création du rendez-vous')
      }

      // Rafraîchir la liste
      await refresh()
      
      return result.appointment
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      return null
    }
  }, [refresh])

  const updateAppointment = useCallback(async (id: string, data: UpdateAppointmentData): Promise<Appointment | null> => {
    try {
      setError(null)

      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la mise à jour du rendez-vous')
      }

      // Mettre à jour la liste locale
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? result.appointment : apt)
      )
      
      return result.appointment
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      return null
    }
  }, [])

  const deleteAppointment = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null)

      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la suppression du rendez-vous')
      }

      // Supprimer de la liste locale
      setAppointments(prev => prev.filter(apt => apt.id !== id))
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      return false
    }
  }, [])

  useEffect(() => {
    fetchAppointments(currentFilters)
  }, [fetchAppointments, currentFilters])

  return {
    appointments,
    loading,
    error,
    pagination,
    search,
    refresh,
    createAppointment,
    updateAppointment,
    deleteAppointment
  }
}

// Hook pour récupérer un rendez-vous spécifique
interface UseAppointmentResult {
  appointment: Appointment | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  updateAppointment: (data: UpdateAppointmentData) => Promise<Appointment | null>
}

export function useAppointment(id: string): UseAppointmentResult {
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAppointment = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/appointments/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération du rendez-vous')
      }

      setAppointment(data.appointment)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setAppointment(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  const updateAppointment = useCallback(async (data: UpdateAppointmentData): Promise<Appointment | null> => {
    try {
      setError(null)

      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la mise à jour du rendez-vous')
      }

      setAppointment(result.appointment)
      return result.appointment
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      return null
    }
  }, [id])

  useEffect(() => {
    fetchAppointment()
  }, [fetchAppointment])

  return {
    appointment,
    loading,
    error,
    refresh: fetchAppointment,
    updateAppointment
  }
}