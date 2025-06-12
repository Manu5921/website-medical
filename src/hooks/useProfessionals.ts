'use client'

import { useState, useEffect, useCallback } from 'react'
import { Professional } from '@/types'

interface SearchParams {
  profession?: string
  city?: string
  postalCode?: string
  search?: string
  latitude?: number
  longitude?: number
  radius?: number
  page?: number
  limit?: number
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

interface UseProfessionalsResult {
  professionals: (Professional & { distance?: number })[]
  loading: boolean
  error: string | null
  pagination: PaginationInfo | null
  search: (params: SearchParams) => Promise<void>
  refresh: () => Promise<void>
}

export function useProfessionals(initialParams?: SearchParams): UseProfessionalsResult {
  const [professionals, setProfessionals] = useState<(Professional & { distance?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [currentParams, setCurrentParams] = useState<SearchParams>(initialParams || {})

  const fetchProfessionals = useCallback(async (params: SearchParams) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/professionals?${queryParams}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération des professionnels')
      }

      setProfessionals(data.professionals)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setProfessionals([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const search = useCallback(async (params: SearchParams) => {
    setCurrentParams(params)
    await fetchProfessionals(params)
  }, [fetchProfessionals])

  const refresh = useCallback(async () => {
    await fetchProfessionals(currentParams)
  }, [fetchProfessionals, currentParams])

  useEffect(() => {
    fetchProfessionals(currentParams)
  }, [fetchProfessionals, currentParams])

  return {
    professionals,
    loading,
    error,
    pagination,
    search,
    refresh
  }
}

// Hook pour récupérer un professionnel spécifique
interface UseProfessionalResult {
  professional: Professional | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useProfessional(id: string): UseProfessionalResult {
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfessional = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/professionals/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération du professionnel')
      }

      setProfessional(data.professional)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setProfessional(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProfessional()
  }, [fetchProfessional])

  return {
    professional,
    loading,
    error,
    refresh: fetchProfessional
  }
}