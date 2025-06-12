'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, Mail } from 'lucide-react'
import { Profession } from '@/types'

type ConfirmationState = 'loading' | 'success' | 'error' | 'already_confirmed'

export default function ConfirmEmailPage() {
  const [state, setState] = useState<ConfirmationState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Récupérer les paramètres de l'URL
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const type = searchParams.get('type')

        if (!accessToken || !refreshToken || type !== 'signup') {
          setState('error')
          setError('Lien de confirmation invalide ou expiré')
          return
        }

        // Confirmer la session avec Supabase
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (sessionError || !sessionData.session?.user) {
          setState('error')
          setError('Impossible de confirmer votre email. Le lien a peut-être expiré.')
          return
        }

        const user = sessionData.session.user
        setUserEmail(user.email || '')

        // Vérifier si le profil professionnel existe déjà
        const { data: existingProfile } = await supabase
          .from('professionals')
          .select('id')
          .eq('id', user.id)
          .single()

        if (existingProfile) {
          // L'utilisateur a déjà un profil, rediriger vers le dashboard
          setState('already_confirmed')
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
          return
        }

        // Récupérer les métadonnées utilisateur stockées lors de l'inscription
        const userMetadata = user.user_metadata

        if (!userMetadata || !userMetadata.registration_data) {
          setState('error')
          setError('Données d&apos;inscription manquantes. Veuillez vous inscrire à nouveau.')
          return
        }

        const registrationData = userMetadata.registration_data

        // Créer le profil professionnel
        const { error: profileError } = await supabase
          .from('professionals')
          .insert({
            id: user.id,
            email: user.email,
            first_name: registrationData.firstName,
            last_name: registrationData.lastName,
            profession: registrationData.profession as Profession,
            rpps_number: registrationData.rppsNumber,
            phone: registrationData.phone,
            address: registrationData.address,
            city: registrationData.city,
            postal_code: registrationData.postalCode,
            latitude: registrationData.latitude || null,
            longitude: registrationData.longitude || null,
            bio: registrationData.bio || null,
          })

        if (profileError) {
          setState('error')
          setError('Erreur lors de la création de votre profil professionnel')
          return
        }

        // Succès - Email confirmé et profil créé
        setState('success')
        
        // Redirection automatique vers le dashboard après 3 secondes
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)

      } catch {
        setState('error')
        setError('Une erreur inattendue est survenue')
      }
    }

    confirmEmail()
  }, [searchParams, supabase, router])

  // État de chargement
  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="shadow-xl max-w-md w-full">
          <CardContent className="pt-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <h2 className="text-xl font-semibold">Confirmation en cours...</h2>
              <p className="text-muted-foreground">
                Vérification de votre email et création de votre profil
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Email déjà confirmé
  if (state === 'already_confirmed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Compte déjà activé
              </CardTitle>
              <CardDescription>
                Votre email est déjà confirmé
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Votre compte est déjà actif. Vous allez être redirigé vers votre dashboard...
                </AlertDescription>
              </Alert>

              <Button asChild className="w-full">
                <Link href="/dashboard">
                  Accéder au dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Succès
  if (state === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Email confirmé !
              </CardTitle>
              <CardDescription>
                Votre compte a été activé avec succès
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Bienvenue sur HealthConnect Pro ! Votre profil professionnel a été créé. 
                  Vous allez être redirigé vers votre dashboard...
                </AlertDescription>
              </Alert>

              <div className="text-sm text-muted-foreground space-y-2">
                <p>✓ Email {userEmail} confirmé</p>
                <p>✓ Profil professionnel créé</p>
                <p>✓ Accès au dashboard autorisé</p>
              </div>

              <Button asChild className="w-full">
                <Link href="/dashboard">
                  Accéder au dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Erreur
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-destructive">
              Erreur de confirmation
            </CardTitle>
            <CardDescription>
              Impossible de confirmer votre email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Une erreur inattendue est survenue lors de la confirmation de votre email.'}
              </AlertDescription>
            </Alert>

            <div className="text-sm text-muted-foreground space-y-2">
              <p>Causes possibles :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Le lien de confirmation a expiré</li>
                <li>Le lien a déjà été utilisé</li>
                <li>Le lien est invalide ou corrompu</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link href="/register">
                  <Mail className="mr-2 h-4 w-4" />
                  Nouvelle inscription
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/login">
                  Essayer de se connecter
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}