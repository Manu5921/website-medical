'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Test406Page() {
  const [results, setResults] = useState<any[]>([])
  const professionalId = '4a3d2043-a890-4d29-b929-7bcb2da0a7d0'

  const addResult = (test: string, result: any) => {
    setResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }])
  }

  const runTests = async () => {
    setResults([])
    
    // Test 1: Direct Supabase client query
    try {
      addResult('Test 1: Starting direct Supabase query', { status: 'running' })
      const supabase = createClient()
      const { data, error, status, statusText } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', professionalId)
        .single()
      
      addResult('Test 1: Direct Supabase query', {
        success: !error,
        data: data,
        error: error,
        status: status,
        statusText: statusText
      })
    } catch (e) {
      addResult('Test 1: Direct Supabase query', {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      })
    }

    // Test 2: API endpoint with explicit headers
    try {
      addResult('Test 2: Starting API call', { status: 'running' })
      const response = await fetch(`/api/professionals/${professionalId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
      
      const responseData = await response.json()
      
      addResult('Test 2: API endpoint call', {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      })
    } catch (e) {
      addResult('Test 2: API endpoint call', {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      })
    }

    // Test 3: Check if professional exists
    try {
      addResult('Test 3: Starting existence check', { status: 'running' })
      const supabase = createClient()
      const { count, error } = await supabase
        .from('professionals')
        .select('*', { count: 'exact', head: true })
        .eq('id', professionalId)
      
      addResult('Test 3: Professional existence check', {
        success: !error,
        exists: count ? count > 0 : false,
        count: count,
        error: error
      })
    } catch (e) {
      addResult('Test 3: Professional existence check', {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      })
    }

    // Test 4: Simple query without relationships
    try {
      addResult('Test 4: Starting simple query', { status: 'running' })
      const supabase = createClient()
      const { data, error } = await supabase
        .from('professionals')
        .select('id, email, first_name, last_name')
        .eq('id', professionalId)
        .single()
      
      addResult('Test 4: Simple query', {
        success: !error,
        data: data,
        error: error
      })
    } catch (e) {
      addResult('Test 4: Simple query', {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      })
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">406 Error Diagnostic</h1>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Testing professional ID: <code className="bg-gray-100 px-1">{professionalId}</code>
        </p>
        <button
          onClick={runTests}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Run Tests
        </button>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="border rounded p-4 bg-gray-50">
            <h3 className="font-semibold mb-2">{result.test}</h3>
            <pre className="text-xs overflow-auto bg-white p-2 rounded">
              {JSON.stringify(result.result, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}