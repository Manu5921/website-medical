'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AddressAutocomplete, AddressData } from '@/components/ui/address-autocomplete'
import { AddressInputFallback } from '@/components/ui/address-input-fallback'
import { Loader2, Mail } from 'lucide-react'
import { Profession } from '@/types'
import { validateRPPS, getProfessionLabel } from '@/lib/utils'

const registerSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  profession: z.string().min(1, 'Veuillez sélectionner une profession'),
  rppsNumber: z.string().refine(validateRPPS, 'Numéro RPPS invalide (11 chiffres requis)'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  address: z.string().min(5, 'Adresse requise'),
  city: z.string().min(2, 'Ville requise'),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  bio: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

type RegisterForm = z.infer<typeof registerSchema>

const professions: Profession[] = [
  'infirmier',
  'kinesitherapeute',
  'medecin',
  'sage_femme',
  'psychologue',
  'orthophoniste',
  'ergotherapeute',
  'podologue',
  'dieteticien',
  'osteopathe',
]

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Gérer la sélection d'adresse avec géocodage
  const handleAddressSelect = (addressData: AddressData) => {
    form.setValue('address', addressData.formatted_address)
    form.setValue('city', addressData.locality)
    form.setValue('postalCode', addressData.postal_code)
    form.setValue('latitude', addressData.latitude)
    form.setValue('longitude', addressData.longitude)
    
    // Effacer les erreurs d'adresse une fois qu'une adresse valide est sélectionnée
    form.clearErrors(['address', 'city', 'postalCode'])
  }

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      profession: '',
      rppsNumber: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      latitude: undefined,
      longitude: undefined,
      bio: '',
    },
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    setError(null)

    try {
      // Create auth user with email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/confirm`,
          data: {
            registration_data: {
              firstName: data.firstName,
              lastName: data.lastName,
              profession: data.profession,
              rppsNumber: data.rppsNumber,
              phone: data.phone,
              address: data.address,
              city: data.city,
              postalCode: data.postalCode,
              latitude: data.latitude,
              longitude: data.longitude,
              bio: data.bio,
            }
          }
        }
      })

      if (authError) {
        setError(authError.message)
        return
      }

      if (!authData.user) {
        setError('Erreur lors de la création du compte')
        return
      }

      // Stocker les données d'inscription dans les métadonnées utilisateur
      // Le profil sera créé après confirmation de l'email
      setUserEmail(data.email)
      setShowEmailConfirmation(true)
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  // Affichage de confirmation d'email
  if (showEmailConfirmation) {
    return (
      <Card className="shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Vérifiez votre email
          </CardTitle>
          <CardDescription>
            Un email de confirmation a été envoyé
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-50 text-blue-800 border-blue-200">
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Nous avons envoyé un email de confirmation à <strong>{userEmail}</strong>. 
              Cliquez sur le lien dans l'email pour activer votre compte.
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Vérifiez également votre dossier spam/courrier indésirable</p>
            <p>• Le lien expire dans 24 heures</p>
            <p>• Après confirmation, vous pourrez vous connecter</p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={() => {
                setShowEmailConfirmation(false)
                form.reset()
              }}
              variant="outline"
              className="w-full"
            >
              Modifier l'email
            </Button>
            
            <Button asChild className="w-full">
              <Link href="/login">
                Aller à la connexion
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Créer un compte
        </CardTitle>
        <CardDescription className="text-center">
          Rejoignez le réseau des professionnels de santé
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                placeholder="Prénom"
                {...form.register('firstName')}
                disabled={isLoading}
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                placeholder="Nom"
                {...form.register('lastName')}
                disabled={isLoading}
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              {...form.register('email')}
              disabled={isLoading}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...form.register('password')}
                disabled={isLoading}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...form.register('confirmPassword')}
                disabled={isLoading}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profession">Profession</Label>
              <Select onValueChange={(value) => form.setValue('profession', value)} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {professions.map((profession) => (
                    <SelectItem key={profession} value={profession}>
                      {getProfessionLabel(profession)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.profession && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.profession.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rppsNumber">N° RPPS</Label>
              <Input
                id="rppsNumber"
                placeholder="12345678901"
                {...form.register('rppsNumber')}
                disabled={isLoading}
              />
              {form.formState.errors.rppsNumber && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.rppsNumber.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              placeholder="0123456789"
              {...form.register('phone')}
              disabled={isLoading}
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-600">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && 
           process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== 'placeholder_google_maps_key' ? (
            <>
              <AddressAutocomplete
                label="Adresse du cabinet"
                placeholder="Commencez à saisir l'adresse de votre cabinet..."
                value={form.watch('address') || ''}
                onAddressSelect={handleAddressSelect}
                onInputChange={(value) => form.setValue('address', value)}
                error={form.formState.errors.address?.message}
                required
                disabled={isLoading}
                className="space-y-2"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    placeholder="Ville (rempli automatiquement)"
                    {...form.register('city')}
                    disabled={isLoading}
                    readOnly
                    className="bg-muted"
                  />
                  {form.formState.errors.city && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input
                    id="postalCode"
                    placeholder="Code postal (rempli automatiquement)"
                    {...form.register('postalCode')}
                    disabled={isLoading}
                    readOnly
                    className="bg-muted"
                  />
                  {form.formState.errors.postalCode && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.postalCode.message}
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <AddressInputFallback
              onAddressChange={(value) => form.setValue('address', value)}
              onCityChange={(value) => form.setValue('city', value)}
              onPostalCodeChange={(value) => form.setValue('postalCode', value)}
              error={form.formState.errors.address?.message}
              disabled={isLoading}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="bio">Présentation (optionnel)</Label>
            <Textarea
              id="bio"
              placeholder="Décrivez votre expérience et vos spécialisations..."
              {...form.register('bio')}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer mon compte
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Déjà un compte ?{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}