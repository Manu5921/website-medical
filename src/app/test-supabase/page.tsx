'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestSupabasePage() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const runTests = async () => {
    setLoading(true)
    setResults([])
    const testResults: string[] = []

    // Test 1: Check environment variables
    testResults.push('=== Test 1: Environment Variables ===')
    testResults.push(`SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`)
    testResults.push(`SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`)
    testResults.push(`URL Length: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0}`)
    testResults.push(`Key Length: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0}`)

    // Test 2: Auth status
    testResults.push('\n=== Test 2: Auth Status ===')
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        testResults.push(`❌ Auth Error: ${error.message}`)
      } else if (user) {
        testResults.push(`✅ Logged in as: ${user.email}`)
        testResults.push(`User ID: ${user.id}`)
      } else {
        testResults.push('❌ Not logged in')
      }
    } catch (e) {
      testResults.push(`❌ Auth Exception: ${e}`)
    }

    // Test 3: Simple query
    testResults.push('\n=== Test 3: Simple Query (professionals count) ===')
    try {
      const { count, error } = await supabase
        .from('professionals')
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        testResults.push(`❌ Query Error: ${error.message}`)
        testResults.push(`Error Code: ${error.code}`)
        testResults.push(`Error Details: ${JSON.stringify(error)}`)
      } else {
        testResults.push(`✅ Professionals count: ${count}`)
      }
    } catch (e) {
      testResults.push(`❌ Query Exception: ${e}`)
    }

    // Test 4: Fetch single professional
    testResults.push('\n=== Test 4: Fetch First Professional ===')
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('id, email, first_name, last_name')
        .limit(1)
        .single()
      
      if (error) {
        testResults.push(`❌ Fetch Error: ${error.message}`)
        testResults.push(`Error Code: ${error.code}`)
      } else if (data) {
        testResults.push(`✅ Found: ${data.first_name} ${data.last_name}`)
        testResults.push(`ID: ${data.id}`)
      }
    } catch (e) {
      testResults.push(`❌ Fetch Exception: ${e}`)
    }

    // Test 5: Check if tables exist
    testResults.push('\n=== Test 5: Check Tables ===')
    const tables = ['professionals', 'appointments', 'availabilities', 'blocked_slots']
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('id').limit(1)
        if (error) {
          testResults.push(`❌ Table '${table}': ${error.message}`)
        } else {
          testResults.push(`✅ Table '${table}': Accessible`)
        }
      } catch (e) {
        testResults.push(`❌ Table '${table}': Exception - ${e}`)
      }
    }

    setResults(testResults)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Supabase Connection</CardTitle>
            <CardDescription>
              Diagnostic page to test Supabase connectivity and configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runTests} disabled={loading}>
              {loading ? 'Running tests...' : 'Run Tests'}
            </Button>
            
            {results.length > 0 && (
              <pre className="mt-4 p-4 bg-gray-100 rounded-lg overflow-x-auto text-sm">
                {results.join('\n')}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}