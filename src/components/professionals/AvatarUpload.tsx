'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Camera, X } from 'lucide-react'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  firstName: string
  lastName: string
  onUploadSuccess?: (url: string) => void
}

export default function AvatarUpload({ 
  currentAvatarUrl, 
  firstName, 
  lastName,
  onUploadSuccess 
}: AvatarUploadProps) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl)
  const [error, setError] = useState<string | null>(null)

  const getInitials = () => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null)
      const file = event.target.files?.[0]
      if (!file) return

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image')
        return
      }

      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'image ne doit pas dépasser 5MB')
        return
      }

      setUploading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload du fichier vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Mettre à jour le profil avec la nouvelle URL
      const { error: updateError } = await supabase
        .from('professionals')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      onUploadSuccess?.(publicUrl)

      // Supprimer l'ancienne image si elle existe
      if (currentAvatarUrl) {
        const oldFileName = currentAvatarUrl.split('/').pop()
        if (oldFileName) {
          await supabase.storage
            .from('avatars')
            .remove([`avatars/${oldFileName}`])
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeAvatar = async () => {
    try {
      setError(null)
      setUploading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      // Supprimer l'avatar du profil
      const { error: updateError } = await supabase
        .from('professionals')
        .update({ avatar_url: null })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Supprimer le fichier du storage
      if (avatarUrl) {
        const fileName = avatarUrl.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('avatars')
            .remove([`avatars/${fileName}`])
        }
      }

      setAvatarUrl(null)
      onUploadSuccess?.('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-32 w-32">
          <AvatarImage src={avatarUrl || ''} alt="Photo de profil" />
          <AvatarFallback className="text-2xl">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        {avatarUrl && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-8 w-8"
            onClick={removeAvatar}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Upload en cours...
          </>
        ) : (
          <>
            <Camera className="mr-2 h-4 w-4" />
            {avatarUrl ? 'Changer la photo' : 'Ajouter une photo'}
          </>
        )}
      </Button>

      {error && (
        <Alert variant="destructive" className="max-w-sm">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <p className="text-sm text-muted-foreground text-center">
        Format accepté : JPG, PNG. Taille max : 5MB
      </p>
    </div>
  )
}