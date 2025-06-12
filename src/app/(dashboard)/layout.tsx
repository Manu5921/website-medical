import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get professional profile
  const { data: professional } = await supabase
    .from('professionals')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!professional) {
    // User exists but no professional profile - redirect to complete registration
    redirect('/register?step=complete')
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