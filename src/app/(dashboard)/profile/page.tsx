'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, User, Mail, Phone, MapPin, FileText, Building } from 'lucide-react'
import { Professional, Profession } from '@/types'
import AvailabilitySettings from '@/components/professionals/AvailabilitySettings'
import AvatarUpload from '@/components/professionals/AvatarUpload'

const profileSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),
  profession: z.enum(['medecin', 'infirmier', 'kinesitherapeute', 'pharmacien', 'dentiste', 'sage_femme', 'psychologue', 'orthophoniste', 'ergotherapeute', 'podologue', 'dieteticien', 'osteopathe'] as const),
  rppsNumber: z.string().regex(/^\d{11}$/, 'Le numéro RPPS doit contenir 11 chiffres'),
  address: z.string().min(5, 'Adresse requise'),
  city: z.string().min(2, 'Ville requise'),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
  bio: z.string().max(500, 'La biographie ne doit pas dépasser 500 caractères').optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  const profession = watch('profession')

  useEffect(() => {
    fetchProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setProfessional(data)
        // Pré-remplir le formulaire
        setValue('firstName', data.firstName)
        setValue('lastName', data.lastName)
        setValue('email', data.email)
        setValue('phone', data.phone)
        setValue('profession', data.profession)
        setValue('rppsNumber', data.rppsNumber)
        setValue('address', data.address)
        setValue('city', data.city)
        setValue('postalCode', data.postalCode)
        setValue('bio', data.bio || '')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setUpdating(true)
      setError(null)
      setSuccess(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        profession: data.profession,
        rppsNumber: data.rppsNumber,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        bio: data.bio || null,
        updatedAt: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('professionals')
        .update(updateData)
        .eq('id', user.id)

      if (error) throw error

      // Si l'email a changé, mettre à jour l'authentification
      if (data.email !== professional?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        })
        if (emailError) throw emailError
      }

      setSuccess('Profil mis à jour avec succès')
      fetchProfile() // Recharger le profil
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Photo de profil</CardTitle>
            <CardDescription>
              Ajoutez une photo pour personnaliser votre profil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarUpload
              currentAvatarUrl={professional?.avatar_url}
              firstName={watch('firstName') || ''}
              lastName={watch('lastName') || ''}
              onUploadSuccess={() => fetchProfile()}
            />
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
          <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>
              Gérez vos informations personnelles et professionnelles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  <User className="w-4 h-4 inline mr-2" />
                  Prénom
                </Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  placeholder="Jean"
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  <User className="w-4 h-4 inline mr-2" />
                  Nom
                </Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  placeholder="Dupont"
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="jean.dupont@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="w-4 h-4 inline mr-2" />
                Téléphone
              </Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="06 12 34 56 78"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations professionnelles</CardTitle>
            <CardDescription>
              Vos informations professionnelles et numéro RPPS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profession">
                  <Building className="w-4 h-4 inline mr-2" />
                  Profession
                </Label>
                <Select
                  value={profession}
                  onValueChange={(value) => setValue('profession', value as Profession)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre profession" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medecin">Médecin</SelectItem>
                    <SelectItem value="infirmier">Infirmier(ère)</SelectItem>
                    <SelectItem value="kinesitherapeute">Kinésithérapeute</SelectItem>
                    <SelectItem value="pharmacien">Pharmacien(ne)</SelectItem>
                    <SelectItem value="dentiste">Dentiste</SelectItem>
                    <SelectItem value="sage_femme">Sage-femme</SelectItem>
                    <SelectItem value="psychologue">Psychologue</SelectItem>
                    <SelectItem value="orthophoniste">Orthophoniste</SelectItem>
                    <SelectItem value="ergotherapeute">Ergothérapeute</SelectItem>
                    <SelectItem value="podologue">Podologue</SelectItem>
                    <SelectItem value="dieteticien">Diététicien(ne)</SelectItem>
                    <SelectItem value="osteopathe">Ostéopathe</SelectItem>
                  </SelectContent>
                </Select>
                {errors.profession && (
                  <p className="text-sm text-destructive">{errors.profession.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rppsNumber">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Numéro RPPS
                </Label>
                <Input
                  id="rppsNumber"
                  {...register('rppsNumber')}
                  placeholder="12345678901"
                  maxLength={11}
                />
                {errors.rppsNumber && (
                  <p className="text-sm text-destructive">{errors.rppsNumber.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">
                <FileText className="w-4 h-4 inline mr-2" />
                Biographie (optionnel)
              </Label>
              <Textarea
                id="bio"
                {...register('bio')}
                placeholder="Décrivez votre parcours et vos spécialités..."
                rows={4}
                className="resize-none"
              />
              {errors.bio && (
                <p className="text-sm text-destructive">{errors.bio.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adresse du cabinet</CardTitle>
            <CardDescription>
              L&apos;adresse où vous exercez votre activité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">
                <MapPin className="w-4 h-4 inline mr-2" />
                Adresse
              </Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="123 rue de la Santé"
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Ville
                </Label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="Paris"
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Code postal
                </Label>
                <Input
                  id="postalCode"
                  {...register('postalCode')}
                  placeholder="75001"
                  maxLength={5}
                />
                {errors.postalCode && (
                  <p className="text-sm text-destructive">{errors.postalCode.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <AvailabilitySettings />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={updating}>
            {updating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mise à jour...
              </>
            ) : (
              'Enregistrer les modifications'
            )}
          </Button>
        </div>
      </form>
      </div>
    </div>
  )
}