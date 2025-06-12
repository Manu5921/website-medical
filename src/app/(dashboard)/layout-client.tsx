'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'
import { Loader2 } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { Professional } from '@/types'

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [professional, setProfessional] = useState<Professional | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        setUser(user)

        // Get professional profile
        const { data: prof } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!prof) {
          router.push('/register?step=complete')
          return
        }

        setProfessional(prof)
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user || !professional) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} professional={professional} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}